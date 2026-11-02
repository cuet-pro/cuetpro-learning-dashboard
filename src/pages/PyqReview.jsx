/* ── Paginated answer review (one question at a time) ──
   Replaces the old long "Answer review" scroll. Reuses the Analysis → Mock
   papers review UX (collapsed filter bar, colour-coded grid, one question at a
   time, keyboard navigation) but driven by a real attempt: real question text,
   passages, options with student/correct/wrong states, and explanations that
   default open for wrong & skipped questions. */
import { useEffect, useMemo, useState } from 'react'
import {
  Bookmark, ChevronLeft, ChevronRight, ArrowLeft, Check, X,
  Eye, Filter,
} from 'lucide-react'
import { PQ_LETTERS, fmtClock } from '../lib/examEngine'

const STATUS_LABEL = { correct: 'Correct', wrong: 'Wrong', skipped: 'Skipped' }

export default function PyqReview({
  paper, answers, perQTime, summary, scheme,
  initialQ, initialFilters, onBack,
}) {
  const qs = paper?.questions || []

  /* build the question+attempt union once */
  const base = useMemo(() => qs.map(q => {
    const sel = answers[q.num]
    const correct = sel != null && PQ_LETTERS.indexOf(sel) === q.answer_index
    return {
      ...q,
      selected: sel ?? null,
      correct,
      status: sel == null ? 'skipped' : (correct ? 'correct' : 'wrong'),
      time: Math.round(perQTime[q.num] || 0),
    }
  }), [qs, answers, perQTime])

  const [sec, setSec] = useState(initialFilters?.section || 'All')
  const [topicF, setTopicF] = useState(initialFilters?.topic || 'All')
  const [diff, setDiff] = useState(initialFilters?.difficulty || 'All')
  const [st, setSt] = useState(initialFilters?.status || 'All')
  const [onlyBm, setOnlyBm] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cp_pq_bookmarks') || '{}') } catch { return {} }
  })
  const [idx, setIdx] = useState(0)

  const sections = ['All', ...new Set(base.map(q => q.section))]
  const topics = ['All', ...new Set(base.filter(q => sec === 'All' || q.section === sec).map(q => q.topic))]

  const items = useMemo(() => base.filter(q =>
    (sec === 'All' || q.section === sec) &&
    (topicF === 'All' || q.topic === topicF) &&
    (diff === 'All' || q.difficulty === diff) &&
    (st === 'All' || q.status === st) &&
    (!onlyBm || bookmarks[q.num])
  ), [base, sec, topicF, diff, st, onlyBm, bookmarks])

  /* pin to the requested question, then to the filtered list */
  useEffect(() => {
    if (initialQ != null) {
      const i = items.findIndex(q => q.num === initialQ)
      if (i >= 0) { setIdx(i); return }
    }
    setIdx(0)
  }, [initialQ, items.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const cur = items[Math.min(idx, Math.max(0, items.length - 1))]

  const cnt = {
    correct: base.filter(q => q.status === 'correct').length,
    wrong: base.filter(q => q.status === 'wrong').length,
    skipped: base.filter(q => q.status === 'skipped').length,
  }
  /* score derived from counts + scheme, so the viewer is always self-consistent */
  const score = cnt.correct * (scheme?.correct ?? 5) + cnt.wrong * (scheme?.wrong ?? -1)

  const toggleBookmark = n => {
    const next = { ...bookmarks, [n]: !bookmarks[n] }
    setBookmarks(next)
    try { localStorage.setItem('cp_pq_bookmarks', JSON.stringify(next)) } catch { /* ignore */ }
  }

  /* default explanation visibility: open for wrong/skipped, collapsed for correct */
  const [explicitOpen, setExplicitOpen] = useState(null) // null = follow default
  useEffect(() => { setExplicitOpen(null) }, [idx, sec, topicF, diff, st, onlyBm])
  const explainOpen = explicitOpen != null ? explicitOpen : (cur ? cur.status !== 'correct' : false)

  /* keyboard: ← → move, S toggles explanation */
  useEffect(() => {
    const h = e => {
      if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return
      if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); setIdx(i => Math.min(items.length - 1, i + 1)) }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)) }
      else if (e.key === 's' || e.key === 'S') setExplicitOpen(v => v == null ? !explainOpen : !v)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [items.length, explainOpen])

  const segW = n => (base.length ? (n / base.length * 100).toFixed(2) + '%' : '0%')
  const summaryText = [
    sec === 'All' ? 'All sections' : sec,
    topicF === 'All' ? 'All topics' : topicF,
    diff === 'All' ? 'All difficulty' : diff,
    st === 'All' ? 'All attempts' : { correct: 'Correct only', wrong: 'Wrong only', skipped: 'Skipped only' }[st],
    ...(onlyBm ? ['Bookmarked'] : []),
  ].join(' · ')

  const totalTime = summary?.timeTaken || 0

  return (
    <div className="pqv-root">
      <div className="pqv-head">
        <button className="btn btn-outline-sm" onClick={onBack}><ArrowLeft size={14} /> Back to analytics</button>
        <div className="pqv-title">
          <h2>{paper?.name}</h2>
          <span className="pqv-sub">
            {base.length} questions · {cnt.correct} correct · {cnt.wrong} wrong · {cnt.skipped} skipped · score <b>{score}/{summary?.totalMarks}</b>
          </span>
        </div>
      </div>

      {/* stacked outcome bar */}
      <div className="pqv-scorebar">
        <div className="pqv-scorebar-track" role="img" aria-label={`${cnt.correct} correct, ${cnt.wrong} wrong, ${cnt.skipped} skipped out of ${base.length}`}>
          <span className="pqv-sb-seg correct" style={{ width: segW(cnt.correct) }} />
          <span className="pqv-sb-seg wrong" style={{ width: segW(cnt.wrong) }} />
          <span className="pqv-sb-seg skipped" style={{ width: segW(cnt.skipped) }} />
        </div>
        <div className="pqv-scorebar-legend">
          <span><i className="dot correct" /> {cnt.correct} correct</span>
          <span><i className="dot wrong" /> {cnt.wrong} wrong</span>
          <span><i className="dot skipped" /> {cnt.skipped} skipped</span>
          <span><i className="dot marked" /> bookmarked</span>
        </div>
      </div>

      {/* collapsed filter bar */}
      <div className="pqv-filterbar">
        <button className="pqv-filterbar-toggle" onClick={() => setFiltersOpen(v => !v)} aria-expanded={filtersOpen}>
          <Filter size={15} />
          <span className="pqv-filterbar-summary">{summaryText}</span>
          <span className={'pqv-filterbar-chev' + (filtersOpen ? ' open' : '')}>▾</span>
        </button>
        {filtersOpen && (
          <div className="pqv-filters">
            <div className="pqv-frow">
              <span className="pqv-flabel">Section</span>
              <div className="pqv-chips">{sections.map(s => (
                <button key={s} className={'pqv-chip' + (sec === s ? ' on' : '')} onClick={() => { setSec(s); setTopicF('All') }}>{s}</button>
              ))}</div>
            </div>
            <div className="pqv-frow">
              <span className="pqv-flabel">Topic</span>
              <div className="pqv-chips">{topics.map(t => (
                <button key={t} className={'pqv-chip' + (topicF === t ? ' on' : '')} onClick={() => setTopicF(t)}>{t}</button>
              ))}</div>
            </div>
            <div className="pqv-frow">
              <span className="pqv-flabel">Difficulty</span>
              <div className="pqv-chips">{['All', 'Easy', 'Medium', 'Hard'].map(d => (
                <button key={d} className={'pqv-chip' + (diff === d ? ' on' : '')} onClick={() => setDiff(d)}>{d}</button>
              ))}</div>
            </div>
            <div className="pqv-frow">
              <span className="pqv-flabel">Attempt</span>
              <div className="pqv-chips">
                {[['All', 'All'], ['correct', 'Correct ' + cnt.correct], ['wrong', 'Wrong ' + cnt.wrong], ['skipped', 'Skipped ' + cnt.skipped]].map(([k, label]) => (
                  <button key={k} className={'pqv-chip st-' + k + (st === k ? ' on' : '')} onClick={() => setSt(k)}>{label}</button>
                ))}
                <button className={'pqv-chip' + (onlyBm ? ' on' : '')} onClick={() => setOnlyBm(v => !v)}>Bookmarked</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* question grid */}
      <div className="pqv-nav">
        <div className="pqv-navgrid">
          {items.map((q, i) => (
            <button
              key={q.num}
              className={'pqv-qbtn ' + q.status + (i === idx ? ' cur' : '') + (bookmarks[q.num] ? ' marked' : '')}
              onClick={() => { setIdx(i); setExplicitOpen(null) }}
              title={'Q' + q.num + ' · ' + q.topic + ' · ' + STATUS_LABEL[q.status]}
            >{q.num}</button>
          ))}
          {items.length === 0 && <span className="pqv-none">No questions match these filters.</span>}
        </div>
      </div>

      {/* one question at a time */}
      {cur && (
        <div className="pqv-view">
          <div className="pqv-viewhead">
            <span className={'pqv-badge ' + cur.status}>{STATUS_LABEL[cur.status]}</span>
            <span className="pqv-meta">
              Q{cur.num} · {cur.section} › {cur.topic} · {cur.difficulty} · {cur.time}s
              {totalTime > 0 && <> · paper {fmtClock(totalTime)}</>}
            </span>
            <div className="pqv-viewacts">
              <button className={'pqv-iconbtn' + (bookmarks[cur.num] ? ' on' : '')} onClick={() => toggleBookmark(cur.num)} title="Bookmark">
                <Bookmark size={14} />
              </button>
              <button className="pqv-iconbtn" disabled={idx === 0} onClick={() => { setIdx(i => Math.max(0, i - 1)); setExplicitOpen(null) }} title="Previous (A / ←)">
                <ChevronLeft size={15} />
              </button>
              <button className="pqv-iconbtn" disabled={idx >= items.length - 1} onClick={() => { setIdx(i => Math.min(items.length - 1, i + 1)); setExplicitOpen(null) }} title="Next (D / →)">
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          <div className="pqv-body">
            {/* passage in its own pane — never inside the question card */}
            {cur.passage ? (
              <aside className="pqv-passage">
                <div className="pqv-passage-head">Passage</div>
                <div className="pqv-passage-text">{cur.passage}</div>
              </aside>
            ) : null}

            <div className={'pqv-qpane' + (cur.passage ? ' with-passage' : '')}>
              <p className="pqv-qtext">{cur.question}</p>

              <div className="pqv-opts">
                {cur.options.map((opt, oi) => {
                  const letter = PQ_LETTERS[oi]
                  const isCorrect = oi === cur.answer_index
                  const isChosen = cur.selected === letter
                  const isWrongChoice = isChosen && !isCorrect
                  const cls = isCorrect ? ' correct' : isWrongChoice ? ' wrong' : isChosen ? ' chosen' : ''
                  return (
                    <div key={oi} className={'pqv-opt' + cls}>
                      <span className="pqv-optk">{letter}</span>
                      <span className="pqv-optt">{opt}</span>
                      <span className="pqv-optstate">
                        {isCorrect && <><Check size={14} /> correct</>}
                        {isWrongChoice && <><X size={14} /> your answer</>}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="pqv-solbar">
                <button className="btn btn-primary-sm" onClick={() => setExplicitOpen(v => v == null ? !explainOpen : !v)}>
                  <Eye size={14} /> {explainOpen ? 'Hide explanation' : 'Show explanation'} <span className="pqv-key">S</span>
                </button>
                <span className="pqv-hint">A / D or ← → to move · S toggles the explanation</span>
              </div>

              {explainOpen && (
                <div className="pqv-sol">
                  <div className="pqv-solhead">Explanation</div>
                  {cur.explanation
                    ? <p className="pqv-soltext">{cur.explanation}</p>
                    : <p className="pqv-soltext pqv-ghost">
                        The correct answer is <b>{PQ_LETTERS[cur.answer_index]}</b>. {cur.status === 'wrong'
                          ? 'You chose ' + cur.selected + ', which cost ' + (scheme?.wrong ?? -1) + ' mark plus the ' + (scheme?.correct ?? 5) + ' you could have earned.'
                          : 'You skipped this — it costs nothing, but it is one more topic to nail next time.'}
                      </p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="pqv-foot">
        <button className="btn btn-outline-sm" disabled={idx === 0} onClick={() => { setIdx(i => Math.max(0, i - 1)); setExplicitOpen(null) }}>
          <ChevronLeft size={14} /> Previous
        </button>
        <span className="pqv-pos">{items.length ? idx + 1 : 0} / {items.length}</span>
        <button className="btn btn-outline-sm" disabled={idx >= items.length - 1} onClick={() => { setIdx(i => Math.min(items.length - 1, i + 1)); setExplicitOpen(null) }}>
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}