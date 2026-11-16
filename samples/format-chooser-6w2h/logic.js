// Format chooser scoring. Pure: no DOM. Rules: spec "Firm rules" and "Assembling the pick".
import { QUESTIONS, FORMAT_NAMES, JOB_AID_NAMES } from './data.js';

const TYPE_PRIORITY = ['steps', 'reference', 'decision']; // when several checked answers carry a job aid type
const TIE_ORDER = ['J', 'R', 'S']; // ties go to the simpler build (our choice, stated on the page)

export function recommend(answers, questions = QUESTIONS) {
  const scores = { R: 0, S: 0, J: 0 };
  const flags = new Set();
  const notes = new Set();
  const reasons = [];
  const types = [];

  for (const q of questions) {
    const given = answers[q.id];
    // A multi question takes an array of ids (a single id still works); the others take one id.
    const wanted = q.multi && Array.isArray(given) ? given : [given];
    const picked = q.answers.filter((x) => wanted.includes(x.id)); // answer order
    if (!picked.length) continue;
    // Multi: average the checked answers, so the question keeps the same total weight.
    // Sum first, then divide once, so equal sums always compare equal.
    const sum = { R: 0, S: 0, J: 0 };
    for (const a of picked) for (const [k, v] of Object.entries(a.points ?? {})) sum[k] += v;
    for (const k of Object.keys(sum)) scores[k] += q.multi ? sum[k] / picked.length : sum[k];
    for (const a of picked) {
      (a.flags ?? []).forEach((f) => flags.add(f));
      (a.notes ?? []).forEach((n) => notes.add(n));
      if (a.jobAidType) types.push(a.jobAidType);
      if (a.reason) reasons.push({ text: a.reason, designer: a.designerReason, sources: a.sources ?? [] });
    }
  }
  const q1Type = TYPE_PRIORITY.find((t) => types.includes(t)) ?? null;

  const top = TIE_ORDER.reduce((best, k) => (scores[k] > scores[best] ? k : best), TIE_ORDER[0]);
  const notAlone = flags.has('jobAidNotAlone') || flags.has('trainingNeeded');
  const firmRules = [];

  let course = top === 'J' ? null : top;
  if (top === 'J' && notAlone) {
    course = scores.S > scores.R ? 'S' : 'R';
    firmRules.push('jobAidNotAlone');
  }
  if (flags.has('needsStoryline')) {
    firmRules.push('needsStoryline');
    course = course === 'R' || flags.has('phone') ? 'RS' : 'S';
  }
  const scenarioBlock = flags.has('scenarioBlock') && (course === 'R' || course === 'RS');

  if (flags.has('includeChecklist')) firmRules.push('includeChecklist');
  if (flags.has('includeJobAid')) firmRules.push('includeJobAid');
  const ruleAddsAid = flags.has('includeChecklist') || flags.has('includeJobAid');
  let jobAid = null;
  if (top === 'J' || ruleAddsAid) {
    const type = flags.has('includeChecklist') ? 'checklist' : q1Type ?? 'steps';
    const use = flags.has('trainingNeeded') ? 'verify' : 'during';
    jobAid = { type, use };
  }

  if (flags.has('includeJobAid') && flags.has('trainingNeeded')) notes.add('refresherPractice');
  if (flags.has('phone') && (course === 'S' || course === 'RS')) notes.add('storylineOnPhones');
  if (course === 'R' || course === 'RS') notes.add('license');
  if (!course) notes.delete('storylineUpdatesSlower');

  return { scores, top, course, scenarioBlock, jobAid, label: labelFor(course, scenarioBlock, jobAid), firmRules, reasons, notes: [...notes] };
}

function labelFor(course, scenarioBlock, jobAid) {
  let c = null;
  if (course === 'R') c = FORMAT_NAMES.R + (scenarioBlock ? ' with a Scenario block' : '');
  if (course === 'RS') c = FORMAT_NAMES.R + ' with a Storyline block' + (scenarioBlock ? ' and a Scenario block' : '');
  if (course === 'S') c = FORMAT_NAMES.S;
  if (!jobAid) return c;
  const aid = JOB_AID_NAMES[jobAid.type];
  const verify = jobAid.use === 'verify' ? ', used to check the work afterward' : '';
  if (!c) return `A PDF job aid: a ${aid}${verify}`;
  return `${c} plus a PDF ${aid}${verify}`;
}
