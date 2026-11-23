// Friday practice: the DOM renderer. Content comes from window.FRIDAY (friday-data.js),
// every rule from friday-logic.js. Storage is this browser only.
import * as L from './friday-logic.js';

const F = window.FRIDAY;
const T = F.text;
const KEY = 'friday-practice-v1';
const BACKUP_KEY = 'friday-practice-backup';
const WEEK = Object.fromEntries(F.weeks.map((w) => [w.id, w]));
const BADGE = Object.fromEntries(F.badges.map((b) => [b.id, b]));
const $ = (id) => document.getElementById(id);

// ----- Small DOM helper: h('p', { class: 'x' }, 'text', child) -----
function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v === null || v === undefined) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat(Infinity)) if (kid !== null && kid !== undefined && kid !== false) el.append(kid);
  return el;
}
const SVG = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.append(...kids);
  return el;
}

// ----- Storage -----
function read(key) { try { return localStorage.getItem(key); } catch { return null; } }
function write(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
function remove(key) { try { localStorage.removeItem(key); } catch { /* storage blocked: nothing to remove */ } }

let state;
{
  const { state: parsed, backup } = L.parseState(read(KEY));
  state = parsed;
  if (backup !== null) {
    write(BACKUP_KEY, backup);
    write(KEY, JSON.stringify(state));
    $('backup-note').textContent = T.backupNote;
    $('backup-note').hidden = false;
  }
}
let saveTimer = null;
function persist() { clearTimeout(saveTimer); write(KEY, JSON.stringify(state)); }
function persistSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(persist, 300); }

function announce(text) {
  const el = $('announce');
  el.textContent = '';
  setTimeout(() => { el.textContent = text; }, 60);
}

// ----- View state (not stored) -----
const view = {
  weekId: L.nextWeek(state).weekId,
  another: false, // pressed "Do another" or picked a week, so the "done for this week" note steps aside
  justSaved: null, // { weekId, badges: [id], tuneUp: bool }
};
const timer = { start: null, tick: null, oneMinute: false, ended: false, weekId: null };

const draftFor = (id) => state.drafts[id] || {};
function setDraft(id, patch) {
  state = { ...state, drafts: { ...state.drafts, [id]: { ...draftFor(id), ...patch } } };
}

// ----- Badge medallions: a ring, a disc, a glyph drawn with paths. -----
const GLYPHS = {
  first: () => [s('path', { d: 'M28 24.5 L33.5 21 V43' }), s('path', { d: 'M27 43 H40' })],
  three: () => [s('path', { d: 'M22 42 V35' }), s('path', { d: 'M32 42 V29' }), s('path', { d: 'M42 42 V22' })],
  sharp: () => [s('path', { d: 'M17 32 C23 23.5 41 23.5 47 32 C41 40.5 23 40.5 17 32 Z' }), s('circle', { cx: 32, cy: 32, r: 4.2, class: 'solid' })],
  halfway: () => [s('circle', { cx: 32, cy: 32, r: 11 }), s('path', { d: 'M32 21 A11 11 0 0 1 32 43 Z', class: 'solid' })],
  twelve: () => [s('path', { d: 'M21.5 33 L28.5 40 L43 24.5' })],
  circle: () => [s('path', { d: 'M43.5 29 A12 12 0 1 0 43 37' }), s('path', { d: 'M44.5 21.5 V29.5 H36.5' })],
  tuneup: () => [s('path', { d: 'M22 21 V43 M32 21 V43 M42 21 V43' }), s('circle', { cx: 22, cy: 36, r: 3.6, class: 'solid' }), s('circle', { cx: 32, cy: 27, r: 3.6, class: 'solid' }), s('circle', { cx: 42, cy: 33, r: 3.6, class: 'solid' })],
  thousand: () => [s('path', { d: 'M21 24 H43' }), s('path', { d: 'M21 31 H43' }), s('path', { d: 'M21 38 H36' }), s('path', { d: 'M38.5 42 L44 36.5' })],
};
function medal(id, earned, fresh = false) {
  const svg = s('svg', { viewBox: '0 0 64 64', class: `medal${earned ? ' earned' : ''}${fresh ? ' fresh' : ''}`, 'aria-hidden': 'true', focusable: 'false' },
    s('circle', { cx: 32, cy: 32, r: 29, class: 'ring', transform: 'rotate(-90 32 32)' }),
    s('circle', { cx: 32, cy: 32, r: 24, class: 'disc' }),
    s('g', { class: 'glyph' }, ...GLYPHS[id]()));
  return svg;
}
function badgeTile(id, day, fresh = false) {
  const b = BADGE[id];
  return h('li', { class: `badge${day ? '' : ' locked'}` },
    medal(id, Boolean(day), fresh),
    h('span', { class: 'name' }, b.name),
    h('span', { class: 'sub' }, day ? `Earned ${L.formatDay(day)}` : b.how),
    h('span', { class: 'sr' }, day ? '' : ' Not earned yet.'));
}

