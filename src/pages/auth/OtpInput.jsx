import { useRef } from 'react'

/* 6-box OTP input — typing a digit advances focus, Backspace on an empty box
   goes back, and pasting a 6-digit code fills all boxes. */
export default function OtpInput({ value, onChange, length = 6 }) {
  const refs = useRef([])

  const handleChange = (i, v) => {
    const digit = v.replace(/\D/g, '').slice(-1)
    const next = [...value]
    next[i] = digit || ''
    onChange(next.join(''))
    if (digit && i < length - 1) refs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) {
      refs.current[i - 1]?.focus()
    }
  }

  const handlePaste = e => {
    const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, length)
    if (!d) return
    e.preventDefault()
    onChange(d)
    refs.current[Math.min(d.length, length - 1)]?.focus()
  }

  return (
    <div className="otp" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => (refs.current[i] = el)}
          className="input"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ''}
          aria-label={'Digit ' + (i + 1)}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
        />
      ))}
    </div>
  )
}