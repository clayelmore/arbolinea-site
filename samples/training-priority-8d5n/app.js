// Training priority renderer. All scoring lives in logic.js.
import {
  FACTORS, EFFORT, DEFAULT_WEIGHTS, REASON_TYPES, GROUPS, HINTS, EXAMPLE_COURSES, DIAGRAM_COURSE, CUTOFFS,
  emptyCourse, validateCourse, rankCourses, importCsv, toCsv, sampleCsv, fileProblem, validCapacity, needScore, scoreParts, effortLabel,
  scoreProgress, zoneFor, cardProblems,
} from './logic.js?v=5'; // Raise v when the names imported here change, so a cached logic.js is never paired with a newer app.js.

const KEY = 'tp-state-v1';
const $ = (s) => document.querySelector(s);
let seq = 0;
const newId = () => `c${Date.now().toString(36)}${(seq++).toString(36)}`;

const DATE_REASONS = ['law', 'policy', 'safety', 'audit'];
const RATING_KEYS = ['reach', 'importance', 'out_of_date', 'works', 'effort'];
const asRating = (v) => (Number.isInteger(v) && v >= 1 && v <= 5 ? v : null);
function cleanCourse(c) {
  const base = emptyCourse(typeof c.id === 'string' && c.id ? c.id : newId());
  const out = { ...base, course: String(c.course ?? '').slice(0, 400) };
  for (const k of RATING_KEYS) out[k] = asRating(c[k]);
  out.feedback = c.feedback === 'none' ? 'none' : asRating(c.feedback);
  out.must_change = c.must_change === true;
  out.overlap = c.overlap === true;
  out.reason = REASON_TYPES.some((t) => t.key === c.reason) ? c.reason : '';
  out.reason_note = typeof c.reason_note === 'string' ? c.reason_note : '';
  out.reason_date = typeof c.reason_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.reason_date) && DATE_REASONS.includes(out.reason) ? c.reason_date : '';
  if (Array.isArray(c.csvProblems)) out.csvProblems = c.csvProblems.filter((p) => typeof p === 'string');
  return out;
}
function load() {
  const fresh = () => ({ courses: [], weights: { ...DEFAULT_WEIGHTS }, capacity: '' });
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!s || typeof s !== 'object' || !Array.isArray(s.courses) || !s.weights || typeof s.weights !== 'object') return fresh();
    const weights = {};
    for (const k of Object.keys(DEFAULT_WEIGHTS)) {
      const w = s.weights[k];
      weights[k] = Number.isInteger(w) && w >= 0 && w <= 50 && w % 5 === 0 ? w : DEFAULT_WEIGHTS[k];
    }
    const courses = [];
    for (const c of s.courses) {
      if (!c || typeof c !== 'object' || Array.isArray(c)) continue;
      try { courses.push(cleanCourse(c)); } catch { /* drop this row, keep the rest */ }
    }
    const capacity = validCapacity(s.capacity) ? String(s.capacity).trim() : '';
    return { courses, weights, capacity };
  } catch { return fresh(); }
}
const state = load();

function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* page still works */ } }

function el(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === false || v == null) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) n.append(kid);
  return n;
}

// ---------------------------------------------------------------- guide
function renderGuide() {
  // The five signs show first, closed, as name and question. Each one opens to its details.
  const sign = (f) => {
    const effort = f.key === 'effort';
    return el('details', { class: 'sign' },
      el('summary', {},
        el('span', { class: 'sign-name', text: f.label + (effort ? ' (not scored)' : '') }),
        el('span', { class: 'sign-q', text: f.question }),
        el('span', { class: 'toggle-hint', 'aria-hidden': 'true' })),
      el('p', {}, el('strong', { text: 'Why it counts: ' }), f.why),
      el('p', { class: 'scale-label', text: effort
        ? 'Rating scale: 1 is the least work, 5 is the most.'
        : 'Rating scale: 1 is the least need to update, 5 is the most.' }),
      // The number is a rating badge, not a list number, so the list itself is unnumbered.
      el('ol', { class: 'scale' }, f.anchors.map((a, i) => el('li', {},
        el('span', { class: `rating r${i + 1}`, text: String(i + 1) }), el('span', { text: a })))),
      f.help ? el('p', { class: 'muted', text: f.help }) : null);
  };
  $('#guide').replaceChildren(
    el('p', { text: 'You rate each course from 1 to 5 on these five signs. Open a sign to see why it counts and what each rating means.' }),
    el('ol', { class: 'signs' }, FACTORS.map((f) => el('li', {}, sign(f)))),
    el('p', { text: 'You also rate effort. It helps you plan the work and is not part of the score.' }),
    sign(EFFORT));
}

