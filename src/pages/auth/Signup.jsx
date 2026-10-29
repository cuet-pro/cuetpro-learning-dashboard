import { useState } from 'react'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import { useToast } from '../../components/shell/Shell'
import { STREAMS, saveProfile, loadProfile } from '../../lib/profile'
import { signUp, signInWithEmail, signInWithGoogle, syncProfile, friendlyAuthError } from '../../lib/auth'
import { colleges } from '../../data/duData'

const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const isMobile = v => /^[6-9]\d{9}$/.test(v)

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

export default function Signup({ step, setStep, onSwitch, onAuthed }) {
  const toast = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [pw, setPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [terms, setTerms] = useState(false)
  const [errs, setErrs] = useState({})
  const [loading, setLoading] = useState(false)

  const [stream, setStream] = useState('Commerce')
  const [subjects, setSubjects] = useState([...STREAMS.Commerce])
  const [dream, setDream] = useState('')
  const [score, setScore] = useState(700)

  const toggleSubject = s => setSubjects(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const pwStrong = pw.length >= 8 && /\d/.test(pw)
  const pwHint = !pw ? 'Use 8+ characters with a number.' : pwStrong ? 'Strong enough ✓' : 'Needs 8+ characters and at least one number.'

  const submitStep1 = e => {
    e.preventDefault()
    const er = {}
    if (name.trim().length < 2) er.name = 'Enter your name.'
    if (!isEmail(email.trim())) er.email = 'Enter a valid email address.'
    if (mobile && !isMobile(mobile)) er.mobile = 'Enter a valid 10-digit mobile number.'
    if (!pwStrong) er.pw = 'Needs 8+ characters and at least one number.'
    if (!terms) er.terms = 'Please accept the Terms to continue.'
    setErrs(er)
    if (Object.keys(er).length) return
    setStep(2)
  }

  const completeSignup = skipped => {
    const base = { name: name.trim(), stream, subjects }
    const extra = skipped ? {} : {
      ...(dream.trim() ? { dreamCollege: dream.trim() } : {}),
      targetScore: score,
    }
    saveProfile({ ...loadProfile(), ...base, ...extra })
    /* signIn fires on "Go to my dashboard" — calling it here would un-gate the app
       before the done screen can render. */
    setStep(3)
  }

  const google = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) { setLoading(false); toast(friendlyAuthError(error)) }
  }

  const goToDashboard = async () => {
    setLoading(true)
    const profile = {
      name: name.trim(),
      mobile,
      stream,
      subjects,
      dreamCollege: dream.trim() || null,
      targetScore: score,
    }
    // Create the Supabase account (auto-confirms email → session lands here)
    const res = await signUp({ email: email.trim(), password: pw, name: name.trim(), mobile })
    if (res.session) {
      await syncProfile(profile)
      onAuthed()
      return
    }
    // No session → either the email already exists, or signup errored. Try login.
    const fb = await signInWithEmail({ email: email.trim(), password: pw, remember: false })
    if (fb.error) {
      setLoading(false)
      const already = (res.error?.message || '').toLowerCase().includes('already')
      toast(already ? 'This email already has an account. Try logging in instead.' : friendlyAuthError(fb.error))
      return
    }
    await syncProfile(profile)
    onAuthed()
  }

  if (step === 3) {
    const first = name.trim().split(' ')[0] || 'there'
    return (
      <div className="form-wrap" style={{ maxWidth: 'none' }}>
        <span className="done-ico"><Check size={28} /></span>
        <div className="head"><h2>You&apos;re all set, {first}</h2><p>We&apos;ve set up your {stream} subjects. Your dashboard opens with today&apos;s focus and your exam countdown.</p></div>
        <button className="btn btn-primary" type="button" onClick={goToDashboard} disabled={loading}>{loading ? 'Setting up…' : 'Go to my dashboard'}</button>
      </div>
    )
  }

  return (
    <div>
      <div className="progress">
        <span className="lbl">Step {step} of 2 · {step === 1 ? 'Account' : 'Your goal'}</span>
        <div className="bars"><i className="on" /><i className={step >= 2 ? 'on' : ''} /></div>
      </div>

      {step === 1 ? (
        <form onSubmit={submitStep1} noValidate>
          <div className="head"><h2>Create your account</h2><p>Free to start. No card needed.</p></div>

          <button className="btn btn-outline" type="button" onClick={google} disabled={loading}>
            <GoogleG /> Sign up with Google
          </button>
          <div className="or">or with email</div>

          <div className="field">
            <label htmlFor="sName">Full name</label>
            <input className={'input' + (errs.name ? ' invalid' : '')} id="sName" type="text" autoComplete="name" placeholder="As you'd like it on your dashboard" value={name} onChange={e => setName(e.target.value)} />
            {errs.name && <span className="err">{errs.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="sEmail">Email</label>
            <input className={'input' + (errs.email ? ' invalid' : '')} id="sEmail" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            {errs.email && <span className="err">{errs.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="sMobile">Mobile number <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>(optional)</span></label>
            <div className="phone-row"><span className="cc">+91</span><input className={'input' + (errs.mobile ? ' invalid' : '')} id="sMobile" type="tel" inputMode="numeric" maxLength={10} autoComplete="tel-national" placeholder="10-digit mobile number" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} /></div>
            {errs.mobile && <span className="err">{errs.mobile}</span>}
          </div>

          <div className="field">
            <label htmlFor="sPw">Password</label>
            <div className="input-wrap">
              <input className={'input has-btn' + (errs.pw ? ' invalid' : '')} id="sPw" type={showPw ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 8 characters" value={pw} onChange={e => setPw(e.target.value)} />
              <button type="button" className="eye" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <span className="hint" style={!pw ? undefined : { color: pwStrong ? 'var(--success)' : 'var(--error)' }}>{pwHint}</span>
          </div>

          <label className="check"><input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} /> <span>I agree to the <a href="#terms" onClick={e => e.preventDefault()}>Terms</a> and <a href="#privacy" onClick={e => e.preventDefault()}>Privacy Policy</a>.</span></label>
          {errs.terms && <span className="err">{errs.terms}</span>}

          <button className="btn btn-primary" type="submit">Continue <ArrowRight size={18} /></button>
          <p className="switch">Already have an account? <a href="#login" onClick={e => { e.preventDefault(); onSwitch('login') }}>Log in</a></p>
        </form>
      ) : (
        <form onSubmit={e => { e.preventDefault(); completeSignup(false) }} noValidate>
          <div className="head"><h2>Set your goal</h2><p>This personalises your Study Kit, revision deck and countdown.</p></div>

          <fieldset className="field" style={{ border: 'none' }}>
            <legend className="legend" style={{ marginBottom: 8 }}>Stream</legend>
            <div className="pills">
              {Object.keys(STREAMS).map(n => (
                <button key={n} type="button" className="pill" aria-pressed={stream === n} onClick={() => { setStream(n); setSubjects([...STREAMS[n]]) }}>{n}</button>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label>Select your subjects</label>
            <div className="chips">
              {STREAMS[stream].map(s => (
                <button key={s} type="button" className={'chip' + (subjects.includes(s) ? '' : ' off')} aria-pressed={subjects.includes(s)} onClick={() => toggleSubject(s)}>{s}</button>
              ))}
            </div>
            <span className="hint">Tap to select the subjects you&apos;re taking in CUET.</span>
            {!subjects.length && <span className="err">Select at least one subject.</span>}
          </div>

          <div className="field">
            <label htmlFor="sDream">Dream college</label>
            <input className="input" id="sDream" list="colleges" placeholder="e.g. Shri Ram College of Commerce (SRCC)" value={dream} onChange={e => setDream(e.target.value)} />
            <datalist id="colleges">
              {colleges.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
            <span className="hint">Suggestions come from the DU colleges in College Explorer.</span>
          </div>

          <div className="field">
            <label htmlFor="sTarget">Target score <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>(out of 1000)</span></label>
            <div className="range-box"><input id="sTarget" type="range" min="0" max="1000" step="10" value={score} onChange={e => setScore(+e.target.value)} /><output htmlFor="sTarget">{score}</output></div>
            <span className="hint">The score you&apos;re aiming for in CUET.</span>
          </div>

          <div className="row-btns">
            <button className="btn btn-outline" type="button" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary" type="submit">Create account</button>
          </div>
          <p className="switch" style={{ fontSize: 13 }}>Not sure yet? <a href="#skip" onClick={e => { e.preventDefault(); completeSignup(true) }}>Skip for now</a></p>
        </form>
      )}
    </div>
  )
}