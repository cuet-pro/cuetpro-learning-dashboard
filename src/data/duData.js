import raw from './DU_cutoffs_seats_2026.json'
import { colleges } from './colleges'
import { programs } from './programs'

export { colleges, programs }

const collegeMap = new Map(colleges.map(c => [c.id, c]))
const programMap = new Map(programs.map(p => [p.id, p]))

export const offerings = raw.map(r => ({
  collegeId: r.collegeId,
  collegeName: r.college,
  programId: r.programId,
  programName: r.program,
  college: collegeMap.get(r.collegeId) || null,
  cutoffs: r.cutoffs || {},
  seats: r.seats || {},
}))

export function getCutoff(o, cat = 'UR', round = 1) {
  return o.cutoffs?.[cat]?.['round' + round] ?? null
}
export function getSeats(o, cat = 'UR') {
  return o.seats?.[cat]?.total ?? null
}
export function topCutoff(o) {
  return Math.max(getCutoff(o, 'UR', 1) || 0, getCutoff(o, 'UR', 2) || 0, getCutoff(o, 'UR', 3) || 0)
}
export function collegesForProgram(programId) {
  return offerings.filter(o => o.programId === programId)
}
export function programsForCollege(collegeId) {
  return offerings.filter(o => o.collegeId === collegeId)
}
export const CATEGORIES = ['UR', 'OBC', 'SC', 'ST', 'EWS', 'PwD']
