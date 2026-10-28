/* Auth store — Supabase-backed. Same public surface as the old mock (getSession,
   signOut, enterGuest, exitGuest, isGuest, useAuth) so the shell, GuestWall and
   all the guest gates keep working unchanged. The only additions are the async
   Supabase helpers (signUp / signInWithEmail / signInWithGoogle) and
   syncProfile(), which mirrors the local profile into public.profiles.

   Guest mode (AfterBoards-style): a visitor sets cp_guest to browse freely.
   isGuest() is only true when that flag is set AND there is no real Supabase
   session — signing in immediately promotes them out of guest mode. */
import { useEffect, useState } from 'react'
import { supabase, setSessionStorageMode, GOOGLE_AUTH_ENABLED } from './supabase'

const GUEST_KEY = 'cp_guest'
const EVENT = 'cp-auth-change'

/* Session cache + Supabase listeners → a single EVENT re-renders the whole app. */
let cachedSession = null
supabase.auth.getSession().then(({ data }) => {
  cachedSession = data.session || null
  window.dispatchEvent(new Event(EVENT))
})
/* Tracks the PASSWORD_RECOVERY event so App can show the "set new password"
   screen instead of the shell while the recovery session is active. */
let recoveryMode = false
supabase.auth.onAuthStateChange((event, session) => {
  cachedSession = session
  if (event === 'PASSWORD_RECOVERY') recoveryMode = true
  window.dispatchEvent(new Event(EVENT))
})

export function getSession() {
  return cachedSession
}

/* ── Supabase auth actions (all async) ── */

export async function signUp({ email, password, name, mobile }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, mobile } },
  })
  // If the email is already registered, Supabase returns an error (and no
  // session) — the call site falls back to signInWithEmail in that case.
  return { session: data?.session || null, user: data?.user || null, error }
}

export async function signInWithEmail({ email, password, remember = true }) {
  setSessionStorageMode(!remember)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { session: data?.session || null, user: data?.user || null, error }
}

export async function signInWithGoogle() {
  // GOOGLE_AUTH_ENABLED guards the OAuth redirect: if it's ever flipped off,
  // the UI shows a toast instead of navigating to a GoTrue error page.
  if (!GOOGLE_AUTH_ENABLED) {
    return { error: new Error('Google sign-in is not set up yet.') }
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  return { error }
}

export async function signOut() {
  await supabase.auth.signOut()
  localStorage.removeItem(GUEST_KEY)
  window.dispatchEvent(new Event(EVENT))
}

/* ── Password reset ── */
export async function sendPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/',
  })
  return { error }
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({ password })
  return { error }
}

export function isPasswordRecovery() {
  return recoveryMode
}

export function clearPasswordRecovery() {
  recoveryMode = false
  window.dispatchEvent(new Event(EVENT))
}

/* ── Profile → Supabase (public.profiles) ── */
export async function syncProfile(profile) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: new Error('Not signed in') }
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name: profile?.name ?? '',
    email: user.email,
    mobile: profile?.mobile ?? null,
    stream: profile?.stream ?? null,
    subjects: profile?.subjects ?? [],
    dream_college: profile?.dreamCollege ?? null,
    target_percentile: profile?.targetPercentile ?? null,
    exam_date: profile?.examDate ?? null,
    updated_at: new Date().toISOString(),
  })
  return { error }
}

/* Map raw Supabase errors to friendly, student-facing English. */
export function friendlyAuthError(error) {
  if (!error) return ''
  const m = String(error.message || '').toLowerCase()
  if (m.includes('already registered')) return 'This email already has an account. Try logging in instead.'
  if (m.includes('invalid login credentials')) return 'Incorrect email or password.'
  if (m.includes('email not confirmed')) return 'Please confirm your email first.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts. Please wait a moment and try again.'
  if (m.includes('password should be')) return 'Password is too weak. Use at least 6 characters.'
  if (m.includes('sms') || m.includes('twilio') || m.includes('messagebird') || m.includes('vonage')) return 'Phone login is not set up yet.'
  if (m.includes('provider') || m.includes('oauth') || m.includes('google')) return 'Google sign-in is not set up yet.'
  return error.message || 'Something went wrong. Please try again.'
}

/* ── Guest mode (unchanged) ── */

export function enterGuest() {
  localStorage.setItem(GUEST_KEY, '1')
  window.dispatchEvent(new Event(EVENT))
}

export function exitGuest() {
  localStorage.removeItem(GUEST_KEY)
  window.dispatchEvent(new Event(EVENT))
}

export function isGuest() {
  try {
    return localStorage.getItem(GUEST_KEY) === '1' && !getSession()
  } catch { return false }
}

export function useAuth() {
  const [session, setSession] = useState(getSession)
  const [guest, setGuest] = useState(isGuest)
  const [recovery, setRecovery] = useState(isPasswordRecovery)
  useEffect(() => {
    const h = () => { setSession(getSession()); setGuest(isGuest()); setRecovery(isPasswordRecovery()) }
    window.addEventListener(EVENT, h)
    return () => window.removeEventListener(EVENT, h)
  }, [])
  return [session, {
    signIn: signInWithEmail,
    signUp,
    signInWithGoogle,
    signOut,
    syncProfile,
    friendlyAuthError,
    sendPasswordReset,
    updatePassword,
    clearPasswordRecovery,
    guest,
    enterGuest,
    exitGuest,
    recovery,
  }]
}