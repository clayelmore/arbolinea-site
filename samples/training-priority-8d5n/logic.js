// Training priority tool logic. Pure: no DOM. Imported by app.js and by node tests.
// Every rule traces to docs/superpowers/specs/2026-11-16-training-decision-tools-design.md (Tool 2).

export const FACTORS = [
  { key: 'reach', label: 'Reach',
    question: 'How many people take it, compared with the rest of your catalog, over the last 12 months? Required assignments count.',
    why: 'Every improvement reaches more people when more people take the course.',
    help: 'Low reach is not low value. A small audience can be critical, or people may not be able to find the course.',
    anchors: ['Little or no use, and not required', 'Below typical', 'About typical', 'In your top quarter, or required for a department', 'One of the few courses most people take, or required for everyone'] },
  { key: 'importance', label: 'Importance',
    question: 'What goes wrong on the job if people get it wrong?',
    why: 'This is the cost of people getting it wrong.',
    help: 'Count revenue here only, not again under reach.',
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
    anchors: ['Useful for the job and easy to follow, no recurring complaints', 'Mostly positive, a few small issues', 'Mixed: some say parts are unclear or not relevant', 'Recurring comments that it is confusing, hard to use, or not relevant', 'Most say it does not help them do the job, or the same problem keeps being reported'] },
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
  { key: 'policy', label: 'Policy change' },
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
    const w = weights[f.key] ?? 0;
    num += w * (ratingFor(c, f.key) - 1);
    den += w;
  }
  if (den === 0) return null;
  return Math.round((100 * num) / (4 * den));
}

export function drivers(c, weights) {
  return FACTORS.map((f, i) => ({ key: f.key, i, v: (weights[f.key] ?? 0) * (ratingFor(c, f.key) - 1) }))
    .filter((x) => x.v > 0)
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
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 ? n : null;
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
      const was = weights[f.key] ?? 0;
      const w = { ...weights, [f.key]: Math.max(0, was + d) };
      if (w[f.key] === was) continue;
      if (FACTORS.every((g) => (w[g.key] ?? 0) === 0)) continue;
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
  if (FACTORS.every((f) => (weights[f.key] ?? 0) === 0)) {
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