// ----- The week: header, warm-up, writing -----
function levelChip(level) { return h('span', { class: `chip ${level.toLowerCase()}` }, level); }

function weekHeader(w) {
  const { round } = L.nextWeek(state);
  const done = new Set(state.sessions.map((x) => x.weekId));
  const select = h('select', { id: 'week-pick', onchange: (e) => openWeek(e.target.value) },
    F.weeks.map((x) => h('option', { value: x.id, selected: x.id === w.id }, `Week ${x.n}: ${x.title}${done.has(x.id) ? ' (done)' : ''}`)));
  return h('div', { class: 'card week-head' },
    h('div', { class: 'row' },
      h('div', {},
        h('p', { class: 'mono-label' }, `Week ${w.n} of 12${round > 1 ? `, round ${round}` : ''}`),
        h('h2', { id: 'week-title' }, w.title)),
      h('div', { class: 'picker' }, h('label', { for: 'week-pick' }, T.pickWeek), select)),
    h('div', { class: 'chips' }, levelChip(w.level), w.tuneUp ? h('span', { class: 'chip quiet' }, 'Tune-up week') : null));
}

function samples(w) {
  return w.parts.map((p) => h('div', { class: 'sample' },
    h('p', { class: 'lbl' }, p.label),
    p.plain ? h('p', { class: 'plain' }, p.text) : h('blockquote', {}, p.text),
    p.list ? h('ul', {}, p.list.map((li) => h('li', {}, li))) : null));
}

function feedbackContent(w, answer) {
  const chosen = w.options[answer];
  const good = Boolean(chosen.correct);
  return [
    h('div', { class: `verdict-box ${good ? 'good' : 'bad'}` },
      h('span', { class: 'verdict' }, good ? T.right : T.notQuite),
      !good && w.level === 'Tricky' ? h('p', {}, h('strong', {}, T.tricky)) : null,
      h('p', {}, chosen.feedback)),
    h('dl', { class: 'reveal' },
      h('dt', {}, T.reveal), h('dd', {}, w.reveal),
      h('dt', {}, w.clueLabel), h('dd', {}, w.clue)),
  ];
}

function markOptions(fs, w, answer) {
  fs.querySelectorAll('.opt').forEach((label, i) => {
    const o = w.options[i];
    label.classList.add('locked');
    label.querySelector('input').disabled = true;
    if (o.correct) label.classList.add(i === answer ? 'right' : 'missed');
    else if (i === answer) label.classList.add('wrong');
    const tag = o.correct ? 'Answer' : i === answer ? 'Your pick' : '';
    if (tag) label.querySelector('.opt-text').append(h('span', { class: 'mark' }, tag));
  });
}

