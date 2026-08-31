/* Spaced repetition + countdown-aware revision queue — core of Smart Revision.
 * Reuses: flashcard mastery (Study Kit), boost ranking + mistakes (Analysis), exam date (profile).
 */

export const INTERVALS = [1, 3, 7, 14, 30]

export function paceBadge(daysLeft) {
  if (daysLeft > 21) return { label: 'Normal pace', color: 'var(--green-500)', bg: 'var(--green-50)' }
  if (daysLeft > 7) return { label: 'Ramping up', color: 'var(--warning-500)', bg: 'var(--warning-100)' }
  return { label: 'Final sprint', color: 'var(--red-500)', bg: 'var(--red-100)' }
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
export function addDaysISO(n) {
  const d = new Date(); d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
export function daysUntil(iso) {
  const ms = new Date(iso) - new Date()
  return Math.max(1, Math.ceil(ms / 86400000))
}

/* advance an item's recall state — SM-2 style, independent of accuracy data */
export function review(item, correct) {
  if (correct) {
    const stage = Math.min((item.stage || 0) + 1, INTERVALS.length - 1)
    return { ...item, stage, next: addDaysISO(INTERVALS[stage]), mastered: stage === INTERVALS.length - 1, wrongs: 0 }
  }
  return { ...item, stage: 0, next: addDaysISO(1), mastered: false, wrongs: (item.wrongs || 0) + 1 }
}

export function isDue(item, today = todayISO()) {
  return item.state !== 'mastered' && (!item.next || item.next <= today)
}

/* Default deck — mixed recall states across subjects (preview; mastery data later comes from Study Kit) */
export function defaultDeck() {
  const t = todayISO()
  return [
    { id: 1, subj: 'Economics', front: 'Repo Rate', back: 'Rate at which RBI lends short-term funds to commercial banks', state: 'mastered', stage: 4, next: addDaysISO(-2) },
    { id: 2, subj: 'Economics', front: 'Fiscal Deficit', back: 'Total expenditure − total receipts, excluding borrowings', state: 'due', stage: 2, next: addDaysISO(-1) },
    { id: 3, subj: 'Economics', front: 'Monetary Policy', back: 'RBI actions controlling money supply and interest rates', state: 'due', stage: 1, next: t },
    { id: 4, subj: 'Economics', front: 'Liquidity', back: 'How quickly an asset can be converted into cash', state: 'learning', stage: 1, next: addDaysISO(1) },
    { id: 5, subj: 'Accountancy', front: 'Current Ratio', back: 'Current Assets / Current Liabilities', state: 'mastered', stage: 4, next: addDaysISO(-4) },
    { id: 6, subj: 'Accountancy', front: 'Working Capital', back: 'Current Assets − Current Liabilities', state: 'due', stage: 3, next: addDaysISO(-2) },
    { id: 7, subj: 'Accountancy', front: 'Debt-Equity Ratio', back: 'Total Debt / Shareholder Equity', state: 'new', stage: 0, next: null },
    { id: 8, subj: 'Business Studies', front: 'Break-Even Point', back: 'Fixed Costs / (Price − Variable Cost)', state: 'due', stage: 2, next: addDaysISO(-1) },
    { id: 9, subj: 'Business Studies', front: 'Marketing Mix', back: 'Product, Price, Place, Promotion', state: 'learning', stage: 1, next: addDaysISO(2) },
    { id: 10, subj: 'English', front: 'Elucidate', back: 'To explain clearly', state: 'mastered', stage: 4, next: addDaysISO(-6) },
    { id: 11, subj: 'English', front: 'Ubiquitous', back: 'Present everywhere', state: 'due', stage: 1, next: t },
    { id: 12, subj: 'English', front: 'Ephemeral', back: 'Lasting a very short time', state: 'new', stage: 0, next: null },
    { id: 13, subj: 'General Test', front: 'Mean formula', back: 'Sum of values / number of values', state: 'mastered', stage: 4, next: addDaysISO(-3) },
    { id: 14, subj: 'General Test', front: 'Syllogism: All A are B ⇒', back: 'Cannot conclude all B are A', state: 'due', stage: 2, next: addDaysISO(-1) },
    { id: 15, subj: 'General Test', front: 'Compound interest', back: 'P(1 + r/100)ⁿ − P', state: 'learning', stage: 1, next: addDaysISO(1) },
    { id: 16, subj: 'Economics', front: 'Opportunity Cost', back: 'Value of the next best alternative given up', state: 'new', stage: 0, next: null },
    { id: 17, subj: 'Accountancy', front: 'Gross Profit', back: 'Net Sales − Cost of Goods Sold', state: 'mastered', stage: 4, next: addDaysISO(-5) },
    { id: 18, subj: 'Business Studies', front: 'Span of Control', back: 'Number of subordinates a manager directly supervises', state: 'new', stage: 0, next: null },
    { id: 19, subj: 'English', front: 'Altruistic', back: 'Selflessly concerned for others', state: 'learning', stage: 1, next: addDaysISO(1) },
    { id: 20, subj: 'General Test', front: 'Average speed', back: 'Total distance / total time', state: 'due', stage: 2, next: t },
  ]
}

/* ── Countdown-aware queue generation ──
 * One function, three inputs: (1) spaced-repetition due state, (2) boost ranking
 * (exam weight × accuracy), (3) days left. Pace shifts the composition. */
export function generateQueue({ deck, boost, daysLeft }) {
  const due = deck.filter(c => isDue(c))
  const mastered = deck.filter(c => c.state === 'mastered')
  const weak = boost.filter(t => t.acc < 60)
  const heavy = boost.filter(t => t.weight >= 5 && t.acc < 75)
  const highPriority = [...heavy, ...weak].sort((a, b) => b.gain - a.gain)

  /* weak/high-weight topics as recall prompts */
  const toPrompts = list => list.slice(0, 8).map((t, i) => ({
    id: 't' + i, type: 'topic', subj: t.subject, front: t.name, back: t.subject + ' — revise ' + t.name + ': notes + 5 practice questions. Accuracy ' + Math.round(t.acc) + '%.', topic: t.name,
  }))

  if (daysLeft <= 7) {
    /* Final sprint: almost entirely high-weight + weak topics; mastered excluded; light due */
    return [...toPrompts(highPriority), ...due.filter(c => !c.mastered).slice(0, 5)]
  }
  if (daysLeft <= 21) {
    /* Ramping up: heavier weak/high-weight pull, still full due set */
    return [...due, ...toPrompts(highPriority.slice(0, 6))]
  }
  /* Normal pace: mostly spaced-repetition due items, light weak-topic touch */
  return [...due, ...toPrompts(highPriority.slice(0, 3))]
}

/* Cheat sheets — auto-compiled per subject: formulas + key notes + repeated mistakes */
export function cheatSheets(mistakes) {
  const subs = ['Economics', 'Accountancy', 'Business Studies', 'English', 'General Test']
  return subs.map(s => {
    const ms = mistakes.filter(m => m.subj === s)
    return {
      subject: s,
      lastUpdated: 'Updated ' + (ms.length ? 'just now' : '2 h ago'),
      items: 'Formula sheet · key note highlights' + (ms.length ? ' · ' + ms.map(m => m.topic).join(', ') : ''),
      mistakeCount: ms.length,
    }
  })
}
