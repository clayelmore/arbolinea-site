// Training priority tool logic. Pure: no DOM. Imported by app.js and by node tests.
// Every rule traces to docs/superpowers/specs/2026-11-16-training-decision-tools-design.md (Tool 2).

export const FACTORS = [
  { key: 'reach', label: 'Reach',
    question: 'How many people take it, compared with the rest of your catalog, over the last 12 months? Required assignments count.',
    why: 'Every improvement reaches more people when more people take the course.',
    help: 'Reach only counts how many people take it. If a small group depends on the course, rate that under Importance. If few people take it because they cannot find it, fix that first.',
    anchors: ['Little or no use, and not required', 'Below typical', 'About typical', 'In your top quarter, or required for a department', 'One of the few courses most people take, or required for everyone'] },
  { key: 'importance', label: 'Importance',
    question: 'What goes wrong on the job if people get it wrong?',
    why: 'This is the cost of people getting it wrong.',
    help: 'Rate the harm here. Reach already counts how many people take it.',
    anchors: ['Nice to know', 'Minor rework', 'Noticeable errors or support calls', 'Revenue, customer, or quality harm', 'Safety, legal, or regulatory harm'] },
  { key: 'out_of_date', label: 'Out of date',
    question: 'How much has changed since the course was built?',
    why: 'Out-of-date content teaches the wrong thing.',
    help: 'No review in 18 to 24 months? Look again. Learner reports that it is outdated count here, not under feedback.',
    anchors: ['Accurate and recently reviewed', 'Cosmetic (branding, screenshots)', 'Dated examples or terms, broken links', 'Steps, systems, or roles changed', 'Wrong or superseded'] },
  { key: 'works', label: 'Works for everyone',
    question: 'Can everyone use it, and does it still run?',
    why: 'A course that some people cannot use, or that will not run, fails them no matter how good it is.',
    help: 'Check captions, keyboard access, and whether it launches on current browsers.',
    anchors: ['Fine', 'Small fixes', 'Needs work (missing captions, no keyboard access)', 'Major barriers', 'Serious problems, or it will not launch'] },
  { key: 'feedback', label: 'Learner feedback',
    question: 'What do learners say about how useful and clear it is?',
    why: 'Recurring complaints about usefulness or clarity point to problems you can fix.',
    help: 'Look at comments, focus groups, where people drop off, quiz questions most people miss, and help-desk tickets. Star ratings of how much people liked it are a weak signal on their own. No data counts as a 3.',
    anchors: ['Useful for the job and easy to follow, no recurring complaints', 'Mostly positive, isolated small issues', 'Mixed: some say parts are unclear or not relevant', 'Recurring comments that it is confusing, hard to use, or not relevant', 'Most say it does not help them do the job, or the same problem keeps being reported'] },
];

export const EFFORT = {
  key: 'effort', label: 'Effort to update',
  question: 'How much work would the update take?',
  why: 'Effort tells you how to plan the work, not whether it matters, so it is not part of the score.',
  anchors: ['An afternoon', 'A few days', 'A couple of weeks', 'A month or more', 'A rebuild'],
};

export const DEFAULT_WEIGHTS = { reach: 25, importance: 30, out_of_date: 20, works: 15, feedback: 10 };

export const REASON_TYPES = [
  { key: 'law', label: 'Law or regulation' },
  { key: 'policy', label: 'Company policy' },
  { key: 'safety', label: 'Safety' },
  { key: 'audit', label: 'Audit finding' },
  { key: 'wont-launch', label: 'Will not launch' },
];

export const GROUPS = [
  { key: 'required', label: 'Required' },
  { key: 'doFirst', label: 'Do first' },
  { key: 'next', label: 'Next' },
  { key: 'later', label: 'Later' },
];

export const HINTS = {
  retire: 'Consider retiring. Check with the owner first: low use can mean a small critical audience or a course people cannot find.',
  merge: 'Consider merging it with the course it overlaps.',
  major: 'Plan this as a major project.',
};

const RATED = ['reach', 'importance', 'out_of_date', 'works', 'effort'];
const isRating = (v) => Number.isInteger(v) && v >= 1 && v <= 5;
const labelOf = (key) => (key === 'effort' ? EFFORT.label : FACTORS.find((f) => f.key === key).label);
const wt = (weights, key) => Number(weights[key] ?? 0) || 0;
const allZero = (weights) => FACTORS.every((f) => wt(weights, f.key) === 0);
const ratingFor = (c, key) => (key === 'feedback' && c.feedback === 'none' ? 3 : c[key]);