function warmup(w) {
  const d = draftFor(w.id);
  const answered = Number.isInteger(d.answer);
  const card = h('section', { class: 'card kc', 'aria-labelledby': 'warm-h' },
    h('div', { class: 'card-head' }, h('h3', { class: 'mono-label', id: 'warm-h' }, T.warmup), levelChip(w.level)),
    samples(w));
  const fb = h('div', { class: 'fb', 'aria-live': 'polite' });
  const hint = h('p', { class: 'hint', 'aria-live': 'polite' });

  const fs = h('fieldset', { class: 'ask' },
    h('legend', {}, w.ask),
    h('div', { class: 'opts' }, w.options.map((o, i) => h('label', { class: 'opt' },
      h('input', { type: 'radio', name: `ans-${w.id}`, value: String(i), checked: answered && d.answer === i }),
      h('span', { class: 'opt-text' }, o.text)))));
  const checkBtn = h('button', { type: 'button', class: 'btn', 'aria-disabled': answered ? 'true' : false }, T.check);
  checkBtn.addEventListener('click', () => {
    if (Number.isInteger(draftFor(w.id).answer)) return;
    const picked = fs.querySelector('input:checked');
    if (!picked) { hint.textContent = T.pickFirst; return; }
    const answer = Number(picked.value);
    setDraft(w.id, { answer, correct: Boolean(w.options[answer].correct) });
    persist();
    hint.textContent = '';
    checkBtn.setAttribute('aria-disabled', 'true');
    markOptions(fs, w, answer);
    fb.replaceChildren(...feedbackContent(w, answer));
    refreshSaveHint();
  });
  const actions = h('div', { class: 'actions' }, checkBtn, hint);

  const showChoices = !w.guessFirst || d.guessed || answered;
  if (showChoices) {
    card.append(fs, actions, fb);
    if (answered) { markOptions(fs, w, d.answer); fb.append(...feedbackContent(w, d.answer)); }
  } else {
    const guessBtn = h('button', { type: 'button', class: 'btn ghost' }, T.guessButton);
    const gate = h('div', { class: 'guess' }, h('p', {}, T.guessPrompt), guessBtn);
    guessBtn.addEventListener('click', () => {
      setDraft(w.id, { guessed: true });
      persist();
      gate.replaceWith(fs, actions, fb);
      fs.querySelector('input').focus();
    });
    card.append(gate);
  }
  return card;
}

let refreshSaveHint = () => {};

function writing(w) {
  const d = draftFor(w.id);
  const clock = h('span', { class: 'clock', 'aria-hidden': 'true' }, L.formatClock(L.TIMER_SECONDS));
  const startBtn = h('button', { type: 'button', class: 'btn ghost' }, T.timerStart);
  const resetBtn = h('button', { type: 'button', class: 'btn ghost', hidden: true }, T.timerReset);
  const note = h('p', { class: 'timer-note', hidden: true }, T.timerDone);
  const timerBox = h('div', { class: 'timer', role: 'group', 'aria-label': 'Timer' }, clock, h('div', { class: 'btns' }, startBtn, resetBtn));

  const paint = () => {
    if (timer.weekId !== w.id || timer.start === null) {
      clock.textContent = L.formatClock(L.TIMER_SECONDS);
      clock.classList.remove('done'); startBtn.hidden = false; resetBtn.hidden = true; note.hidden = true;
      return;
    }
    const left = L.timeLeft(timer.start, Date.now());
    clock.textContent = L.formatClock(left);
    startBtn.hidden = true; resetBtn.hidden = false;
    if (left <= 60 && left > 0 && !timer.oneMinute) { timer.oneMinute = true; $('timer-announce').textContent = T.timerOneMinute; }
    if (left === 0) {
      clock.classList.add('done'); note.hidden = false;
      if (!timer.ended) { timer.ended = true; $('timer-announce').textContent = T.timerDone; clearInterval(timer.tick); }
    }
  };
  startBtn.addEventListener('click', () => {
    stopTimer();
    Object.assign(timer, { start: Date.now(), oneMinute: false, ended: false, weekId: w.id });
    $('timer-announce').textContent = T.timerStarted;
    timer.tick = setInterval(paint, 250);
    paint();
    box.focus();
  });
  resetBtn.addEventListener('click', () => { stopTimer(); $('timer-announce').textContent = ''; paint(); startBtn.focus(); });
  if (timer.weekId === w.id && timer.start !== null && !timer.ended) { clearInterval(timer.tick); timer.tick = setInterval(paint, 250); }
  paint();

  const box = h('textarea', { id: 'box', 'aria-describedby': 'count draft-note' });
  box.value = d.writing || '';
  const like = h('input', { type: 'text', id: 'like', autocomplete: 'off' });
  like.value = d.like || '';
  const count = h('span', { id: 'count' });
  const draftNote = h('span', { id: 'draft-note' });
  const setCount = () => { const n = L.wordCount(box.value); count.textContent = `${n} ${n === 1 ? 'word' : 'words'}`; };
  setCount();
  const onType = () => { setDraft(w.id, { writing: box.value, like: like.value }); persistSoon(); setCount(); draftNote.textContent = T.draftSaved; };
  box.addEventListener('input', onType);
  like.addEventListener('input', onType);

  const status = h('p', { class: 'status', role: 'status' });
  const saveBtn = h('button', { type: 'button', class: 'btn' }, T.save);
  refreshSaveHint = () => { if (status.classList.contains('err') && Number.isInteger(draftFor(w.id).answer)) { status.textContent = ''; status.classList.remove('err'); } };
  saveBtn.addEventListener('click', () => {
    setDraft(w.id, { writing: box.value, like: like.value });
    const dd = draftFor(w.id);
    status.classList.add('err');
    if (!Number.isInteger(dd.answer)) { status.textContent = T.needAnswer; return; }
    if (L.wordCount(box.value) < 1) { status.textContent = T.needWords; box.focus(); return; }
    const before = new Set(L.earnedBadges(state).map((b) => b.id));
    try {
      state = L.saveSession(state, { weekId: w.id, answer: dd.answer, correct: Boolean(w.options[dd.answer].correct), level: w.level, writing: box.value, like: like.value }, new Date());
    } catch (e) { status.textContent = e.message; return; }
    persist();
    stopTimer();
    const fresh = L.earnedBadges(state).map((b) => b.id).filter((id) => !before.has(id));
    view.justSaved = { weekId: w.id, badges: fresh };
    view.another = false;
    render();
    const names = fresh.map((id) => BADGE[id].name);
    announce(`${T.saved} ${T.streak}: ${L.currentStreak(state, new Date())}.${names.length ? ` ${T.newBadge}: ${names.join(', ')}.` : ''}`);
    $('result-h').focus();
  });

  return h('section', { class: 'card', 'aria-labelledby': 'write-h' },
    h('h3', { class: 'mono-label', id: 'write-h' }, T.writing),
    h('p', { class: 'assignment' }, w.write),
    h('div', { class: 'rules' }, h('h3', {}, T.rulesHead), h('ol', {}, F.rules.map((r) => h('li', {}, r)))),
    timerBox, note,
    h('div', { class: 'field' }, h('label', { for: 'box' }, T.boxLabel), box, h('div', { class: 'meta-row' }, count, draftNote)),
    h('div', { class: 'field' }, h('label', { for: 'like' }, T.likeLabel), like),
    h('div', { class: 'actions' }, saveBtn, status));
}