// ---------------------------------------------------------------- scale bar
const groupLabel = (key) => GROUPS.find((g) => g.key === key).label;
const ZONES = [['later', 0, CUTOFFS.next - 1], ['next', CUTOFFS.next, CUTOFFS.doFirst - 1], ['doFirst', CUTOFFS.doFirst, 100]];
// The 0 to 100 scale with a marker at the score, or a band while the score is still a range.
// zoned draws Later, Next, and Do first by the cutoffs. With a capacity number the groups come from rank, so the bar is plain.
function scaleBar({ score = null, low = null, high = null, zoned = true, slim = false }) {
  const on = score != null && zoned ? zoneFor(score) : null;
  const zones = zoned
    ? ZONES.map(([key, lo, hi]) => el('span', { class: 'sf-zone' + (key === on ? ' on' : ''), style: `width: ${hi - lo + (hi === 100 ? 0 : 1)}%` },
      slim ? null : el('b', { text: groupLabel(key) }), slim ? null : el('i', { text: `${lo} to ${hi}` })))
    : [el('span', { class: 'sf-zone solo', style: 'width: 100%' }, slim ? null : el('b', { text: 'Need score' }), slim ? null : el('i', { text: '0 to 100' }))];
  return el('div', { class: 'sf-scale' + (slim ? ' slim' : '') + (score == null ? ' no-mark' : ''), 'aria-hidden': 'true' },
    zones,
    low != null ? el('span', { class: 'sf-band', style: `left: ${low}%; width: ${high - low}%` }) : null,
    score != null ? el('span', { class: 'sf-mark', style: `left: ${score}%` }, slim ? null : el('b', { text: String(score) })) : null);
}

// ---------------------------------------------------------------- score diagram
// One worked example, drawn from the same functions that score the real list.
function renderDiagram() {
  const c = DIAGRAM_COURSE;
  const parts = scoreParts(c, DEFAULT_WEIGHTS);
  const score = needScore(c, DEFAULT_WEIGHTS);
  const widest = Math.max(...parts.map((p) => p.weight));
  const num = (n) => String(Math.round(n * 100) / 100);
  const zone = groupLabel(zoneFor(score));
  $('#score-diagram').replaceChildren(el('figure', { class: 'score-fig' },
    el('figcaption', { text: 'An example course, scored with the default weights' }),
    el('p', { class: 'sf-step' }, el('strong', { text: '1. Rate. ' }), 'Each sign gets a rating from 1 to 5.'),
    el('p', { class: 'sf-step' }, el('strong', { text: '2. Weigh. ' }), 'A 1 adds nothing. A 5 adds the full weight of that sign.'),
    el('ul', { class: 'sf-rows' }, parts.map((p) => el('li', {},
      el('span', { class: 'sf-name', text: p.label }),
      el('span', { class: 'sf-rate' }, el('span', { class: 'sr-only', text: 'rated ' }), el('span', { class: `rating r${p.rating}`, text: String(p.rating) })),
      el('span', { class: 'sf-track', 'aria-hidden': 'true', style: `width: ${(100 * p.weight) / widest}%` },
        el('span', { class: 'sf-fill', style: `width: ${p.weight ? (100 * p.points) / p.weight : 0}%` })),
      el('span', { class: 'sf-pts' }, el('span', { class: 'sr-only', text: 'adds ' }), `${num(p.points)} of ${p.weight}`)))),
    el('p', { class: 'sf-step' }, el('strong', { text: '3. Add up. ' }),
      `${parts.map((p) => num(p.points)).join(' + ')} = `, el('strong', { class: 'sf-score', text: `need score ${score}` }), ' out of 100.'),
    el('p', { class: 'sf-step' }, el('strong', { text: '4. Place. ' }), `A score of ${score} lands in ${zone}.`),
    scaleBar({ score }),
    el('p', { class: 'sf-note' }, el('strong', { text: 'Effort ' }), `is rated too, but it only shows as a label (here: ${effortLabel(c.effort)}). It never changes the score.`),
    el('p', { class: 'sf-note' }, el('strong', { text: 'Must-change courses ' }), 'skip the score and go to Required, above the list.')));
}

