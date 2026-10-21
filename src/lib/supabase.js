/* Supabase client — the URL and anon (publishable) key here are PUBLIC values
   meant to ship in the browser bundle. Service/secret keys live only server-side
   (Supabase dashboard + Management API), never in the frontend. */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ymrymcottiipiuiqmnvt.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_sAkXaFf95PsuIpxHEsro6Q_6FCLZjz5'

/* Google OAuth configured in Supabase dashboard. true → the Google buttons
   trigger a real OAuth redirect to Google and back. */
export const GOOGLE_AUTH_ENABLED = true

/* "Keep me logged in" maps to where the session token is stored:
   true → localStorage (persists), false → sessionStorage (clears on tab close). */
let sessionOnly = false
export function setSessionStorageMode(on) { sessionOnly = on }

const storage = {
  getItem: key => (sessionOnly ? sessionStorage : localStorage).getItem(key),
  setItem: (key, value) => (sessionOnly ? sessionStorage : localStorage).setItem(key, value),
  removeItem: key => { sessionStorage.removeItem(key); localStorage.removeItem(key) },
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
})
