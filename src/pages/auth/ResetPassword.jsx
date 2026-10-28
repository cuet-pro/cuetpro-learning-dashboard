import { useState } from 'react'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useToast } from '../../components/shell/Shell'
import { updatePassword, clearPasswordRecovery } from '../../lib/auth'

/* Shown right after the user clicks the emailed reset link (Supabase
   PASSWORD_RECOVERY). Sets a new password, then clears the recovery flag so
   App returns to the normal signed-in shell. */
export default function ResetPassword() {
  const toast = useToast()
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    if (pw.length < 6) { setErr('Password must be at least 6 characters.'); return }
    if (pw !== pw2) { setErr('Passwords do not match.'); return }
    setLoading(true)
    const { error } = await updatePassword(pw)
    setLoading(false)
    if (error) { setErr(error.message || 'Could not update your password.'); return }
    toast('Password updated. You are signed in.')
    clearPasswordRecovery()
  }

  return (
    <div className="auth auth-reset">
      <main className="form-side">
        <div className="form-wrap">
          <div className="head">
            <h2>Set a new password</h2>
            <p>Choose a new password for your account.</p>
          </div>

          <form onSubmit={submit} noValidate>
            <div className="field">
              <label htmlFor="rPw">New password</label>
              <div className="input-wrap">
                <Lock className="ico" size={18} />
                <input className={'input has-ico has-btn' + (err ? ' invalid' : '')} id="rPw" type={show ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" value={pw} onChange={e => setPw(e.target.value)} />
                <button type="button" className="eye" onClick={() => setShow(v => !v)} aria-label="Show password">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div className="field">
              <label htmlFor="rPw2">Confirm password</label>
              <div className="input-wrap">
                <Lock className="ico" size={18} />
                <input className={'input has-ico' + (err ? ' invalid' : '')} id="rPw2" type={show ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your password" value={pw2} onChange={e => setPw2(e.target.value)} />
              </div>
            </div>
            {err && <span className="err">{err}</span>}
            <button className="btn btn-primary" type="submit" disabled={loading}>Update password <ArrowRight size={18} /></button>
          </form>
        </div>
      </main>
    </div>
  )
}