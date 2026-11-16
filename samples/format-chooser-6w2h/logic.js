// Format chooser scoring. Pure: no DOM. Rules: spec "Firm rules" and "Assembling the pick".
import { QUESTIONS, FORMAT_NAMES, JOB_AID_NAMES } from './data.js';

const TIE_ORDER = ['J', 'R', 'S']; // ties go to the simpler build (our choice, stated on the page)

export function recommend(answers, questions = QUESTIONS) {
  const scores = { R: 0, S: 0, J: 0 };
  const flags = new Set();
  const notes = new Set();
  const reasons = [];
  let q1Type = null;

  for (const q of questions) {
    const a = q.answers.find((x) => x.id === answers[q.id]);
    if (!a) continue;
    for (const [k, v] of Object.entries(a.points ?? {})) scores[k] += v;
    (a.flags ?? []).forEach((f) => flags.add(f));
    (a.notes ?? []).forEach((n) => notes.add(n));
    if (a.jobAidType) q1Type = a.jobAidType;
    if (a.reason) reasons.push({ text: a.reason, designer: a.designerReason, sources: a.sources ?? [] });
  }

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
