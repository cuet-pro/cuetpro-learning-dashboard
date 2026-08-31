/* Shared analysis data + boost ranking — single source of truth for Analysis, Study Kit, Focus mock */

export const SUBJECTS = [
  {
    name: 'English', acc: 88, attempts: 350, avgTime: 24, weight: 25,
    trend: [82, 84, 86, 85, 87, 88],
    mistakes: [{ topic: 'Grammar & usage', count: 2 }],
    subSkills: [
      { name: 'Vocabulary', acc: 74, weight: 8, hours: 5, attempts: 90 },
      { name: 'Grammar & usage', acc: 68, weight: 6, hours: 6, attempts: 70 },
      { name: 'Reading comprehension', acc: 88, weight: 6, hours: 4, attempts: 80 },
      { name: 'Para-jumbles & odd sentence', acc: 55, weight: 3, hours: 4, attempts: 40 },
      { name: 'Sentence correction', acc: 72, weight: 2, hours: 3, attempts: 35 },
    ],
  },
  {
    name: 'Economics', acc: 61, attempts: 350, avgTime: 36, weight: 25,
    trend: [52, 55, 58, 56, 60, 61],
    mistakes: [{ topic: 'Money & banking', count: 4 }],
    subSkills: [
      { name: 'National income', acc: 62, weight: 7, hours: 6, attempts: 85 },
      { name: 'Money & banking', acc: 48, weight: 6, hours: 8, attempts: 78 },
      { name: 'Microeconomics', acc: 58, weight: 7, hours: 7, attempts: 90 },
      { name: 'Current affairs (eco)', acc: 51, weight: 5, hours: 9, attempts: 60 },
    ],
  },
  {
    name: 'Accountancy', acc: 81, attempts: 350, avgTime: 30, weight: 25,
    trend: [74, 76, 78, 77, 80, 81],
    mistakes: [],
    subSkills: [
      { name: 'Journal & ledger', acc: 78, weight: 7, hours: 5, attempts: 85 },
      { name: 'Financial statements', acc: 84, weight: 7, hours: 4, attempts: 92 },
      { name: 'Partnership accounts', acc: 76, weight: 6, hours: 6, attempts: 75 },
      { name: 'Company accounts', acc: 70, weight: 5, hours: 6, attempts: 60 },
    ],
  },
  {
    name: 'Business Studies', acc: 64, attempts: 350, avgTime: 31, weight: 12.5,
    trend: [58, 60, 62, 61, 63, 64],
    mistakes: [{ topic: 'Marketing', count: 2 }],
    subSkills: [
      { name: 'Principles of management', acc: 66, weight: 5, hours: 5, attempts: 70 },
      { name: 'Business environment', acc: 58, weight: 4, hours: 4, attempts: 55 },
      { name: 'Marketing', acc: 52, weight: 3.5, hours: 4, attempts: 60 },
    ],
  },
  {
    name: 'General Test', acc: 45, attempts: 350, avgTime: 42, weight: 12.5,
    trend: [38, 40, 41, 43, 44, 45],
    mistakes: [{ topic: 'Quantitative ability', count: 3 }],
    subSkills: [
      { name: 'Data interpretation', acc: 60, weight: 4, hours: 6, attempts: 80 },
      { name: 'Logical reasoning', acc: 55, weight: 3.5, hours: 5, attempts: 75 },
      { name: 'General knowledge', acc: 51, weight: 3, hours: 10, attempts: 70 },
      { name: 'Quantitative ability', acc: 38, weight: 2, hours: 8, attempts: 62 },
    ],
  },
]

/* Streams → subject sets */
export const STREAMS = {
  Commerce: ['English', 'Economics', 'Accountancy', 'Business Studies', 'General Test'],
  Humanities: ['English', 'History', 'Political Science', 'Geography', 'Psychology', 'General Test'],
  Science: ['English', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'General Test'],
}

export const CEILING = 90
export const MIN_ATTEMPTS = 15

export function status(acc) {
  if (acc >= 75) return { color: 'var(--green-500)', label: 'on track' }
  if (acc >= 50) return { color: 'var(--warning-500)', label: 'needs attention' }
  return { color: 'var(--red-500)', label: 'weak' }
}

export function allSubSkills(subject = 'all') {
  const subs = subject === 'all' ? SUBJECTS : SUBJECTS.filter(s => s.name === subject)
  return subs.flatMap(s => s.subSkills.map(sk => ({ ...sk, subject: s.name })))
}

/* score_gain_per_hour = (exam_weight% × improvement_gap) / estimated_hours_to_fix */
export function boostRanking(subject = 'all') {
  return allSubSkills(subject)
    .filter(sk => sk.attempts >= MIN_ATTEMPTS)
    .map(sk => ({ ...sk, gap: CEILING - sk.acc, gain: (sk.weight * (CEILING - sk.acc)) / (sk.hours * 10) }))
    .sort((a, b) => b.gain - a.gain)
}

/* plain-language reason — dominant factor only */
export function boostReason(r, highW) {
  if (r.acc >= 80) return 'Already strong, little to gain'
  const bigGap = r.gap >= 35
  const heavy = r.weight >= highW
  const tinyGap = r.gap < 15
  if (heavy && bigGap) return 'Worth a good chunk of marks'
  if (bigGap) return "You're falling behind here"
  if (heavy && tinyGap) return 'Small topic, easy marks — you are already close'
  return 'Worth fixing — steady improvement here'
}

/* topics flagged weak (acc < 50) — used by PYQ weak-topic filter */
export function weakTopicNames(subject = 'all') {
  return allSubSkills(subject).filter(sk => sk.acc < 50).map(sk => sk.name)
}
