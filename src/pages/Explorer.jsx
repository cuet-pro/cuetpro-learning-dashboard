import { useMemo, useState } from 'react'
import { Search, Target, ArrowRight, Building2, BookOpen } from 'lucide-react'
import { offerings, colleges, programs, getCutoff, getSeats, topCutoff } from '../data/duData'
import './explorer.css'

export default function Explorer() {
  const [tab, setTab] = useState('predictor')
  return (
    <div className="page">
      <header className="page-head">
        <div>
          <h1>DU Admissions Explorer</h1>
          <p>Every tool shares a filter-then-results pattern, with a "save to my list" trail back into your preference sheet.</p>
        </div>
      </header>
      <div className="an-tabs">
        <button className={tab === 'predictor' ? 'on' : ''} onClick={() => setTab('predictor')}>College & Course Predictor</button>
        <button className={tab === 'cutoffs' ? 'on' : ''} onClick={() => setTab('cutoffs')}>Cutoff Explorer</button>
        <button className={tab === 'colleges' ? 'on' : ''} onClick={() => setTab('colleges')}>Colleges</button>
      </div>
      {tab === 'predictor' && <Predictor />}
      {tab === 'cutoffs' && <CutoffExplorer />}
      {tab === 'colleges' && <CollegeList />}
    </div>
  )
}

/* ── Predictor: score → eligible colleges (real 2026 round-1 UR cutoffs) ── */
function Predictor() {
  const [score, setScore] = useState('')
  const n = score === '' ? null : Math.max(0, Math.min(1000, Number(score) || 0))

  const results = useMemo(() => {
    if (n === null) return []
    const map = new Map()
    offerings.forEach(o => {
      const cut = getCutoff(o, 'UR', 1)
      if (cut && cut <= n) {
        const key = o.collegeId + '|' + o.programId
        if (!map.has(key)) {
          map.set(key, {
            college: o.collegeName, collegeId: o.collegeId,
            program: o.programName, cutoff: cut,
            seats: o.seats?.UR?.total ?? null,
          })
        }
      }
    })
    return Array.from(map.values()).sort((a, b) => b.cutoff - a.cutoff).slice(0, 25)
  }, [n])

  const dream = useMemo(() => results.filter(r => n - r.cutoff < 25), [results, n])
  const target = useMemo(() => results.filter(r => n - r.cutoff >= 25 && n - r.cutoff < 60), [results, n])
  const safe = useMemo(() => results.filter(r => n - r.cutoff >= 60), [results, n])

  return (
    <div className="ex-stack">
      <section className="cuet-card">
        <div className="ex-input-row">
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15 }}>Enter your estimated CUET score</h3>
            <p style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 3 }}>Real 2026 Round-1 UR cutoffs se — eligibility instantly</p>
          </div>
          <input
            className="ex-input" type="number" min="0" max="1000" placeholder="e.g. 512"
            value={score} onChange={e => setScore(e.target.value)}
          />
          <span className="ex-input-hint">/1000</span>
        </div>
      </section>

      {n === null ? (
        <div className="ex-empty"><Search size={26} /><p>Score daalo — eligible colleges, Dream/Target/Safe classification ke saath dikhenge.</p></div>
      ) : (
        <>
          {dream.length > 0 && <ResultGroup title="Dream" desc={`${dream.length} options — cutoff se 25 marks ke andar`} color="var(--green-500)" rows={dream} />}
          {target.length > 0 && <ResultGroup title="Target" desc={`${target.length} options — 25-60 marks margin`} color="var(--blue-500)" rows={target} />}
          {safe.length > 0 && <ResultGroup title="Safe" desc={`${safe.length} options — 60+ marks margin`} color="var(--amber-500)" rows={safe} />}
          {results.length === 0 && <div className="ex-empty"><p>Is score pe koi college eligible nahi — score 400+ try karo.</p></div>}
        </>
      )}
    </div>
  )
}