export function emptyCourse(id) {
  return { id, course: '', reach: null, importance: null, out_of_date: null, works: null, feedback: null, effort: null,
    must_change: false, reason: '', reason_note: '', reason_date: '', overlap: false };
}

const ex = (id, course, reach, importance, out_of_date, works, feedback, effort, extra = {}) =>
  ({ ...emptyCourse(id), course, reach, importance, out_of_date, works, feedback, effort, ...extra });

export const EXAMPLE_COURSES = [
  ex('ex1', 'Forklift safety refresher', 4, 5, 5, 2, 3, 3, { must_change: true, reason: 'safety', reason_note: 'A new forklift model joined the fleet' }),
  ex('ex2', 'New hire orientation', 5, 3, 4, 3, 4, 4),
  ex('ex3', 'Customer refunds walkthrough', 4, 4, 4, 2, 3, 2),
  ex('ex4', 'Expense report basics', 3, 2, 2, 1, 2, 1),
  ex('ex5', 'Legacy Flash product tour', 1, 2, 3, 5, 'none', 5),
  ex('ex6', 'Phone etiquette', 3, 2, 2, 1, 3, 1, { overlap: true }),
  ex('ex7', 'Data privacy basics', 5, 4, 3, 2, 2, 2),
  ex('ex8', 'Warehouse picking system', 3, 5, 4, 2, 3, 3),
];

export function validateCourse(c) {
  const p = [];
  const name = (c.course ?? '').trim();
  if (!name) p.push('Course name is required');
  else if (name.length > 120) p.push('Course name is over 120 characters');
  for (const k of RATED) if (!isRating(c[k])) p.push(`${labelOf(k)} must be 1 to 5`);
  if (!(isRating(c.feedback) || c.feedback === 'none')) p.push('Learner feedback must be 1 to 5, or No data');
  if (c.must_change && !REASON_TYPES.some((r) => r.key === c.reason)) p.push('Must change needs a reason');
  p.push(...(c.csvProblems ?? []));
  return p;
}

export function needScore(c, weights) {
  let num = 0;
  let den = 0;
  for (const f of FACTORS) {
    const w = wt(weights, f.key);
    num += w * (ratingFor(c, f.key) - 1);
    den += w;
  }
  if (den === 0) return null;
  return Math.round((100 * num) / (4 * den));
}

export function drivers(c, weights) {
  return FACTORS.map((f, i) => ({ key: f.key, i, v: wt(weights, f.key) * (ratingFor(c, f.key) - 1) }))
    .filter((x) => x.v > 0 && !(x.key === 'feedback' && c.feedback === 'none'))
    .sort((a, b) => b.v - a.v || a.i - b.i)
    .slice(0, 2)
    .map((x) => x.key);
}

export function effortLabel(e) { return e <= 2 ? 'Quick fix' : e === 3 ? 'Moderate' : 'Major project'; }

export function hintsFor(c) {
  const h = [];
  if (!c.must_change && c.reach <= 2 && c.importance <= 2) h.push('retire');
  if (c.overlap) h.push('merge');
  if (c.effort >= 4) h.push('major');
  return h;
}

export function validCapacity(v) {
  if (v == null || String(v).trim() === '') return null;
  if (typeof v !== 'string' && typeof v !== 'number') return null;
  if (!/^\s*\d+\s*$/.test(String(v))) return null;
  const n = Number(v);
  return n >= 1 ? n : null;
}

function ordered(courses, weights) {
  return courses.map((c) => ({ c, score: needScore(c, weights) }))
    .sort((a, b) => b.score - a.score || a.c.effort - b.c.effort || b.c.importance - a.c.importance
      || a.c.course.trim().localeCompare(b.c.course.trim()));
}

function assignGroups(courses, weights, capacity) {
  const groups = new Map();
  const required = courses.filter((c) => c.must_change);
  required.forEach((c) => groups.set(c.id, 'required'));
  const pool = ordered(courses.filter((c) => !c.must_change), weights);
  if (capacity) {
    const k = Math.max(capacity - required.length, 0);
    pool.forEach((x, i) => groups.set(x.c.id, i < k ? 'doFirst' : i < k + capacity ? 'next' : 'later'));
  } else {
    pool.forEach((x) => groups.set(x.c.id, x.score >= 70 ? 'doFirst' : x.score >= 45 ? 'next' : 'later'));
  }
  return { groups, pool, required };
}

