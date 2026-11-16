import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, ChevronDown, ChevronLeft, BookOpen, ArrowRight, ArrowLeft, Menu, Check, CheckCircle2, Circle, Info, ListChecks, BarChart3, Trophy } from 'lucide-react'
import { getGatIndex, loadGatTopicNotes, sanitizeGatNotesHtml, priorityClass, readGatProgress, writeGatProgress, toggleGatTopicDone, gatDeepLink, consumeGatDeepLink } from '../lib/gatNotes'
import './englishNotes.css'
import './gatNotes.css'

const PRIO_LABEL = { HIGH: 'high', MED: 'med', LOW: 'low' }

/* GAT Notes module — Overview (exam pattern / difficulty / checklist / syllabus)
   + 3 sections × 34 topics, each with its interactive cheat-sheet notes. */
export default function GatNotes() {
  const idx = useMemo(() => getGatIndex(), [])
  const sections = useMemo(() => idx.order.map(id => ({ id, ...idx.sections[id] })), [idx])
  const allTopics = useMemo(() => sections.flatMap(s => s.topics.map(t => ({ ...t, sectionId: s.id, sectionTitle: s.title, sectionNo: s.no }))), [sections])

  const [done, setDone] = useState(() => new Set(readGatProgress().done || []))
  const [view, setView] = useState('overview')
  const [activeId, setActiveId] = useState(null)
  const [openSec, setOpenSec] = useState(() => new Set(sections.map(s => s.id)))
  const [showTree, setShowTree] = useState(false)
  const [notesHtml, setNotesHtml] = useState('')
  const [loading, setLoading] = useState(false)

  const active = allTopics.find(t => t.id === activeId)

  const openTopic = t => {
    const full = allTopics.find(x => x.id === t.id) || t
    setActiveId(full.id); setView('topic'); setShowTree(false); setLoading(true); setNotesHtml('')
    loadGatTopicNotes(full.sectionId, full.id).then(html => { setNotesHtml(html); setLoading(false) })
    writeGatProgress({ done: [...done], last: full.id })
  }

  /* deep link > resume on mount */
  useEffect(() => {
    const dl = gatDeepLink()
    if (dl) { consumeGatDeepLink(); const t = allTopics.find(x => x.id === dl.topic); if (t) return openTopic(t) }
    const last = readGatProgress().last
    if (last) { const t = allTopics.find(x => x.id === last); if (t) openTopic(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* cheat-sheet interactivity removed — Notes module shows real notes only */

  const toggleDone = () => {
    const now = toggleGatTopicDone(activeId)
    setDone(s => { const n = new Set(s); now ? n.add(activeId) : n.delete(activeId); return n })
  }

  const toggleSection = id => setOpenSec(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const ov = idx.overview
  const flat = allTopics

  return (
    <div className="en">
      {/* chapter tree */}
      <aside className={'en-tree' + (showTree ? ' open' : '')}>
        <div className="en-tree-head">
          <span className="en-group-label">CUET GAT · {done.size}/{flat.length}</span>
          <button className="en-tree-close" onClick={() => setShowTree(false)} aria-label="Close"><ChevronLeft size={16} /></button>
        </div>
        <button className={'en-chapter-row' + (view === 'overview' ? ' on' : '')} onClick={() => { setView('overview'); setShowTree(false) }}>
          <span className="en-ch-num">ℹ</span>
          <span className="en-ch-title">Overview</span>
          <Info size={14} />
        </button>
        {sections.map(s => {
          const open = openSec.has(s.id)
          return (
            <div className="en-chapter" key={s.id}>
              <button className="en-chapter-row" onClick={() => toggleSection(s.id)} aria-expanded={open}>
                <span className="en-ch-num">{String(s.no).padStart(2, '0')}</span>
                <span className="en-ch-title">{s.icon} {s.title}</span>
                <span className="en-ch-count">{s.topics.length}</span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {open && (
                <div className="en-topics">
                  {s.topics.map(t => (
                    <button key={t.id} className={'en-topic' + (activeId === t.id ? ' on' : '')} onClick={() => openTopic(t)}>
                      <span className="en-t-num">{s.no}.{t.no}</span>
                      <span className="en-t-title">{t.title}</span>
                      {done.has(t.id) && <Check size={13} className="en-done-ic" />}
                      <span className={'en-pill ' + PRIO_LABEL[t.priority]}>{t.priority}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </aside>

      {/* main */}
      <div className="en-main">
        <button className="en-chapters-btn" onClick={() => setShowTree(true)}><Menu size={14} /> Chapters</button>

        {view === 'overview' ? (
          <Overview ov={ov} topics={allTopics} onOpen={openTopic} />
        ) : active ? (
          <>
            <nav className="en-breadcrumb">
              General Test <ChevronRight size={12} /> {active.sectionTitle}
            </nav>
            <header className="en-head">
              <span className="en-chapter-chip">{String(active.sectionNo).padStart(2, '0')} {active.sectionTitle}</span>
              <h2 className="en-title">{active.title}</h2>
              <div className="en-chips">
                <span className={'en-pill ' + PRIO_LABEL[active.priority]}>{active.priority} priority</span>
                <button className={'en-done-btn' + (done.has(activeId) ? ' on' : '')} onClick={toggleDone}>
                  {done.has(activeId) ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                  {done.has(activeId) ? 'Completed' : 'Mark done'}
                </button>
              </div>
            </header>

            <div className="en-tabs">
              <button className="on"><BookOpen size={14} /> Notes</button>
            </div>

            {loading ? (
              <p className="muted-empty">Loading notes…</p>
            ) : (
              <div className="gat-notes" dangerouslySetInnerHTML={{ __html: sanitizeGatNotesHtml(notesHtml) }} />
            )}

            <div className="en-pager">
              <button className="btn btn-outline-sm" disabled={!activeId} onClick={() => setView('overview')}><ArrowLeft size={13} /> Overview</button>
              <button className="btn btn-outline-sm" onClick={() => { const i = flat.findIndex(x => x.id === activeId); if (i < flat.length - 1) openTopic(flat[i + 1]) }}>Next <ArrowRight size={13} /></button>
            </div>
          </>
        ) : (
          <p className="muted-empty">Select a topic…</p>
        )}
      </div>
    </div>
  )
}

/* ── Overview ── */
function Overview({ ov, topics, onOpen }) {
  const pat = ov.examPattern2026
  const diff = ov.difficultySplit
  const marks = ov.highestMarks
  const byId = useMemo(() => Object.fromEntries(topics.map(t => [t.id, t])), [topics])
  return (
    <div className="gat-ov">
      <header className="en-head">
        <span className="en-chapter-chip">CUET General Test</span>
        <h2 className="en-title">Overview & Exam Pattern</h2>
        <p className="en-subdesc">Everything about the GAT paper at a glance — pattern, difficulty, syllabus map.</p>
      </header>

      {/* stat tiles */}
      <div className="gat-stat-row">
        <Stat label="Questions" value={pat.questions} />
        <Stat label="Duration" value={pat.durationMin + ' min'} />
        <Stat label="Correct" value={'+' + pat.marksCorrect} />
        <Stat label="Wrong" value={pat.marksWrong} />
        <Stat label="Max marks" value={pat.maxMarks} />
      </div>
      <p className="gat-note">{pat.note}</p>

      {/* difficulty split */}
      <h3 className="gat-h"><BarChart3 size={15} /> Difficulty split (year-wise)</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Year</th><th>Easy</th><th>Moderate</th><th>Difficult</th></tr></thead>
          <tbody>
            {diff.byYear.map(y => (
              <tr key={y.year}><td>{y.year}</td><td>{y.easy}%</td><td>{y.moderate}%</td><td>{y.difficult}%</td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="gat-note">{diff.note}</p>

      {/* highest marks */}
      <h3 className="gat-h"><Trophy size={15} /> Highest marks (published)</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Year</th><th>Score</th><th>Out of</th></tr></thead>
          <tbody>
            {marks.map(m => (
              <tr key={m.year}><td>{m.year}</td><td>{m.score ?? '—'}</td><td>{m.outOf ?? '—'}</td></tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* prep checklist */}
      <h3 className="gat-h"><ListChecks size={15} /> Prep checklist</h3>
      <ul className="checklist">
        {ov.prepChecklist.map((c, i) => <li key={i}>{c}</li>)}
      </ul>

      {/* syllabus map */}
      <h3 className="gat-h"><BookOpen size={15} /> Official NTA syllabus map</h3>
      <div className="gat-areas">
        {ov.syllabusMap.areas.map(a => (
          <div className="gat-area" key={a.area}>
            <div className="gat-area-head">
              <b>{a.area}</b>
              <span>{a.count}</span>
            </div>
            <div className="gat-area-chips">
              {a.topicIds.map(id => {
                const t = byId[id]
                return t
                  ? <button className="chip gat-chip" key={id} onClick={() => onOpen(t)}>{t.title}</button>
                  : <span className="chip" key={id}>{id}</span>
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="gat-stat">
      <span>{value}</span>
      <b>{label}</b>
    </div>
  )
}