// ---------------------------------------------------------------- editor
function ratingSelect(c, key, label, anchors, withNone = false) {
  const val = c[key];
  return el('label', { class: 'field' }, label,
    el('select', { 'data-field': key },
      el('option', { value: '', selected: val == null, text: 'Choose' }),
      withNone ? el('option', { value: 'none', selected: val === 'none', text: 'No data' }) : null,
      anchors.map((a, i) => el('option', { value: String(i + 1), selected: val === i + 1, text: `${i + 1}: ${a}` }))));
}

const cardTitle = (c) => (c.course || '').trim() || `Course ${state.courses.indexOf(c) + 1}`;

function rowCard(c) {
  return el('div', { class: 'card-row', role: 'group', 'aria-labelledby': `t-${c.id}`, 'data-id': c.id },
    el('h3', { class: 'card-title', id: `t-${c.id}`, text: cardTitle(c) }),
    el('div', { class: 'score-strip' }),
    el('label', { class: 'field' }, 'Course name', el('input', { type: 'text', class: 'name', 'data-field': 'course', value: c.course, maxlength: '120' })),
    el('div', { class: 'ratings' },
      FACTORS.map((f) => ratingSelect(c, f.key, f.label, f.anchors, f.key === 'feedback')),
      ratingSelect(c, 'effort', EFFORT.label, EFFORT.anchors)),
    el('div', { class: 'actions' },
      el('label', { class: 'toggle' }, el('input', { type: 'checkbox', 'data-field': 'overlap', checked: c.overlap }), 'Overlaps another course'),
      el('label', { class: 'toggle' }, el('input', { type: 'checkbox', 'data-field': 'must_change', checked: c.must_change }), 'Must change')),
    el('div', { class: 'reason-fields grid-2', hidden: !c.must_change },
      el('label', { class: 'field' }, 'Reason',
        el('select', { 'data-field': 'reason' },
          el('option', { value: '', selected: !c.reason, text: 'Choose' }),
          REASON_TYPES.map((r) => el('option', { value: r.key, selected: c.reason === r.key, text: r.label })))),
      el('label', { class: 'field date-field', hidden: !DATE_REASONS.includes(c.reason) }, 'Date of the change (if there is one)', el('input', { type: 'date', 'data-field': 'reason_date', value: c.reason_date })),
      el('label', { class: 'field' }, 'Note', el('input', { type: 'text', 'data-field': 'reason_note', value: c.reason_note }))),
    el('ul', { class: 'problems problem', id: `p-${c.id}`, hidden: true }),
    el('div', { class: 'actions' }, el('button', { type: 'button', class: 'secondary', 'data-action': 'delete', 'aria-label': `Remove ${cardTitle(c)}`, text: 'Remove this course' })));
}

function showProblems(card, c) {
  const list = card.querySelector('.problems');
  const probs = cardProblems(c);
  list.replaceChildren(...probs.map((p) => el('li', { text: p })));
  list.hidden = !probs.length;
  if (probs.length) card.setAttribute('aria-describedby', list.id); else card.removeAttribute('aria-describedby');
}

