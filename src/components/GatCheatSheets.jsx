import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, ChevronDown, ChevronLeft, ArrowLeft, Menu, Sparkles, Info } from 'lucide-react'
import { getGatIndex } from '../lib/gatNotes'
import { Overview } from './GatNotes'
import { fetchCheatSheet } from '../lib/content'
import { initGatCheat } from '../lib/gatCheat'
import './englishNotes.css'
import '../pages/gat-cheat.css'
import '../pages/cheat-print.css'

const PRIO_LABEL = { HIGH: 'high', MED: 'med', LOW: 'low' }

/* GAT Cheat Sheets — chapter tree (3 sections × 34 topics) → interactive cheat sheet.
   Same structure as the GAT Notes module, but cheat-sheet content. */
export default function GatCheatSheets() {
  const idx = useMemo(() => getGatIndex(), [])
  const sections = useMemo(() => idx.order.map(id => ({ id, ...idx.sections[id] })), [idx])
  const allTopics = useMemo(() => sections.flatMap(s => s.topics.map(t => ({ ...t, sectionId: s.id, sectionTitle: s.title, sectionNo: s.no }))), [sections])

  const [openSec, setOpenSec] = useState(() => new Set(sections.map(s => s.id)))
  const [view, setView] = useState('overview')
  const [active, setActive] = useState(null)
  const [html, setHtml] = useState('')
  const [busy, setBusy] = useState(false)
  const [showTree, setShowTree] = useState(false)
  const ref = useRef(null)

  const open = t => {
    const full = allTopics.find(x => x.id === t.id) || t
    setActive(full); setView('topic'); setShowTree(false); setBusy(true); setHtml('')
    fetchCheatSheet(full.cheatNum).then(({ data }) => { setHtml(data?.html || ''); setBusy(false) })
  }

  useEffect(() => { if (ref.current && html) initGatCheat(ref.current) }, [html])

  const toggleSection = id => setOpenSec(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div className="en">
      <aside className={'en-tree' + (showTree ? ' open' : '')}>
        <div className="en-tree-head">
          <span className="en-group-label">GAT Cheat Sheets</span>
          <button className="en-tree-close" onClick={() => setShowTree(false)} aria-label="Close"><ChevronLeft size={16} /></button>
        </div>
        <button className={'en-chapter-row' + (view === 'overview' ? ' on' : '')} onClick={() => { setView('overview'); setShowTree(false) }}>
          <span className="en-ch-num">ℹ</span>
          <span className="en-ch-title">Overview</span>
          <Info size={14} />
        </button>
        {sections.map(s => {
          const isOpen = openSec.has(s.id)
          return (
            <div className="en-chapter" key={s.id}>
              <button className="en-chapter-row" onClick={() => toggleSection(s.id)} aria-expanded={isOpen}>
                <span className="en-ch-num">{String(s.no).padStart(2, '0')}</span>
                <span className="en-ch-title">{s.icon} {s.title}</span>
                <span className="en-ch-count">{s.topics.length}</span>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isOpen && (
                <div className="en-topics">
                  {s.topics.map(t => (
                    <button key={t.id} className={'en-topic' + (active?.id === t.id ? ' on' : '')} onClick={() => open(t)}>
                      <span className="en-t-num">{s.no}.{t.no}</span>
                      <span className="en-t-title">{t.title}</span>
                      <span className={'en-pill ' + PRIO_LABEL[t.priority]}>{t.priority}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </aside>

      <div className="en-main">
        <button className="en-chapters-btn" onClick={() => setShowTree(true)}><Menu size={14} /> Chapters</button>

        {view === 'overview' ? (
          <Overview ov={idx.overview} topics={allTopics} onOpen={open} />
        ) : active ? (
          <>
            <button className="sk-back" onClick={() => setView('overview')}><ArrowLeft size={15} /> All cheat sheets</button>
            <header className="en-head">
              <span className="en-chapter-chip">{String(active.sectionNo).padStart(2, '0')} {active.sectionTitle}</span>
              <h2 className="en-title">{active.title}</h2>
              <div className="en-chips">
                <span className={'en-pill ' + PRIO_LABEL[active.priority]}>{active.priority} priority</span>
              </div>
            </header>
            {busy ? (
              <p className="muted-empty">Loading cheat sheet…</p>
            ) : (
              <div className="gat-cx" ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </>
        ) : (
          <p className="muted-empty"><Sparkles size={14} /> Pick a topic to open its cheat sheet.</p>
        )}
      </div>
    </div>
  )
}