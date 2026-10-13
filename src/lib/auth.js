/* TODO: replace with real auth provider (Firebase Auth / Supabase Auth with
   Google + Indian phone OTP). Local store for now — mirrors profile.js
   (storage + custom event + hook) so the internals can be swapped later
   without touching the UI. */
import { useEffect, useState } from 'react'

const KEY = 'cp_auth'
const EVENT = 'cp-auth-change'

/* session shape: { user: string, method: 'email'|'phone'|'google', at: number, remember: boolean } */

export function getSession() {
  try {
    const remembered = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (remembered && remembered.remember) return remembered
    return JSON.parse(sessionStorage.getItem(KEY) || 'null')
  } catch { return null }
}

export function signIn(session) {
  const s = { ...session, at: Date.now() }
  if (s.remember) {
    localStorage.setItem(KEY, JSON.stringify(s))
    sessionStorage.removeItem(KEY)
  } else {
    sessionStorage.setItem(KEY, JSON.stringify(s))
    localStorage.removeItem(KEY)
  }
  window.dispatchEvent(new Event(EVENT))
}

export function signOut() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
  window.dispatchEvent(new Event(EVENT))
}

export function useAuth() {
  const [session, setSession] = useState(getSession)
  useEffect(() => {
    const h = () => setSession(getSession())
    window.addEventListener(EVENT, h)
    return () => window.removeEventListener(EVENT, h)
  }, [])
  return [session, { signIn, signOut }]
}