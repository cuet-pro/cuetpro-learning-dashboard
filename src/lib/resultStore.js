/* ── Submitted-attempt result store (module-level) ──
   When a student submits a PYQ/mock, the full-screen exam shell ends and the
   analytics page opens INSIDE the normal app shell. This tiny store carries the
   submitted attempt across that hand-off (PyqExam → App → Study Kit). */
import { useEffect, useState } from 'react'

let current = null
const subs = new Set()

export function showResult(attempt) {
  current = attempt
  subs.forEach(fn => fn(current))
}

export function clearResult() {
  current = null
  subs.forEach(fn => fn(null))
}

export function useResult() {
  const [r, setR] = useState(current)
  useEffect(() => {
    subs.add(setR)
    return () => subs.delete(setR)
  }, [])
  return r
}