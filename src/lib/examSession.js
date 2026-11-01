/* Full-screen exam session store — lets the app shell hide itself during an
   attempt. Mirrors the guestGate/auth pattern: a module-level value + a
   subscription hook, so App.jsx can swap the whole view without prop drilling. */
import { useEffect, useState } from 'react'

let exam = null
const subs = new Set()
const notify = () => subs.forEach(l => l())

/* exam: { paper, onExit? } — startExam(exam) opens the full-screen attempt. */
export function startExam(data) {
  exam = data
  notify()
}

export function endExam() {
  exam = null
  notify()
}

export function getExam() {
  return exam
}

export function useExam() {
  const [e, setE] = useState(exam)
  useEffect(() => {
    const l = () => setE(exam)
    subs.add(l)
    return () => subs.delete(l)
  }, [])
  return e
}