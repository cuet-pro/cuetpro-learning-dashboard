import { useMemo, useState } from 'react'
import { ChevronRight, ChevronDown, ChevronLeft, ArrowLeft, Menu, Download, Sparkles } from 'lucide-react'
import { getEnglishCheatIndex, loadEnglishCheat, printCheatHtml } from '../lib/englishCheats'
import { importanceOf } from '../lib/englishNotes'
import './englishNotes.css'
import './englishCheats.css'
import '../pages/cheat-print.css'

const IMP_CLASS = { HIGH: 'high', MED: 'med', LOW: 'low' }

/* English Cheat Sheets — 3 chapters × 28 visual cheat sheets (3 pages each). */
export default function EnglishCheatSheets() {
  const idx = useMemo(() => getEnglishCheatIndex(), [])
  const chapters = useMemo(() => idx.order.map(cid => ({ id: cid, ...idx.chapters[cid] })), [idx])
  const allTopics = useMemo(() => chapters.flatMap(c => c.topics.map(t => ({ ...t, chapterId: c.id, chapterTitle: c.title, chapterNo: c.num }))), [chapters])

  const [openCh, setOpenCh] = useState(() => new Set(chapters.map(c => c.id)))
  const [active, setActive] = useState(null)
  const [html, setHtml] = useState('')
  const [busy, setBusy] = useState(false)
  const [showTree, setShowTree] = useState(false)

  const open = t => {
    const full = allTopics.find(x => x.id === t.id) || t
    setActive(full); setShowTree(false); setBusy(true); setHtml('')
    loadEnglishCheat(full.chapterId, full.id).then(d => { setHtml(d?.html || ''); setBusy(false) })
  }

  const toggleChapter = id => setOpenCh(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div className="en">
      <aside className={'en-tree' + (showTree ? ' open' : '')}>
        <div className="en-tree-head">
          <span className="en-group-label">English Cheat Sheets</span>
          <button className="en-tree-close" onClick={() => setShowTree(false)} aria-label="Close"><ChevronLeft size={16} /></button>
        </div>
        {chapters.map(c => {
          const isOpen = openCh.has(c.id)
          return (
            <div className="en-chapter" key={c.id}>
              <button className="en-chapter-row" onClick={() => toggleChapter(c.id)} aria-expanded={isOpen}>
                <span className="en-ch-num">{String(c.num).padStart(2, '0')}</span>
                <span className="en-ch-title">{c.title}</span>
                <span className="en-ch-count">{c.topics.length}</span>
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isOpen && (
                <div className="en-topics">
                  {c.topics.map(t => (
                    <button key={t.id} className={'en-topic' + (active?.id === t.id ? ' on' : '')} onClick={() => open(t)}>
                      <span className="en-t-num">{c.num}.{t.num}</span>
                      <span className="en-t-title">{t.title}</span>
                      <span className={'en-pill ' + IMP_CLASS[importanceOf(t.frequency)]}>{importanceOf(t.frequency)}</span>
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

        {active ? (
          <>
            <button className="sk-back" onClick={() => setActive(null)}><ArrowLeft size={15} /> All cheat sheets</button>
            <header className="en-head">
              <span className="en-chapter-chip">{String(active.chapterNo).padStart(2, '0')} {active.chapterTitle}</span>
              <h2 className="en-title">{active.title}</h2>
              <div className="en-chips">
                <span className={'en-pill ' + IMP_CLASS[importanceOf(active.frequency)]}>{importanceOf(active.frequency)} importance</span>
                <button className="ec-dl" onClick={() => printCheatHtml(html, active.title)}><Download size={14} /> Download PDF</button>
              </div>
            </header>
            {busy ? (
              <p className="muted-empty">Loading cheat sheet…</p>
            ) : (
              <div className="ec-cheat" dangerouslySetInnerHTML={{ __html: html }} />
            )}
          </>
        ) : (
          <p className="muted-empty"><Sparkles size={14} /> Pick a topic to open its cheat sheet.</p>
        )}
      </div>
    </div>
  )
}