function stopTimer() {
  clearInterval(timer.tick);
  Object.assign(timer, { start: null, tick: null, oneMinute: false, ended: false, weekId: null });
}

function tuneUpBlock(w) {
  const text = L.tuneUpText(state, F.tuneUpPrompt, F.weeks, T.tuneUpListNote);
  const area = h('textarea', { id: 'tune-text', readonly: true, 'aria-label': 'Tune-up prompt with your last four pieces' });
  area.value = text;
  const status = h('p', { class: 'status', role: 'status' });
  const btn = h('button', { type: 'button', class: 'btn' }, T.tuneUpCopy);
  btn.addEventListener('click', async () => {
    state = L.recordTuneUp(state, new Date());
    persist();
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch {
      area.focus(); area.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
    }
    status.textContent = ok ? T.tuneUpCopied : T.tuneUpCopyFailed;
    renderSide();
  });
  return h('div', { class: 'tuneup' },
    h('h3', {}, T.tuneUpHead),
    h('p', {}, w.tuneUpNote),
    h('p', {}, T.tuneUpIntro),
    h('div', { class: 'field' }, area),
    h('div', { class: 'actions' }, btn, status));
}

function resultCard() {
  const w = WEEK[view.justSaved.weekId];
  const streak = L.currentStreak(state, new Date());
  const earned = Object.fromEntries(L.earnedBadges(state).map((b) => [b.id, b.day]));
  const fresh = view.justSaved.badges;
  return h('section', { class: 'card result', 'aria-labelledby': 'result-h' },
    h('h2', { id: 'result-h', tabindex: '-1' }, `Week ${w.n} is done.`),
    h('p', { class: 'lead' }, `${T.streak}: ${streak}. Your writing is saved in this browser.`),
    fresh.length ? h('ul', { class: 'new-badges', 'aria-label': T.newBadge, style: 'list-style:none;padding:0;margin-block:18px 0' }, fresh.map((id) => badgeTile(id, earned[id], true))) : null,
    w.tuneUp ? tuneUpBlock(w) : null,
    h('div', { class: 'actions' }, h('button', { type: 'button', class: 'btn ghost', onclick: doAnother }, T.doAnother)));
}