function ResultGroup({ title, desc, color, rows }) {
  return (
    <section className="cuet-card">
      <div className="card-head">
        <h3>{title}</h3><span className="card-sub">{desc}</span>
        <span className="tg-count" style={{ background: color + '18', color }}>{rows.length}</span>
      </div>
      {rows.map(r => (
        <div className="ex-row" key={r.collegeId + r.programId}>
          <div className="ex-row-info">
            <b>{r.college}</b>
            <span>{r.program}</span>
          </div>
          <div className="ex-row-nums">
            <span className="ex-seats">{r.seats ? `${r.seats} seats` : '—'}</span>
            <span className="ex-cut">cutoff {r.cutoff}</span>
          </div>
          <button className="btn btn-outline btn-sm"><Target size={13} /> Shortlist</button>
        </div>
      ))}
    </section>
  )
}

/* ── Cutoff Explorer ── */
function CutoffExplorer() {
  const [collegeId, setCollegeId] = useState(colleges[0]?.id || '')
  const [q, setQ] = useState('')
  const college = colleges.find(c => c.id === collegeId)
  const rows = useMemo(() => {
    let list = offerings.filter(o => o.collegeId === collegeId)
    if (q.trim()) list = list.filter(o => o.programName.toLowerCase().includes(q.toLowerCase()))
    return list.sort((a, b) => (getCutoff(b, 'UR', 1) || 0) - (getCutoff(a, 'UR', 1) || 0))
  }, [collegeId, q])

  return (
    <div className="ex-stack">
      <section className="cuet-card">
        <div className="ex-filter-row">
          <select className="ex-select" value={collegeId} onChange={e => setCollegeId(e.target.value)}>
            {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="ex-input" placeholder="Search course..." value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 260 }} />
        </div>
      </section>
      <section className="cuet-card">
        <div className="card-head"><h3>{college?.name || ''}</h3><span className="card-sub">{rows.length} courses · Round 1 · UR</span></div>
        <div className="ex-table">
          <div className="ex-thead"><span>Course</span><span>R1</span><span>R2</span><span>R3</span><span>UR seats</span></div>
          {rows.slice(0, 15).map(o => (
            <div className="ex-trow" key={o.programId}>
              <span className="ex-tprog">{o.programName}</span>
              <span className="mono">{getCutoff(o, 'UR', 1) ?? '—'}</span>
              <span className="mono">{getCutoff(o, 'UR', 2) ?? '—'}</span>
              <span className="mono">{getCutoff(o, 'UR', 3) ?? '—'}</span>
              <span className="mono">{o.seats?.UR?.total ?? '—'}</span>
            </div>
          ))}
          {rows.length === 0 && <p style={{ padding: '18px 0', fontSize: 12.5, color: 'var(--gray-500)' }}>Koi course nahi mila.</p>}
        </div>
      </section>
    </div>
  )
}

/* ── Colleges list ── */
function CollegeList() {
  const [q, setQ] = useState('')
  const list = colleges.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name))
  return (
    <div className="ex-stack">
      <input className="ex-input" placeholder="Search 69 colleges..." value={q} onChange={e => setQ(e.target.value)} style={{ maxWidth: 320 }} />
      <div className="ex-collist">
        {list.map(c => {
          const offs = offerings.filter(o => o.collegeId === c.id)
          const maxCut = Math.max(0, ...offs.map(topCutoff))
          return (
            <div className="ex-colcard" key={c.id}>
              <div className="ex-colhead">
                <div className="ex-collo"><Building2 size={15} /></div>
                <div><b>{c.name}</b><span>{c.campus} Campus · {c.type}</span></div>
              </div>
              <div className="ex-colmeta">
                <span>{offs.length} courses</span>
                <span>Top cutoff <b className="mono">{maxCut || '—'}</b></span>
              </div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 10 }}>View <ArrowRight size={13} /></button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
