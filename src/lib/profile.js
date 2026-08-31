/* Profile store — SINGLE source of truth for stream, dream college, target percentile, exam date.
 * Every tab reads from here (Study Kit stream, Smart Revision countdown, Analysis target line,
 * Dashboard manifestation board). Change once in Profile → propagates everywhere. */

import { useEffect, useState } from 'react'

const KEY = 'cp_profile'
const EVENT = 'cp-profile-change'

export const STREAMS = {
  Commerce: ['English', 'Economics', 'Accountancy', 'Business Studies', 'General Test'],
  Humanities: ['English', 'History', 'Political Science', 'Geography', 'Psychology', 'General Test'],
  Science: ['English', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'General Test'],
}

const DEFAULTS = {
  stream: 'Commerce',
  subjects: [...STREAMS.Commerce],
  dreamCollege: 'Shri Ram College of Commerce (SRCC)',
  targetPercentile: 85,
  examDate: '2027-05-15',
  notif: { streak: true, revision: true, mocks: true },
}

export function loadProfile() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { ...DEFAULTS, ...raw, notif: { ...DEFAULTS.notif, ...(raw.notif || {}) } }
  } catch { return { ...DEFAULTS } }
}

export function saveProfile(p) {
  localStorage.setItem(KEY, JSON.stringify(p))
  window.dispatchEvent(new Event(EVENT))
}

export function useProfile() {
  const [profile, setProfile] = useState(loadProfile)
  useEffect(() => {
    const h = () => setProfile(loadProfile())
    window.addEventListener(EVENT, h)
    return () => window.removeEventListener(EVENT, h)
  }, [])
  const save = upd => saveProfile(typeof upd === 'function' ? upd(loadProfile()) : upd)
  return [profile, save]
}

/* dream college → short form for the manifestation "TO" slot */
export function dreamCollegeShort(full) {
  const m = String(full || '').match(/\(([^)]+)\)/)
  return m ? m[1] : (full || '—')
}