function gateCard() {
  const streak = L.currentStreak(state, new Date());
  return h('section', { class: 'card gate', 'aria-labelledby': 'week-title' },
    h('p', { class: 'mono-label' }, 'This week'),
    h('h2', { id: 'week-title' }, T.doneThisWeek),
    h('p', {}, `${T.streak}: ${streak}.`),
    h('div', { class: 'actions' }, h('button', { type: 'button', class: 'link-btn', onclick: doAnother }, T.doAnother)));
}

function doAnother() {
  view.another = true;
  view.justSaved = null;
  view.weekId = L.nextWeek(state).weekId;
  render();
  $('week-title')?.focus();
}

function openWeek(id) {
  if (timer.weekId && timer.weekId !== id) stopTimer();
  view.weekId = id;
  view.another = true;
  view.justSaved = null;
  render();
  $('week-pick').focus();
}

function renderWeek() {
  const root = $('week');
  if (view.justSaved) root.replaceChildren(resultCard());
  else if (!view.another && L.doneThisWeek(state, new Date())) root.replaceChildren(gateCard());
  else { const w = WEEK[view.weekId]; root.replaceChildren(weekHeader(w), warmup(w), writing(w)); }
  $('week-title')?.setAttribute('tabindex', '-1');
}

// ----- Side column -----
function renderSide() {
  const now = new Date();
  const streak = L.currentStreak(state, now);
  const best = L.bestStreak(state);
  const doneIds = new Set(state.sessions.map((x) => x.weekId));
  $('streak-card').replaceChildren(
    h('h2', { id: 'streak-h' }, T.streak),
    h('div', { class: 'streak' },
      h('span', { class: 'num' }, String(streak)),
      h('div', {}, h('p', { class: 'lbl' }, streak === 1 ? '1 week' : `${streak} weeks`), h('p', { class: 'best' }, `${T.best}: ${best}`))),
    h('div', { class: 'weeks-dots', role: 'img', 'aria-label': `${doneIds.size} of 12 weeks finished at least once` },
      F.weeks.map((w) => h('span', { class: doneIds.has(w.id) ? 'on' : '' }))),
    h('p', { class: 'streak-note' }, T.streakNote));

  const earned = Object.fromEntries(L.earnedBadges(state).map((b) => [b.id, b.day]));
  $('badges-card').replaceChildren(
    h('h2', { id: 'badges-h' }, T.badgesHead, h('span', { class: 'sr' }, `, ${Object.keys(earned).length} of 8 earned`)),
    h('ul', { class: 'badges', style: 'list-style:none;padding:0;margin-bottom:0' }, F.badges.map((b) => badgeTile(b.id, earned[b.id]))));

  const pieces = [...state.sessions].sort((a, b) => (a.at < b.at ? 1 : -1));
  $('writing-card').replaceChildren(
    h('h2', { id: 'writing-h' }, T.yourWriting),
    pieces.length
      ? h('div', { class: 'pieces' }, pieces.map((p) => {
        const w = WEEK[p.weekId];
        return h('details', {},
          h('summary', {}, h('span', { class: 't' }, `Week ${w.n}: ${w.title}`), h('span', { class: 'm' }, `${L.formatDay(p.day)}, ${p.words} ${p.words === 1 ? 'word' : 'words'}`)),
          h('div', { class: 'body' },
            h('p', { class: 'asg' }, w.write),
            h('p', { class: 'txt' }, p.writing),
            p.like ? h('p', { class: 'like' }, h('strong', {}, 'What I like: '), p.like) : null));
      }))
      : h('p', { class: 'empty' }, T.noWriting));

  renderTools();
}

