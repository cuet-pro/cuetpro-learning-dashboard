import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, ChevronDown, ChevronLeft, BookOpen, Star, Bookmark, ArrowRight, ArrowLeft, Menu } from 'lucide-react'
import { getEnglishIndex, loadEnglishChapter, importanceOf, chapterWeight, sanitizeNotesHtml } from '../lib/englishNotes'
import './englishNotes.css'

const IMP_CLASS = { HIGH: 'high', MED: 'med', LOW: 'low' }

/* Native English Notes module — chapter tree + topic page + notes HTML.
   Built from cuetpro_english_chapters.json (split per chapter for lazy load). */
export default function EnglishNotes({ onOpenWordBank }) {
  const idx = useMemo(() => getEnglishIndex(), [])
  const chapters = useMemo(() => idx.order.map(cid => ({ id: cid, ...idx.chapters[cid] })), [idx])

  const firstTopic = chapters[0]?.topics?.[0]
  const [active, setActive] = useState(() => ({ chapterId: chapters[0]?.id, topicId: firstTopic?.id }))
  const [tab, setTab] = useState('notes')
  const [data, setData] = useState(null)
  const [openCh, setOpenCh] = useState(() => new Set([chapters[0]?.id]))
  const [showTree, setShowTree] = useState(false)
  const notesRef = useRef(null)

  /* lazy-load the active chapter's heavy content */
  useEffect(() => {
    let alive = true
    setData(null)
    loadEnglishChapter(active.chapterId).then(d => { if (alive) setData(d) })
    return () => { alive = false }
  }, [active.chapterId])

  const chapter = chapters.find(c => c.id === active.chapterId)
  const topic = chapter?.topics?.find(t => t.id === active.topicId)
  const subdesc = topic ? idx.subdesc[topic.id] : ''

  const toggleChapter = id => setOpenCh(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })

  const goto = (chapterId, topicId) => {
    setActive({ chapterId, topicId })
    setTab('notes')
    setShowTree(false)
  }

  /* prev / next topic across the flattened tree */
  const flatTopics = useMemo(() => chapters.flatMap(c => (c.topics || []).map(t => ({ cid: c.id, t }))), [chapters])
  const pos = flatTopics.findIndex(x => x.cid === active.chapterId && x.t.id === active.topicId)
  const prev = pos > 0 ? flatTopics[pos - 1] : null
  const next = pos >= 0 && pos < flatTopics.length - 1 ? flatTopics[pos + 1] : null

  /* notes click delegation: inline practice questions, examples, word-bank */
  useEffect(() => {
    const el = notesRef.current
    if (!el) return
    const onClick = e => {
      const vb = e.target.closest('[data-act="open-vbank"]')
      if (vb) { onOpenWordBank?.(vb.getAttribute('data-topic')); return }
      const opt = e.target.closest('.vpq-opt')
      if (opt) {
        const wrap = opt.closest('.vpq-opts') || opt.parentElement
        if (wrap && wrap.dataset.answered !== '1') {
          wrap.dataset.answered = '1'
          const correct = wrap.querySelector('.vpq-correct')
          if (opt === correct) opt.classList.add('picked-ok')
          else { opt.classList.add('picked-no'); correct && correct.classList.add('reveal') }
          const ex = wrap.parentElement.querySelector('.vpq-explain')
          if (ex) ex.classList.add('show')
        }
        return
      }
      const vex = e.target.closest('.vex-quote')
      if (vex) { vex.closest('.vex-item')?.classList.toggle('open'); return }
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [data, tab, onOpenWordBank])

  const notesHtml = data?.notes?.[active.topicId] || ''

  return (
    <div className="en">
      {/* chapter tree */}
      <aside className={'en-tree' + (showTree ? ' open' : '')}>
        <div className="en-tree-head">
          <span className="en-group-label">CUET English</span>
          <button className="en-tree-close" onClick={() => setShowTree(false)} aria-label="Close chapters"><ChevronLeft size={16} /></button>
        </div>
        {chapters.map(c => {
          const open = openCh.has(c.id)
          return (
            <div className="en-chapter" key={c.id}>
              <button className="en-chapter-row" onClick={() => toggleChapter(c.id)} aria-expanded={open}>
                <span className={'en-ch-dot ' + chapterWeight(c.avgPerPaper)} />
                <span className="en-ch-num">{String(c.num).padStart(2, '0')}</span>
                <span className="en-ch-title">{c.title}</span>
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {open && (
                <div className="en-topics">
                  {c.topics.map(t => (
                    <button key={t.id} className={'en-topic' + (active.topicId === t.id ? ' on' : '')} onClick={() => goto(c.id, t.id)}>
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

      {/* topic page */}
      <div className="en-main">
        <button className="en-chapters-btn" onClick={() => setShowTree(true)}><Menu size={14} /> Chapters</button>

        {topic ? (
          <>
            <nav className="en-breadcrumb">
              English <ChevronRight size={12} /> {chapter.title}
            </nav>
            <header className="en-head">
              <span className="en-chapter-chip">{String(chapter.num).padStart(2, '0')} {chapter.title}</span>
              <h2 className="en-title">{topic.title}</h2>
              {subdesc && <p className="en-subdesc">{subdesc}</p>}
              <div className="en-chips">
                <span className="en-chip">{topic.frequency != null ? topic.frequency + ' avg Q / paper' : '—'}</span>
                <span className={'en-pill ' + IMP_CLASS[importanceOf(topic.frequency)]}>{importanceOf(topic.frequency)} importance</span>
              </div>
            </header>

            <div className="en-tabs">
              <button className={tab === 'notes' ? 'on' : ''} onClick={() => setTab('notes')}><BookOpen size={14} /> Notes</button>
              <button className={tab === 'practice' ? 'on' : ''} onClick={() => setTab('practice')}><Star size={14} /> Practice</button>
            </div>

            {tab === 'notes' ? (
              <div className="en-notes" ref={notesRef} dangerouslySetInnerHTML={{ __html: sanitizeNotesHtml(notesHtml) }} />
            ) : (
              <div className="en-practice">
                {data?.pyqBank?.[active.topicId]?.length ? (
                  <p className="en-practice-note">Practice for this topic is being built — {data.pyqBank[active.topicId].length} questions available.</p>
                ) : (
                  <p className="en-practice-note">No practice questions for this topic yet.</p>
                )}
              </div>
            )}

            <div className="en-pager">
              <button className="btn btn-outline-sm" disabled={!prev} onClick={() => prev && goto(prev.cid, prev.t.id)}><ArrowLeft size={13} /> {prev ? prev.t.title : 'Previous'}</button>
              <button className="btn btn-outline-sm" disabled={!next} onClick={() => next && goto(next.cid, next.t.id)}>{next ? next.t.title : 'Next'} <ArrowRight size={13} /></button>
            </div>
          </>
        ) : (
          <p className="muted-empty">Loading English notes…</p>
        )}
      </div>
    </div>
  )
}