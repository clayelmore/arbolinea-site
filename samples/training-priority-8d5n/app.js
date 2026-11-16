// Training priority renderer. All scoring lives in logic.js.
import {
  FACTORS, EFFORT, DEFAULT_WEIGHTS, REASON_TYPES, GROUPS, HINTS, EXAMPLE_COURSES,
  emptyCourse, validateCourse, rankCourses, importCsv, toCsv,
} from './logic.js';

const KEY = 'tp-state-v1';
const $ = (s) => document.querySelector(s);
let seq = 0;
const newId = () => `c${Date.now().toString(36)}${(seq++).toString(36)}`;

const state = load();

function load() {
  const fresh = { courses: [], weights: { ...DEFAULT_WEIGHTS }, capacity: '' };
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && Array.isArray(s.courses) && s.weights) return { ...fresh, ...s, weights: { ...DEFAULT_WEIGHTS, ...s.weights } };
  } catch { /* storage blocked or bad JSON: start fresh */ }
  return fresh;
}
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
  $('#guide').replaceChildren(...[...FACTORS, EFFORT].map((f) => el('div', { class: 'panel' },
    el('h3', { text: f.label + (f.key === 'effort' ? ' (not scored)' : '') }),
    el('p', { text: f.question }),
    el('p', {}, el('strong', { text: 'Why it counts: ' }), f.why),
    el('ol', {}, f.anchors.map((a, i) => el('li', {}, el('strong', { text: `${i + 1}: ` }), a))),
    f.help ? el('p', { class: 'muted', text: f.help }) : null)));
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

function rowCard(c) {
  return el('div', { class: 'card-row', 'data-id': c.id },
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
      el('label', { class: 'field' }, 'Date of the change (if there is one)', el('input', { type: 'date', 'data-field': 'reason_date', value: c.reason_date })),
      el('label', { class: 'field' }, 'Note', el('input', { type: 'text', 'data-field': 'reason_note', value: c.reason_note }))),
    el('ul', { class: 'problems problem' }),
    el('div', { class: 'actions' }, el('button', { type: 'button', class: 'secondary', 'data-action': 'delete', text: 'Remove this course' })));
}

function showProblems(card, c) {
  card.querySelector('.problems').replaceChildren(...validateCourse(c).map((p) => el('li', { text: p })));
}

function renderEditor() {
  const cards = state.courses.map(rowCard);
  $('#editor').replaceChildren(...cards);
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
  showProblems(card, c);
  save();
  renderResults();
}

$('#editor').addEventListener('input', onField);
$('#editor').addEventListener('change', onField);
$('#editor').addEventListener('click', (e) => {
  if (e.target.dataset.action !== 'delete') return;
  const id = e.target.closest('[data-id]').dataset.id;
  state.courses = state.courses.filter((c) => c.id !== id);
  save(); renderEditor(); renderResults();
});
$('#add').addEventListener('click', () => {
  const c = emptyCourse(newId());
  state.courses.push(c);
  save(); renderEditor(); renderResults();
  $('#editor').lastElementChild.querySelector('input').focus();
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
$('#import').addEventListener('click', () => {
  const r = importCsv($('#csv').value, () => newId());
  const msg = $('#csv-message');
  if (r.error) { msg.className = 'problem'; msg.textContent = r.error; return; }
  state.courses.push(...r.courses);
  const flagged = r.courses.filter((c) => validateCourse(c).length).length;
  msg.className = '';
  msg.textContent = [`Added ${r.courses.length} course${r.courses.length === 1 ? '' : 's'}.`,
    flagged ? `${flagged} need a fix; they are flagged below.` : '', ...r.notes].filter(Boolean).join(' ');
  $('#csv').value = '';
  save(); renderEditor(); renderResults();
});

// ---------------------------------------------------------------- settings
function renderWeights() {
  $('#weights').replaceChildren(...FACTORS.map((f) => el('label', { class: 'field' },
    el('span', {}, `${f.label}: `, el('output', { id: `w-${f.key}-out`, text: String(state.weights[f.key]) })),
    el('input', { type: 'range', min: '0', max: '50', step: '5', value: String(state.weights[f.key]), 'data-weight': f.key }))));
}
$('#weights').addEventListener('input', (e) => {
  const k = e.target.dataset.weight;
  if (!k) return;
  state.weights[k] = Number(e.target.value);
  $(`#w-${k}-out`).textContent = e.target.value;
  save(); renderResults();
});
$('#reset-weights').addEventListener('click', () => { state.weights = { ...DEFAULT_WEIGHTS }; renderWeights(); save(); renderResults(); });
$('#capacity').addEventListener('input', (e) => { state.capacity = e.target.value; save(); renderResults(); });

// ---------------------------------------------------------------- results
const factorLabel = (k) => FACTORS.find((f) => f.key === k).label.toLowerCase();

function itemView(it) {
  const r = it.row;
  const reason = REASON_TYPES.find((t) => t.key === r.reason);
  return el('li', { class: 'item' },
    el('div', { class: 'name', text: it.course }),
    el('div', { class: 'meta-line', text: `Need score ${it.score}` }),
    el('div', {},
      el('span', { class: 'tag', text: it.effortLabel }),
      it.closeCall ? el('span', { class: 'tag warn', text: 'Close call' }) : null),
    it.group === 'required' && reason
      ? el('p', {}, el('strong', { text: 'Must change: ' }), [reason.label, r.reason_note, r.reason_date].filter(Boolean).join(', ')) : null,
    el('p', { class: 'muted', text: it.drivers.length ? `Driven by ${it.drivers.map(factorLabel).join(' and ')}.` : 'No strong signals.' }),
    it.noFeedbackData ? el('p', { class: 'muted', text: 'No feedback data, counted as 3.' }) : null,
    it.hints.map((h) => el('p', { text: HINTS[h] })));
}

function renderResults() {
  const r = rankCourses(state.courses, state.weights, state.capacity);
  const summary = $('#summary');
  const out = $('#results');
  if (!state.courses.length) { summary.textContent = 'Add courses or load the example to see a ranked list.'; out.replaceChildren(); return; }
  if (r.error) { summary.textContent = r.error; out.replaceChildren(); return; }
  const counts = GROUPS.map((g) => `${g.label} ${r.groups[g.key].length}`).join(', ');
  summary.textContent = `${counts}.` + (r.leftOut ? ` ${r.leftOut} course${r.leftOut === 1 ? ' is' : 's are'} left out until fixed.` : '');
  out.replaceChildren(
    ...r.warnings.map((w) => el('p', { class: 'problem', text: w })),
    ...GROUPS.filter((g) => r.groups[g.key].length).map((g) => el('section', { class: 'group' },
      el('h3', { text: g.label }),
      g.key === 'required' ? el('p', { class: 'muted', text: 'Only the required change is mandatory, not a full rebuild. If safety or legal content is wrong right now, we suggest pulling it or posting a notice now.' }) : null,
      el('ol', {}, r.groups[g.key].map(itemView)))));
}

$('#print').addEventListener('click', () => window.print());
$('#download').addEventListener('click', () => {
  const r = rankCourses(state.courses, state.weights, state.capacity);
  if (!r.groups) return;
  const url = URL.createObjectURL(new Blob([toCsv(r)], { type: 'text/csv' }));
  const a = el('a', { href: url, download: 'training-priorities.csv' });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

renderGuide();
renderEditor();
renderWeights();
$('#capacity').value = state.capacity;
renderResults();