// The score line on a course card: the number, the group, and where it sits on the scale.
// placed is this course's spot in the ranked list ({ group, rank, of }), or undefined while it is left out.
function fillStrip(card, c, placed) {
  const strip = card.querySelector('.score-strip');
  const show = (...kids) => strip.replaceChildren(...kids.filter(Boolean));
  const p = scoreProgress(c, state.weights);
  const zoned = !validCapacity(state.capacity);
  const label = (t) => el('span', { class: 'ss-label', text: t });
  const main = (...kids) => el('div', { class: 'ss-main' }, kids);
  const note = (t) => el('span', { class: 'ss-note', text: t });
  if (!p) {
    show(label('Need score'), main(el('span', { class: 'ss-num off', text: 'None yet' }), note('Set at least one weight above zero to get a score.')));
    return;
  }
  const left = p.left.length
    ? el('p', { class: 'ss-left' }, el('strong', { text: 'Still to rate: ' }), `${p.left.join(', ')}.`,
      p.complete ? ' It does not change the score, but the ranked list needs it.' : '')
    : null;
  if (!p.complete) {
    show(
      label(p.rated ? 'Need score so far' : 'Need score'),
      p.rated
        ? main(el('span', { class: 'ss-num range', text: `${p.low} to ${p.high}` }), note(`${p.rated} of 5 signs rated. The range narrows with each one.`))
        : main(el('span', { class: 'ss-num off', text: 'None yet' }), note('Pick the ratings below. The score fills in here as you go.')),
      scaleBar(p.rated ? { low: p.low, high: p.high, zoned } : { zoned }),
      left);
    return;
  }
  const group = placed ? placed.group : (zoned && !c.must_change ? zoneFor(p.score) : null);
  const where = !placed ? 'Not in the ranked list yet.'
    : placed.group === 'required' ? 'Must change, so it sits above the ranking.'
    : placed.of > 1 ? `Ranked ${placed.rank} of ${placed.of}.` : '';
  show(
    label('Need score'),
    main(el('span', { class: 'ss-num', text: String(p.score) }),
      group ? el('span', { class: 'tag group', text: groupLabel(group) }) : null,
      where ? note(where) : null),
    scaleBar({ score: p.score, zoned }),
    left);
}

function renderStrips(r) {
  const placed = new Map();
  if (r && r.groups) {
    r.groups.required.forEach((it) => placed.set(it.id, { group: 'required' }));
    const ranked = [...r.groups.doFirst, ...r.groups.next, ...r.groups.later];
    ranked.forEach((it, i) => placed.set(it.id, { group: it.group, rank: i + 1, of: ranked.length }));
  }
  for (const card of $('#editor').querySelectorAll('[data-id]')) {
    const c = state.courses.find((x) => x.id === card.dataset.id);
    if (c) fillStrip(card, c, placed.get(c.id));
  }
}

function renderEditor() {
  const cards = state.courses.map(rowCard);
  $('#editor').replaceChildren(...(cards.length ? cards
    : [el('p', { class: 'empty', text: 'No courses yet. Press Add a course to type one in and pick its ratings.' })]));
  cards.forEach((card, i) => showProblems(card, state.courses[i]));
}

function onField(e) {
  const t = e.target;
  const card = t.closest('[data-id]');
  const f = t.dataset.field;
  if (!card || !f) return;
  const c = state.courses.find((x) => x.id === card.dataset.id);
  if (t.type === 'checkbox') {
    c[f] = t.checked;
    if (c.csvProblems) c.csvProblems = c.csvProblems.filter((p) => !p.startsWith(f));
  } else if (f === 'feedback') c[f] = t.value === 'none' ? 'none' : t.value ? Number(t.value) : null;
  else if (['reach', 'importance', 'out_of_date', 'works', 'effort'].includes(f)) c[f] = t.value ? Number(t.value) : null;
  else c[f] = t.value;
  if (f === 'must_change') card.querySelector('.reason-fields').hidden = !c.must_change;
  if (f === 'reason') {
    const showDate = DATE_REASONS.includes(c.reason);
    if (!showDate) { c.reason_date = ''; card.querySelector('[data-field="reason_date"]').value = ''; }
    card.querySelector('.date-field').hidden = !showDate;
  }
  if (f === 'course') {
    const title = cardTitle(c);
    card.querySelector('.card-title').textContent = title;
    card.querySelector('[data-action="delete"]').setAttribute('aria-label', `Remove ${title}`);
  }
  showProblems(card, c);
  save();
  renderResults();
}

