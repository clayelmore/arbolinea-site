// Format chooser renderer. All rules live in logic.js and data.js.
import { QUESTIONS, SOURCES, TABLE, RULES, NOTES, FORMAT_NAMES } from './data.js';
import { recommend } from './logic.js';

const $ = (s) => document.querySelector(s);
const quiz = $('#quiz');
const resultEl = $('#result');
const toggle = $('#designer-toggle');
const state = { step: 0, answers: {} };

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage blocked: the page still works */ } },
};

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

function sourceLinks(keys) {
  if (!keys || !keys.length) return null;
  const span = el('span', { class: 'cite' }, ' (');
  keys.forEach((k, i) => {
    const s = SOURCES[k];
    if (i) span.append(', ');
    span.append(el('a', { href: s.url, target: '_blank', rel: 'noopener', text: s.short }));
  });
  span.append(')');
  return span;
}

function hasAnswer(q) {
  const v = state.answers[q.id];
  return q.multi ? Array.isArray(v) && v.length > 0 : Boolean(v);
}
function isChecked(q, id) {
  const v = state.answers[q.id];
  return q.multi ? Array.isArray(v) && v.includes(id) : v === id;
}
function answerText(q) {
  const v = state.answers[q.id];
  const ids = q.multi ? (Array.isArray(v) ? v : []) : [v];
  const texts = q.answers.filter((a) => ids.includes(a.id)).map((a) => a.text); // answer order
  return texts.length ? texts.join('; ') : 'Not answered';
}

function focusLegend() { const l = quiz.querySelector('legend'); if (l) l.focus(); }

function renderQuestion() {
  const q = QUESTIONS[state.step];
  const last = state.step === QUESTIONS.length - 1;
  quiz.replaceChildren(
    el('p', { class: 'label', text: `Question ${state.step + 1} of ${QUESTIONS.length}` }),
    el('fieldset', {},
      el('legend', { tabindex: '-1', text: q.text }),
      q.hint ? el('p', { class: 'muted', text: q.hint }) : null,
      el('div', { class: 'choices' }, q.answers.map((a) => el('label', { class: 'choice' },
        el('input', { type: q.multi ? 'checkbox' : 'radio', name: q.id, value: a.id, checked: isChecked(q, a.id) }),
        el('span', { text: a.text })))),
      el('p', {}, el('strong', { text: 'Why we ask: ' }), q.why),
      el('p', { class: 'designer muted', hidden: !toggle.checked }, el('strong', { text: 'Designer terms: ' }), q.designer)),
    el('div', { class: 'actions' },
      el('button', { type: 'button', class: 'secondary', id: 'back', disabled: state.step === 0, text: 'Back' }),
      el('button', { type: 'submit', id: 'next', disabled: !hasAnswer(q), text: last ? 'See my result' : 'Next' })));
}

function showResult(moveFocus = true) {
  const r = recommend(state.answers);
  const designer = toggle.checked;
  const lines = [...r.firmRules.map((k) => RULES[k]), ...r.reasons];
  resultEl.replaceChildren(
    el('p', { class: 'label', text: 'Our pick' }),
    el('h2', { id: 'pick', class: 'pick', tabindex: '-1', text: r.label }),
    el('h3', { text: 'How your answers counted' }),
    el('ul', {}, lines.map((x) => el('li', {}, designer && x.designer ? x.designer : x.text, sourceLinks(x.sources)))),
    r.notes.length ? el('h3', { text: 'Keep in mind' }) : null,
    r.notes.length ? el('ul', {}, r.notes.map((k) => el('li', {}, NOTES[k].text, sourceLinks(NOTES[k].sources)))) : null,
    el('h3', { text: 'Your answers' }),
    el('dl', { class: 'answers' }, QUESTIONS.flatMap((q) => [
      el('dt', { text: q.text }),
      el('dd', { text: answerText(q) }),
    ])),
    el('div', { class: 'actions no-print' },
      el('button', { type: 'button', id: 'print', text: 'Print summary' }),
      el('button', { type: 'button', class: 'secondary', id: 'restart', text: 'Start over' })));
  resultEl.hidden = false;
  quiz.hidden = true;
  if (moveFocus) $('#pick').focus();
}

function renderCompare() {
  const cols = ['R', 'S', 'J'];
  $('#compare').replaceChildren(el('table', { class: 'compare' },
    el('caption', { class: 'sr-only', text: 'Rise 360, Storyline 360, and a PDF job aid compared' }),
    el('thead', {}, el('tr', {}, el('th', { scope: 'col', text: 'Topic' }), cols.map((c) => el('th', { scope: 'col', text: FORMAT_NAMES[c] })))),
    el('tbody', {}, TABLE.map((row) => el('tr', {},
      el('th', { scope: 'row', text: row.topic }),
      cols.map((c) => el('td', { 'data-col': FORMAT_NAMES[c] }, row[c].text, sourceLinks(row[c].sources))))))));
}

function renderSources() {
  $('#sources').replaceChildren(...Object.values(SOURCES).map((s) => el('li', {},
    el('a', { href: s.url, target: '_blank', rel: 'noopener', text: s.title }),
    s.kind === 'practitioner' ? ' (practitioner view)' : '')));
}

quiz.addEventListener('change', (e) => {
  if (!e.target.name) return;
  const q = QUESTIONS.find((x) => x.id === e.target.name);
  if (q.multi) {
    state.answers[q.id] = [...quiz.querySelectorAll('input[type=checkbox]:checked')].map((i) => i.value);
  } else {
    state.answers[q.id] = e.target.value;
  }
  $('#next').disabled = !hasAnswer(q);
});
quiz.addEventListener('click', (e) => {
  if (e.target.id === 'back' && state.step > 0) { state.step -= 1; renderQuestion(); focusLegend(); }
});
quiz.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!hasAnswer(QUESTIONS[state.step])) return;
  if (state.step < QUESTIONS.length - 1) { state.step += 1; renderQuestion(); focusLegend(); } else showResult();
});
resultEl.addEventListener('click', (e) => {
  if (e.target.id === 'print') window.print();
  if (e.target.id === 'restart') {
    state.step = 0; state.answers = {};
    resultEl.hidden = true; quiz.hidden = false;
    renderQuestion(); focusLegend();
  }
});
toggle.checked = store.get('fc-designer') === '1';
toggle.addEventListener('change', () => {
  store.set('fc-designer', toggle.checked ? '1' : '0');
  document.querySelectorAll('.designer').forEach((n) => { n.hidden = !toggle.checked; });
  if (!resultEl.hidden) showResult(false);
});

renderQuestion();
renderCompare();
renderSources();