function closeCallIds(courses, weights, capacity, base) {
  const ids = new Set();
  for (const f of FACTORS) {
    for (const d of [10, -10]) {
      const was = wt(weights, f.key);
      const w = { ...weights, [f.key]: Math.max(0, was + d) };
      if (w[f.key] === was) continue;
      if (allZero(w)) continue;
      const { groups } = assignGroups(courses, w, capacity);
      for (const c of courses) if (!c.must_change && groups.get(c.id) !== base.get(c.id)) ids.add(c.id);
    }
  }
  return ids;
}

export function rankCourses(courses, weights, capacityInput) {
  const capacity = validCapacity(capacityInput);
  const valid = courses.filter((c) => validateCourse(c).length === 0);
  const leftOut = courses.length - valid.length;
  if (allZero(weights)) {
    return { error: 'Set at least one weight above zero.', leftOut, capacity, warnings: [], groups: null };
  }
  const { groups, pool, required } = assignGroups(valid, weights, capacity);
  const close = closeCallIds(valid, weights, capacity, groups);
  const item = (c, score) => ({
    id: c.id, course: c.course.trim(), score, group: groups.get(c.id), effortLabel: effortLabel(c.effort),
    drivers: drivers(c, weights), hints: hintsFor(c), closeCall: close.has(c.id), noFeedbackData: c.feedback === 'none', row: c,
  });
  const out = { required: [], doFirst: [], next: [], later: [] };
  ordered(required, weights).forEach((x) => out.required.push(item(x.c, x.score)));
  pool.forEach((x) => out[groups.get(x.c.id)].push(item(x.c, x.score)));
  const warnings = [];
  if (capacity && required.length >= capacity) warnings.push('Required work alone fills this cycle.');
  if (valid.length && required.length > valid.length / 2) {
    warnings.push('More than half the list is marked Must change. Check that each one is truly required; only the required change is mandatory.');
  }
  return { error: null, leftOut, capacity, warnings, groups: out };
}