function download(name, type, text) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = h('a', { href: url, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderTools() {
  const confirmBox = h('div', { class: 'confirm', hidden: true, id: 'confirm' },
    h('p', {}, T.startOverWarn),
    h('div', { class: 'actions' },
      h('button', { type: 'button', class: 'btn danger', onclick: startOver }, T.startOverYes),
      h('button', { type: 'button', class: 'btn ghost', onclick: () => { confirmBox.hidden = true; overBtn.setAttribute('aria-expanded', 'false'); overBtn.focus(); } }, T.startOverNo)));
  const overBtn = h('button', { type: 'button', class: 'btn ghost', 'aria-expanded': 'false', 'aria-controls': 'confirm', onclick: () => {
    confirmBox.hidden = false; overBtn.setAttribute('aria-expanded', 'true'); confirmBox.querySelector('.btn.ghost').focus();
  } }, T.startOver);
  $('tools-card').replaceChildren(
    h('div', { class: 'tools' },
      h('button', { type: 'button', class: 'btn', onclick: () => download('my-friday-writing.md', 'text/markdown', L.exportMarkdown(state, F.weeks)) }, T.download),
      h('button', { type: 'button', class: 'btn ghost', onclick: () => download('friday-writing-reminder.ics', 'text/calendar', L.makeIcs({ url: location.href.split('#')[0].split('?')[0], now: new Date(), title: T.reminderTitle, description: T.reminderDescription })) }, T.reminder),
      h('button', { type: 'button', class: 'btn ghost', onclick: () => window.print() }, T.print),
      overBtn, confirmBox));
}

function startOver() {
  remove(KEY);
  remove(BACKUP_KEY);
  stopTimer();
  state = L.emptyState();
  view.weekId = 'w1';
  view.another = false;
  view.justSaved = null;
  $('backup-note').hidden = true;
  render();
  announce(T.cleared);
  $('week-title')?.focus();
}

// ----- Print view: every week, answers together at the end. -----
function renderPrint() {
  const letter = (i) => String.fromCharCode(65 + i);
  const lettersAreChoices = (w) => w.options.some((o) => /^[A-D]$/.test(o.text));
  $('print-view').replaceChildren(
    h('h1', {}, T.title),
    h('p', { class: 'pv-intro' }, `${T.intro} ${T.honesty}`),
    ...F.weeks.map((w) => h('section', {},
      h('h2', {}, `Week ${w.n}: ${w.title} (${w.level}${w.tuneUp ? ', tune-up week' : ''})`),
      w.parts.map((p) => [h('p', { class: 'pv-lbl' }, p.label), h('blockquote', {}, p.text), p.list ? h('ul', {}, p.list.map((x) => h('li', {}, x))) : null]),
      h('p', { class: 'pv-lbl' }, 'Warm-up'), h('p', {}, w.ask),
      // Weeks whose choices are already the letters A and B get a plain list, so print never shows "A. A".
      lettersAreChoices(w) ? h('ul', {}, w.options.map((o) => h('li', {}, o.text))) : h('ol', { type: 'A' }, w.options.map((o) => h('li', {}, o.text))),
      h('p', { class: 'pv-lbl' }, 'Write, 10 minutes, no AI'), h('p', {}, w.write),
      w.tuneUpNote ? [h('p', { class: 'pv-lbl' }, 'Tune-up'), h('p', {}, w.tuneUpNote)] : null)),
    h('div', { class: 'answers' },
      h('h1', {}, T.printAnswers),
      F.weeks.map((w) => {
        const i = w.options.findIndex((o) => o.correct);
        return h('section', {},
          h('h2', {}, lettersAreChoices(w) ? `Week ${w.n}: ${w.options[i].text}` : `Week ${w.n}: ${letter(i)}. ${w.options[i].text}`),
          h('p', {}, w.reveal),
          h('p', {}, h('strong', {}, `${w.clueLabel}: `), w.clue));
      }),
      h('section', {}, h('h2', {}, 'The tune-up prompt'), h('p', {}, F.tuneUpPrompt))));
}

function render() {
  renderWeek();
  renderSide();
}

// ----- Start -----
$('eyebrow').textContent = T.eyebrow;
$('page-title').textContent = T.title;
$('intro').textContent = T.intro;
$('privacy').textContent = T.privacy;
$('honesty').textContent = T.honesty;
renderPrint();
render();
