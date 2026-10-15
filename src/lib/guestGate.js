/* Guest gate — AfterBoards-style "login wall at the point of intent".

   useGuestGate() returns gate(feature, action, fn):
     - guest  → opens the GuestWall and stores fn as the pending action
     - authed → runs fn immediately

   The pending action is held at module level so it survives the wall opening
   and the Google sign-in round-trip; `takePending()` runs it exactly once after
   auth succeeds. */
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './auth'

let pendingFn = null
let wallData = null
const subs = new Set()
const notify = () => subs.forEach(l => l())

export function openGuestWall(feature, action, fn) {
  pendingFn = fn
  wallData = { feature, action }
  notify()
}

export function closeGuestWall() {
  wallData = null
  notify()
}

/* Return + clear the pending action (runs once after successful auth). */
export function takePending() {
  const fn = pendingFn
  pendingFn = null
  return fn
}

/* Hook for gated CTAs. */
export function useGuestGate() {
  const [, { guest }] = useAuth()
  return useCallback((feature, action, fn) => {
    if (guest) openGuestWall(feature, action, fn)
    else fn()
  }, [guest])
}

/* Hook for the GuestWall to subscribe to the current wall state. */
export function useWallData() {
  const [w, setW] = useState(wallData)
  useEffect(() => {
    const l = () => setW(wallData)
    subs.add(l)
    return () => subs.delete(l)
  }, [])
  return w
}