$('#editor').addEventListener('input', onField);
$('#editor').addEventListener('change', onField);
$('#editor').addEventListener('click', (e) => {
  if (e.target.dataset.action !== 'delete') return;
  const id = e.target.closest('[data-id]').dataset.id;
  const idx = state.courses.findIndex((c) => c.id === id);
  state.courses = state.courses.filter((c) => c.id !== id);
  save(); renderEditor(); renderResults();
  const cards = $('#editor').children;
  const next = cards[Math.min(idx, cards.length - 1)];
  (next ? next.querySelector('input.name') : $('#add')).focus();
});
$('#add').addEventListener('click', () => {
  const c = emptyCourse(newId());
  // A starter name, so a new course is never held back for a blank name. It is selected, ready to type over.
  const taken = new Set(state.courses.map((x) => x.course.trim()));
  let n = state.courses.length + 1;
  while (taken.has(`Course ${n}`)) n++;
  c.course = `Course ${n}`;
  state.courses.push(c);
  save(); renderEditor(); renderResults();
  const name = $('#editor').lastElementChild.querySelector('input.name');
  name.focus(); name.select();
});
$('#example').addEventListener('click', () => {
  if (state.courses.length && !confirm('Replace your list with the example courses?')) return;
  state.courses = EXAMPLE_COURSES.map((c) => ({ ...c, id: newId() }));
  save(); renderEditor(); renderResults();
});
$('#clear').addEventListener('click', () => {
  if (!confirm('Clear every course and reset the settings?')) return;
  state.courses = []; state.weights = { ...DEFAULT_WEIGHTS }; state.capacity = '';
  try { localStorage.removeItem(KEY); } catch { /* nothing saved */ }
  renderEditor(); renderWeights(); $('#capacity').value = ''; renderResults();
});
// Adds the rows in a piece of CSV text and reports the result. True when rows were added.
function addRows(text) {
  const r = importCsv(text, () => newId());
  const msg = $('#csv-message');
  if (r.error) { msg.className = 'problem'; msg.textContent = r.error; return false; }
  state.courses.push(...r.courses);
  const flagged = r.courses.filter((c) => validateCourse(c).length).length;
  msg.className = '';
  msg.textContent = [`Added ${r.courses.length} course${r.courses.length === 1 ? '' : 's'}.`,
    flagged ? `${flagged} need a fix; they are flagged below.` : '', ...r.notes].filter(Boolean).join(' ');
  save(); renderEditor(); renderResults();
  return true;
}
$('#import').addEventListener('click', () => { if (addRows($('#csv').value)) $('#csv').value = ''; });
// The file is read in the browser. Nothing is uploaded.
$('#choose').addEventListener('click', () => $('#file').click());
$('#file').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  e.target.value = '';
  if (!f) return;
  const msg = $('#csv-message');
  const fail = (t) => { msg.className = 'problem'; msg.textContent = t; };
  const problem = fileProblem(f.name, f.size);
  if (problem) { fail(problem); return; }
  try { addRows(await f.text()); } catch { fail('We could not read that file.'); }
});

// ---------------------------------------------------------------- settings
function renderWeights() {
  $('#weights').replaceChildren(...FACTORS.map((f) => el('label', { class: 'field', for: `w-${f.key}` },
    el('span', {}, `${f.label}: `, el('output', { id: `w-${f.key}-out`, for: `w-${f.key}`, text: String(state.weights[f.key]) })),
    el('input', { type: 'range', id: `w-${f.key}`, min: '0', max: '50', step: '5', value: String(state.weights[f.key]), 'data-weight': f.key }))));
}
$('#weights').addEventListener('input', (e) => {
  const k = e.target.dataset.weight;
  if (!k) return;
  state.weights[k] = Number(e.target.value);
  document.getElementById(`w-${k}-out`).textContent = e.target.value;
  save(); renderResults();
});
$('#reset-weights').addEventListener('click', () => { state.weights = { ...DEFAULT_WEIGHTS }; renderWeights(); save(); renderResults(); });
function capacityNote() {
  const raw = String(state.capacity ?? '').trim();
  const bad = raw !== '' && !validCapacity(raw);
  const text = bad ? 'Enter a whole number of 1 or more. Until then, the list uses the score cutoffs.' : '';
  const m = $('#capacity-message');
  if (m.textContent !== text) m.textContent = text;
}
$('#capacity').addEventListener('input', (e) => { state.capacity = e.target.value; save(); renderResults(); });

