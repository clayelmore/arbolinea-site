// Friday practice: pure functions. No DOM, no clock: callers pass `now`.
// State shape (version 1):
//   { version: 1,
//     sessions: [{ weekId, day: "YYYY-MM-DD" (local), at: ISO time, answer, correct, level, writing, like, words }],
//     tuneUps: [{ day }],
//     drafts: { w3: { answer, guessed, writing, like } } }

export const VERSION = 1;
export const TIMER_SECONDS = 600;
export const BADGE_IDS = ['first', 'three', 'sharp', 'halfway', 'twelve', 'circle', 'tuneup', 'thousand'];
const WEEK_IDS = Array.from({ length: 12 }, (_, i) => 'w' + (i + 1));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function emptyState() {
  return { version: VERSION, sessions: [], tuneUps: [], drafts: {} };
}

// ----- Dates. A "day" is a local calendar date string; a week is keyed by its Monday. -----

const pad = (n) => String(n).padStart(2, '0');

export function dayKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toLocalDate(value) {
  if (typeof value === 'string') {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d, 12);
  }
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 12);
}

/** Monday (local) of the calendar week that holds `value` (a Date or "YYYY-MM-DD"). */
export function weekKey(value) {
  const d = toLocalDate(value);
  const back = (d.getDay() + 6) % 7; // Monday 0 ... Sunday 6
  return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - back, 12));
}

function shiftDays(key, days) {
  const d = toLocalDate(key);
  return dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days, 12));
}

