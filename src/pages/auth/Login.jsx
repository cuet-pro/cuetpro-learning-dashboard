import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useToast } from '../../components/shell/Shell'
import { signInWithEmail, sendEmailMagicLink, signInWithGoogle, friendlyAuthError } from '../../lib/auth'

const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export default function Login({ onSwitch, onAuthed }) {
  const toast = useToast()
  const [method, setMethod] = useState('email')
  const [loading, setLoading] = useState(false)

  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [emailErr, setEmailErr] = useState('')
  const [pwErr, setPwErr] = useState('')

  const [magicEmail, setMagicEmail] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [magicErr, setMagicErr] = useState('')

  const submitEmail = async e => {
    e.preventDefault()
    const a = isEmail(email.trim()) ? '' : 'Enter a valid email address.'
    const b = pw.length ? '' : 'Enter your password.'
    setEmailErr(a); setPwErr(b)
    if (a || b) return
    setLoading(true)
    const { error } = await signInWithEmail({ email: email.trim(), password: pw, remember })
    setLoading(false)
    if (error) { setPwErr(friendlyAuthError(error)); return }
    onAuthed()
  }

  const submitMagicLink = async e => {
    e.preventDefault()
    if (!isEmail(magicEmail.trim())) { setMagicErr('Enter a valid email address.'); return }
    setMagicErr(''); setLoading(true)
    const { error } = await sendEmailMagicLink({ email: magicEmail.trim() })
    setLoading(false)
    if (error) { setMagicErr(friendlyAuthError(error)); return }
    setMagicSent(true)
    toast('Login link sent! Check your email.')
  }

  const google = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) { setLoading(false); toast(friendlyAuthError(error)) }
  }

  return (
    <div>
      <div className="head"><h2>Welcome back</h2><p>Log in to your CUET Pro dashboard.</p></div>

      <div className="seg" role="tablist" aria-label="Log in method">
        <button type="button" role="tab" aria-selected={method === 'email'} onClick={() => setMethod('email')}>Email &amp; password</button>
        <button type="button" role="tab" aria-selected={method === 'link'} onClick={() => setMethod('link')}>Email link</button>
      </div>

      {method === 'email' ? (
        <form onSubmit={submitEmail} noValidate>
          <div className="field">
            <label htmlFor="lEmail">Email</label>
            <div className="input-wrap">
              <Mail className="ico" size={18} />
              <input className={'input has-ico' + (emailErr ? ' invalid' : '')} id="lEmail" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {emailErr && <span className="err">{emailErr}</span>}
          </div>
          <div className="field">
            <div className="label-row"><label htmlFor="lPw">Password</label><a href="#forgot" onClick={e => { e.preventDefault(); toast('A reset link would be emailed here.') }}>Forgot password?</a></div>
            <div className="input-wrap">
              <Lock className="ico" size={18} />
              <input className={'input has-ico has-btn' + (pwErr ? ' invalid' : '')} id="lPw" type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={pw} onChange={e => setPw(e.target.value)} />
              <button type="button" className="eye" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {pwErr && <span className="err">{pwErr}</span>}
          </div>
          <label className="check"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Keep me logged in on this device</label>
          <button className="btn btn-primary" type="submit" disabled={loading}>Log in <ArrowRight size={18} /></button>
        </form>
      ) : (
        <form onSubmit={submitMagicLink} noValidate>
          <div className="field">
            <label htmlFor="lMagicEmail">Email</label>
            <div className="input-wrap">
              <Mail className="ico" size={18} />
              <input className={'input has-ico' + (magicErr ? ' invalid' : '')} id="lMagicEmail" type="email" autoComplete="email" placeholder="you@example.com" value={magicEmail} onChange={e => setMagicEmail(e.target.value)} />
            </div>
            {magicErr && <span className="err">{magicErr}</span>}
          </div>
          <span className="hint">{magicSent
            ? `Link sent to ${magicEmail} — check your email and click it to log in.`
            : "We'll email you a secure one-click login link. No password needed."}</span>
          <button className="btn btn-primary" type="submit" disabled={loading}>{magicSent ? 'Link sent ✓' : 'Email me a login link'} <ArrowRight size={18} /></button>
        </form>
      )}

      <div className="or">or</div>
      <button className="btn btn-outline" type="button" onClick={google} disabled={loading}>
        <GoogleG /> Continue with Google
      </button>
      <p className="switch">New to CUET Pro? <a href="#signup" onClick={e => { e.preventDefault(); onSwitch('signup') }}>Create a free account</a></p>
    </div>
  )
}