// ---------------------------------------------------------------- results
const factorLabel = (k) => FACTORS.find((f) => f.key === k).label.toLowerCase();

function itemView(it) {
  const r = it.row;
  const reason = REASON_TYPES.find((t) => t.key === r.reason);
  return el('li', { class: 'item' },
    el('div', { class: 'item-head' },
      el('div', { class: 'name', text: it.course }),
      el('div', { class: 'item-score' }, el('span', { class: 'ss-label', text: 'Need score' }), el('span', { class: 'ss-num', text: String(it.score) }))),
    scaleBar({ score: it.score, zoned: !validCapacity(state.capacity), slim: true }),
    el('div', {},
      el('span', { class: 'tag', text: it.effortLabel }),
      it.closeCall ? el('span', { class: 'tag warn', text: 'Close call' }) : null),
    it.group === 'required' && reason
      ? el('p', {}, el('strong', { text: 'Must change: ' }), [reason.label, r.reason_note, r.reason_date].filter(Boolean).join(', ')) : null,
    el('p', { class: 'muted', text: it.drivers.length ? `Driven by ${it.drivers.map(factorLabel).join(' and ')}.` : 'No strong signals.' }),
    it.noFeedbackData ? el('p', { class: 'muted', text: 'No feedback data, counted as 3.' }) : null,
    it.hints.map((h) => el('p', { text: HINTS[h] })));
}

function setSummary(text) { const s = $('#summary'); if (s.textContent !== text) s.textContent = text; }

function renderResults() {
  capacityNote();
  const r = rankCourses(state.courses, state.weights, state.capacity);
  const out = $('#results');
  renderStrips(r);
  if (!state.courses.length) { setSummary('Add courses or load the example to see a ranked list.'); out.replaceChildren(); return; }
  const dl = $('#download-message');
  if (!r.error && dl.textContent) dl.textContent = '';
  if (r.error) { setSummary(r.error); out.replaceChildren(); return; }
  const counts = GROUPS.map((g) => `${g.label} ${r.groups[g.key].length}`).join(', ');
  const waiting = r.leftOut ? `${r.leftOut} course${r.leftOut === 1 ? ' is' : 's are'} not in the list yet. Finish ${r.leftOut === 1 ? 'it on its card' : 'them on their cards'} above.` : '';
  setSummary(r.leftOut === state.courses.length ? `Nothing to rank yet. ${waiting}` : [`${counts}.`, waiting].filter(Boolean).join(' '));
  out.replaceChildren(
    ...r.warnings.map((w) => el('p', { class: 'problem', text: w })),
    ...GROUPS.filter((g) => r.groups[g.key].length).map((g) => el('section', { class: 'group' },
      el('h3', { text: g.label }),
      g.key === 'required' ? el('p', { class: 'muted', text: 'Only the required change is mandatory, not a full rebuild. If safety or legal content is wrong right now, we suggest pulling it or posting a notice now.' }) : null,
      el('ol', {}, r.groups[g.key].map(itemView)))));
}

// Saves CSV text as a file made in the browser. The byte order mark lets Excel read it as UTF-8.
function saveCsv(text, name) {
  const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/csv' }));
  const a = el('a', { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

$('#print').addEventListener('click', () => window.print());
$('#download').addEventListener('click', () => {
  const r = rankCourses(state.courses, state.weights, state.capacity);
  const msg = $('#download-message');
  if (!r.groups) { msg.textContent = r.error; return; }
  msg.textContent = '';
  saveCsv(toCsv(r), 'training-priorities.csv');
});
$('#sample').addEventListener('click', () => saveCsv(sampleCsv(), 'training-priority-sample.csv'));

renderGuide();
renderDiagram();
renderEditor();
renderWeights();
$('#capacity').value = state.capacity;
renderResults();
