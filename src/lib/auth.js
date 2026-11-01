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
import { loadProfile, saveProfile } from './profile'

const GUEST_KEY = 'cp_guest'
const EVENT = 'cp-auth-change'

/* Session cache + Supabase listeners → a single EVENT re-renders the whole app. */
let cachedSession = null
supabase.auth.getSession().then(({ data }) => {
  cachedSession = data.session || null
  hydrateProfileName(cachedSession)
  window.dispatchEvent(new Event(EVENT))
})
supabase.auth.onAuthStateChange((_event, session) => {
  cachedSession = session
  hydrateProfileName(session)
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
    options: {
      redirectTo: window.location.origin,
      // Force the Google account chooser every time. Without this, Google
      // silently reuses the browser's existing session and skips the picker,
      // so the user never gets to select which Gmail to sign in with.
      queryParams: { prompt: 'select_account' },
    },
  })
  return { error }
}

export async function signOut() {
  await supabase.auth.signOut()
  localStorage.removeItem(GUEST_KEY)
  window.dispatchEvent(new Event(EVENT))
}

/* ── Session → local profile name ──
   The dashboard/shell read the name from the local `cp_profile` store, which
   now defaults to empty. After a real sign-in (email or Google) the account's
   name lives in the Supabase user metadata (email signup stores `name`; Google
   maps the display name to `name`/`full_name`). Mirror it into the local store
   so the UI shows the actual student instead of a stale/hardcoded name. Falls
   back to public.profiles for accounts created outside the app. */
export function hydrateProfileName(session) {
  const user = session?.user
  if (!user) return
  const meta = user.user_metadata || {}
  const name = meta.name || meta.full_name || meta.user_name || ''
  if (name) {
    const cur = loadProfile()
    if ((cur.name || '') !== name) saveProfile({ ...cur, name })
    return
  }
  supabase.from('profiles').select('name').eq('id', user.id).maybeSingle()
    .then(({ data }) => {
      if (data?.name) {
        const cur = loadProfile()
        if ((cur.name || '') !== data.name) saveProfile({ ...cur, name: data.name })
      }
    })
    .catch(() => {})
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
    target_score: profile?.targetScore ?? null,
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
  useEffect(() => {
    const h = () => { setSession(getSession()); setGuest(isGuest()) }
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
    guest,
    enterGuest,
    exitGuest,
  }]
}