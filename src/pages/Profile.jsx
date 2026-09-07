import { useState } from 'react'
import { Check, ChevronRight, Crown, HelpCircle, Trash2, Bell, Target, GraduationCap, Star, RefreshCcw, LogOut } from 'lucide-react'
import { useProfile, STREAMS } from '../lib/profile'
import './profile.css'

const NOTIFS = [
  { id: 'streak', label: 'Daily streak reminder', desc: 'A nudge if you haven\'t studied today — keeps your streak alive' },
  { id: 'revision', label: 'Revision-due alerts', desc: 'Fires when Smart Revision has items due today (due count > 0)' },
  { id: 'mocks', label: 'Mock test reminders', desc: 'A heads-up when a scheduled mock is about to start' },
]

export default function Profile() {
  const [profile, save] = useProfile()
  const [draft, setDraft] = useState({
    dreamCollege: profile.dreamCollege,
    targetPercentile: profile.targetPercentile,
    examDate: profile.examDate,
  })
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const saveTarget = () => {
    save(p => ({ ...p, ...draft }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2200)
  }
  const setStream = s => {
    save(p => ({ ...p, stream: s, subjects: [...STREAMS[s]] }))
  }
  const toggleSubject = sub => {
    save(p => {
      const has = p.subjects.includes(sub)
      return { ...p, subjects: has ? p.subjects.filter(x => x !== sub) : [...p.subjects, sub] }
    })
  }
  const toggleNotif = id => {
    save(p => ({ ...p, notif: { ...p.notif, [id]: !p.notif[id] } }))
  }

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>Profile & Settings</h1>
          <p>Your account, your targets — the one place these values are set.</p>
        </div>
      </header>

      {/* A. Account header */}
      <section className="pf-account">
        <div className="pf-avatar">AV</div>
        <div className="pf-account-info">
          <b>Ananya Verma</b>
          <span>{profile.stream} · CUET 2027</span>
        </div>
        <button className="btn btn-outline-sm"><LogOut size={13} /> Sign out</button>
      </section>

      {/* B. My target — feeds Dashboard, Analysis, Smart Revision */}
      <section className="pf-card">
        <div className="pf-card-head">
          <div className="pf-ico"><Target size={17} /></div>
          <div>
            <h3>My target</h3>
            <p>Set once here — it feeds your dashboard, analysis target line, and exam countdown.</p>
          </div>
        </div>
        <div className="pf-fields">
          <label>
            <span>Dream college</span>
            <input value={draft.dreamCollege} onChange={e => setDraft(d => ({ ...d, dreamCollege: e.target.value }))} placeholder="e.g. Shri Ram College of Commerce (SRCC)" />
          </label>
          <label>
            <span>Target percentile</span>
            <input type="number" min="1" max="100" value={draft.targetPercentile} onChange={e => setDraft(d => ({ ...d, targetPercentile: Number(e.target.value) }))} />
          </label>
          <label>
            <span>Exam date</span>
            <input type="date" value={draft.examDate} onChange={e => setDraft(d => ({ ...d, examDate: e.target.value }))} />
          </label>
        </div>
        <button className="btn btn-primary-sm pf-save" onClick={saveTarget}>
          {saved ? <><Check size={14} /> Saved — updated everywhere</> : 'Save target'}
        </button>
      </section>

      {/* C. Academic profile */}
      <section className="pf-card">
        <div className="pf-card-head">
          <div className="pf-ico"><GraduationCap size={17} /></div>
          <div>
            <h3>Academic profile</h3>
            <p>Your stream drives Study Kit content, boost ranking and SWOT across the app.</p>
          </div>
        </div>
        <span className="pf-label">Stream</span>
        <div className="pf-streams">
          {Object.keys(STREAMS).map(s => (
            <button key={s} className={'pf-stream' + (profile.stream === s ? ' on' : '')} onClick={() => setStream(s)}>{s}</button>
          ))}
        </div>
        <span className="pf-label">Gender <em>— dashboard avatar style</em></span>
        <div className="pf-streams">
          {['not-set', 'Female', 'Male'].map(g => (
            <button key={g} className={'pf-stream' + (profile.gender === g ? ' on' : '')} onClick={() => save(p => ({ ...p, gender: g }))}>{g === 'not-set' ? 'Not set' : g}</button>
          ))}
        </div>
        <span className="pf-label">Subjects you're preparing</span>
        <div className="pf-subjects">
          {STREAMS[profile.stream].map(sub => (
            <button key={sub} className={'pf-subject' + (profile.subjects.includes(sub) ? ' on' : '')} onClick={() => toggleSubject(sub)}>
              {profile.subjects.includes(sub) && <Check size={12} />} {sub}
            </button>
          ))}
        </div>
      </section>

      {/* D. Notifications */}
      <section className="pf-card">
        <div className="pf-card-head">
          <div className="pf-ico"><Bell size={17} /></div>
          <div>
            <h3>Notifications</h3>
            <p>Each toggle maps to a real trigger in the app.</p>
          </div>
        </div>
        {NOTIFS.map(n => (
          <div className="pf-notif" key={n.id}>
            <div>
              <b>{n.label}</b>
              <span>{n.desc}</span>
            </div>
            <button className={'pf-toggle' + (profile.notif[n.id] ? ' on' : '')} onClick={() => toggleNotif(n.id)} aria-label={n.label}><i /></button>
          </div>
        ))}
      </section>

      {/* E. Account */}
      <section className="pf-card">
        <div className="pf-card-head">
          <div className="pf-ico"><Star size={17} /></div>
          <div>
            <h3>Account</h3>
            <p>Plan, support and data.</p>
          </div>
        </div>
        <div className="pf-account-row">
          <div className="pf-plan">
            <div>
              <b>CUET Pro — Free</b>
              <span>Unlimited mocks · analytics · DU explorer</span>
            </div>
            <button className="btn btn-primary-sm"><Crown size={13} /> Upgrade</button>
          </div>
        </div>
        <button className="pf-link" onClick={() => alert('Deep-link → help centre')}><HelpCircle size={14} /> Help & support <ChevronRight size={14} /></button>
        {!confirmDelete ? (
          <button className="pf-danger" onClick={() => setConfirmDelete(true)}><Trash2 size={14} /> Delete account</button>
        ) : (
          <div className="pf-confirm">
            <span>This removes your profile, progress and data. Sure?</span>
            <button className="btn btn-outline-sm" onClick={() => setConfirmDelete(false)}>Keep my account</button>
            <button className="btn pf-danger-solid" onClick={() => alert('Deep-link → account deletion flow')}>Delete permanently</button>
          </div>
        )}
      </section>

      <p className="pf-foot">Stream · target college · target percentile · exam date are stored once here and read by Dashboard, Analysis, Study Kit and Smart Revision.</p>
    </div>
  )
}