// ---------------------------------------------------------------- CSV
export const CSV_COLUMNS = ['course', 'reach', 'importance', 'out_of_date', 'works', 'feedback', 'effort', 'must_change', 'reason', 'overlap'];
const REQUIRED_COLUMNS = ['course', 'reach', 'importance', 'out_of_date', 'works', 'feedback', 'effort'];
export const MAX_ROWS = 200;
const TRUE_WORDS = ['yes', 'y', 'true', '1', 'x'];
const FALSE_WORDS = ['', 'no', 'n', 'false', '0'];
const REASON_PATTERNS = [
  [/^(law|regulation)\b/i, 'law'],
  [/^(company )?policy\b/i, 'policy'],
  [/^safety\b/i, 'safety'],
  [/^audit\b/i, 'audit'],
  [/^(won'?t launch|will not launch|wont-launch)\b/i, 'wont-launch'],
];

export function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

const parseRating = (s) => (/^[1-5]$/.test(s.trim()) ? Number(s.trim()) : null);

export function importCsv(text, makeId) {
  const records = parseCsvText(text);
  if (!records.length) return { courses: [], error: 'Nothing to import.', notes: [] };
  const header = records[0].map((h) => h.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) {
    return { courses: [], notes: [],
      error: `Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}. The header must include ${REQUIRED_COLUMNS.join(',')}.` };
  }
  const col = (rec, name) => { const i = header.indexOf(name); return i === -1 ? '' : (rec[i] ?? ''); };
  const notes = [];
  let data = records.slice(1);
  if (data.length > MAX_ROWS) { notes.push(`Only the first ${MAX_ROWS} rows were added.`); data = data.slice(0, MAX_ROWS); }
  const courses = data.map((rec, n) => {
    const c = emptyCourse(makeId(n));
    c.course = col(rec, 'course').trim().replace(/^'(?=[=+\-@\t\r])/, '');
    for (const k of ['reach', 'importance', 'out_of_date', 'works', 'effort']) c[k] = parseRating(col(rec, k));
    const fb = col(rec, 'feedback').trim().toLowerCase();
    c.feedback = fb === '' || fb === 'no data' || fb === 'none' ? 'none' : parseRating(fb);
    c.csvProblems = [];
    const flag = (name) => {
      const v = col(rec, name).trim().toLowerCase();
      if (TRUE_WORDS.includes(v)) return true;
      if (FALSE_WORDS.includes(v)) return false;
      c.csvProblems.push(`${name} must be yes or no`);
      return false;
    };
    c.must_change = flag('must_change');
    c.overlap = flag('overlap');
    const reasonText = col(rec, 'reason').trim();
    const lower = reasonText.toLowerCase();
    const names = REASON_TYPES.flatMap((t) => [[t.label.toLowerCase(), t], [t.key, t]]).sort((x, y) => y[0].length - x[0].length);
    const exact = names.find(([n]) => lower === n || (lower.startsWith(n) && /^\s*[:-]/.test(reasonText.slice(n.length))));
    const hit = exact ? null : REASON_PATTERNS.find(([re]) => re.test(reasonText));
    if (exact) {
      c.reason = exact[1].key;
      c.reason_note = reasonText.slice(exact[0].length).replace(/^\s*[:-]\s*/, '').trim();
    } else if (hit) {
      c.reason = hit[1];
      c.reason_note = reasonText.replace(hit[0], '').replace(/^\s*[:-]\s*/, '').trim();
    } else c.reason_note = reasonText;
    const rd = col(rec, 'reason_date').trim();
    c.reason_date = /^\d{4}-\d{2}-\d{2}$/.test(rd) && ['law', 'policy', 'safety', 'audit'].includes(c.reason) ? rd : '';
    return c;
  });
  return { courses, error: null, notes };
}

// Spreadsheet formula guard for user text cells: a leading apostrophe keeps Excel and Sheets from running it.
const guard = (v) => { const s = String(v ?? ''); return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s; };
const esc = (v) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };

// A file picked with "Choose a CSV file": the reason it cannot be used, or null when it can.
export const MAX_FILE_BYTES = 1000000;
export function fileProblem(name, size) {
  if (/\.(xlsx|xls|xlsm|numbers|ods)$/i.test(name)) return 'That is a spreadsheet file. Save it as CSV first, then choose the CSV.';
  if (size > MAX_FILE_BYTES) return 'That file is too large for a course list.';
  return null;
}

// The example courses as a CSV in the documented column order, for the "Download a sample CSV" button.
export function sampleCsv() {
  const lines = [CSV_COLUMNS.join(',')];
  for (const c of EXAMPLE_COURSES) {
    const type = REASON_TYPES.find((t) => t.key === c.reason);
    const reason = type ? [type.label, c.reason_note].filter(Boolean).join(': ') : c.reason_note;
    lines.push([guard(c.course), c.reach, c.importance, c.out_of_date, c.works, c.feedback === 'none' ? 'no data' : c.feedback, c.effort,
      c.must_change ? 'yes' : 'no', guard(c.must_change ? reason : ''), c.overlap ? 'yes' : 'no'].map(esc).join(','));
  }
  return lines.join('\n') + '\n';
}

export function toCsv(result) {
  const lines = [[...CSV_COLUMNS.slice(0, 9), 'reason_date', 'overlap', 'need_score', 'group', 'effort_label', 'drivers', 'hints'].join(',')];
  if (!result.groups) return lines[0] + '\n';
  for (const g of GROUPS) {
    for (const it of result.groups[g.key]) {
      const r = it.row;
      const type = REASON_TYPES.find((t) => t.key === r.reason);
      const reason = type ? [type.label, r.reason_note].filter(Boolean).join(': ') : r.reason_note;
      lines.push([
        guard(r.course.trim()), r.reach, r.importance, r.out_of_date, r.works, r.feedback === 'none' ? 'no data' : r.feedback, r.effort,
        r.must_change ? 'yes' : 'no', guard(r.must_change ? reason : ''), guard(r.must_change ? (r.reason_date || '') : ''), r.overlap ? 'yes' : 'no',
        it.score, g.label, it.effortLabel,
        guard(it.drivers.map((k) => FACTORS.find((f) => f.key === k).label).join('; ')),
        guard([...it.hints.map((h) => HINTS[h]), it.closeCall ? 'Close call.' : ''].filter(Boolean).join(' ')),
      ].map(esc).join(','));
    }
  }
  return lines.join('\n') + '\n';
}