export function formatDay(key) {
  const [y, m, d] = key.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// ----- Reading what is stored. Anything unexpected starts clean and keeps the raw value as backup. -----

const isDay = (v) => typeof v === 'string' && DAY_RE.test(v);
const isStr = (v) => typeof v === 'string';

function validSession(s) {
  return s && typeof s === 'object' && WEEK_IDS.includes(s.weekId) && isDay(s.day) && isStr(s.at)
    && Number.isInteger(s.answer) && typeof s.correct === 'boolean' && isStr(s.level)
    && isStr(s.writing) && isStr(s.like) && Number.isInteger(s.words);
}

function validDraft(d) {
  return d && typeof d === 'object' && !Array.isArray(d)
    && (d.answer === undefined || d.answer === null || Number.isInteger(d.answer))
    && (d.writing === undefined || isStr(d.writing)) && (d.like === undefined || isStr(d.like));
}

export function parseState(raw) {
  if (raw === null || raw === undefined || raw === '') return { state: emptyState(), backup: null };
  let v;
  try { v = JSON.parse(raw); } catch { return { state: emptyState(), backup: raw }; }
  const ok = v && typeof v === 'object' && !Array.isArray(v) && v.version === VERSION
    && Array.isArray(v.sessions) && v.sessions.every(validSession)
    && Array.isArray(v.tuneUps) && v.tuneUps.every((t) => t && isDay(t.day))
    && v.drafts && typeof v.drafts === 'object' && !Array.isArray(v.drafts)
    && Object.entries(v.drafts).every(([k, d]) => WEEK_IDS.includes(k) && validDraft(d));
  if (!ok) return { state: emptyState(), backup: raw };
  return { state: { version: VERSION, sessions: v.sessions, tuneUps: v.tuneUps, drafts: v.drafts }, backup: null };
}

// ----- Streaks: consecutive calendar weeks with at least one finished session. -----

function weekSet(state) {
  return new Set(state.sessions.map((s) => weekKey(s.day)));
}

function bestRun(keys) {
  const sorted = [...keys].sort();
  let best = 0, run = 0, prev = null;
  for (const k of sorted) {
    run = prev && shiftDays(prev, 7) === k ? run + 1 : 1;
    best = Math.max(best, run);
    prev = k;
  }
  return best;
}

export function currentStreak(state, now) {
  const keys = weekSet(state);
  let k = weekKey(now);
  if (!keys.has(k)) k = shiftDays(k, -7); // this week is not over yet, so it cannot break the streak
  let count = 0;
  while (keys.has(k)) { count++; k = shiftDays(k, -7); }
  return count;
}

export function bestStreak(state) {
  return bestRun(weekSet(state));
}

// ----- Which week is next. A round ends when all twelve weeks are finished. -----

const byTime = (a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0);

export function nextWeek(state) {
  let round = 1, done = new Set();
  for (const s of [...state.sessions].sort(byTime)) {
    done.add(s.weekId);
    if (done.size === WEEK_IDS.length) { round++; done = new Set(); }
  }
  return { weekId: WEEK_IDS.find((w) => !done.has(w)), round };
}

export function doneThisWeek(state, now) {
  return weekSet(state).has(weekKey(now));
}

// ----- Saving. -----

export function wordCount(text) {
  if (typeof text !== 'string') return 0;
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

export function saveSession(state, entry, now) {
  if (!WEEK_IDS.includes(entry.weekId)) throw new Error('Unknown week.');
  if (!Number.isInteger(entry.answer)) throw new Error('Answer the warm-up first.');
  const words = wordCount(entry.writing);
  if (words < 1) throw new Error('Write at least one word before you save.');
  const session = {
    weekId: entry.weekId, day: dayKey(now), at: now.toISOString(), answer: entry.answer,
    correct: Boolean(entry.correct), level: String(entry.level || ''),
    writing: entry.writing, like: (entry.like || '').trim(), words,
  };
  const drafts = { ...state.drafts };
  delete drafts[entry.weekId];
  return { ...state, sessions: [...state.sessions, session], drafts };
}

export function recordTuneUp(state, now) {
  return { ...state, tuneUps: [...state.tuneUps, { day: dayKey(now) }] };
}

// ----- Badges, replayed from the history so each carries the day it was earned. -----

export function earnedBadges(state) {
  const got = {};
  const give = (id, day) => { if (!got[id]) got[id] = day; };
  const weeks = new Set(), keys = new Set();
  let firstWeekCount = 0, words = 0;
  for (const s of [...state.sessions].sort(byTime)) {
    give('first', s.day);
    weeks.add(s.weekId);
    keys.add(weekKey(s.day));
    words += s.words;
    if (s.weekId === 'w1') firstWeekCount++;
    if (bestRun(keys) >= 3) give('three', s.day);
    if (s.level === 'Tricky' && s.correct) give('sharp', s.day);
    if (weeks.size >= 6) give('halfway', s.day);
    if (weeks.size >= 12) give('twelve', s.day);
    if (firstWeekCount >= 2) give('circle', s.day);
    if (words >= 1000) give('thousand', s.day);
  }
  const tune = [...state.tuneUps].map((t) => t.day).sort()[0];
  if (tune) give('tuneup', tune);
  return BADGE_IDS.filter((id) => got[id]).map((id) => ({ id, day: got[id] }));
}

// ----- Text out: the tune-up prompt and the Markdown download. -----

function weekTitle(weeks, id) {
  const w = weeks.find((x) => x.id === id);
  return w ? `Week ${w.n}: ${w.title}` : id;
}

function pieceText(s, weeks, level = '##') {
  const w = weeks.find((x) => x.id === s.weekId);
  const out = [`${level} ${weekTitle(weeks, s.weekId)} (${formatDay(s.day)})`, ''];
  if (w) out.push(`**Assignment:** ${w.write}`, '');
  out.push(s.writing.trim(), '');
  if (s.like) out.push(`**What I like:** ${s.like}`, '');
  return out.join('\n');
}

export function tuneUpText(state, prompt, weeks, listNote = '') {
  const last = [...state.sessions].sort(byTime).slice(-4);
  const parts = [prompt, ''];
  if (listNote) parts.push(listNote, '');
  parts.push('My writing:', '');
  for (const s of last) parts.push(pieceText(s, weeks, '###'));
  return parts.join('\n').trimEnd() + '\n';
}

export function exportMarkdown(state, weeks) {
  const all = [...state.sessions].sort(byTime);
  const head = ['# My Friday writing', ''];
  if (!all.length) return head.concat('No pieces saved yet.', '').join('\n');
  head.push(`Written without AI. ${all.length} ${all.length === 1 ? 'piece' : 'pieces'}, oldest first.`, '');
  return head.join('\n') + all.map((s) => pieceText(s, weeks)).join('\n');
}

// ----- Calendar reminder: weekly on Fridays, 9:00 local floating time, 10 minutes. -----

const icsEscape = (s) => String(s).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');

const byteLen = (s) => new TextEncoder().encode(s).length;

// Lines longer than 75 bytes continue on the next line after one space (RFC 5545).
function fold(line) {
  const out = [];
  let rest = line, room = 75;
  while (byteLen(rest) > room) {
    let cut = room;
    while (byteLen(rest.slice(0, cut)) > room) cut--;
    out.push((out.length ? ' ' : '') + rest.slice(0, cut));
    rest = rest.slice(cut);
    room = 74;
  }
  out.push((out.length ? ' ' : '') + rest);
  return out;
}

const stamp = (d) => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;

export function makeIcs({ url, now, title, description }) {
  const toFriday = (5 - now.getDay() + 7) % 7;
  const first = new Date(now.getFullYear(), now.getMonth(), now.getDate() + toFriday, 12);
  const start = `${first.getFullYear()}${pad(first.getMonth() + 1)}${pad(first.getDate())}T090000`;
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Arbolinea//Friday practice//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:friday-practice-${stamp(now)}@arbolinea`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART:${start}`,
    'DURATION:PT10M',
    'RRULE:FREQ=WEEKLY;BYDAY=FR',
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(`${description} ${url}`)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return lines.flatMap(fold).join('\r\n') + '\r\n';
}

// ----- Timer: driven by clock time, so a sleeping tab still comes back right. -----

export function timeLeft(startedAtMs, nowMs, total = TIMER_SECONDS) {
  const elapsed = Math.max(0, (nowMs - startedAtMs) / 1000);
  return Math.max(0, Math.ceil(total - elapsed));
}

export function formatClock(seconds) {
  return `${Math.floor(seconds / 60)}:${pad(seconds % 60)}`;
}
