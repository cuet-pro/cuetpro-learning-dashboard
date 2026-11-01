/* Attempt review — reused by both the full-screen exam (after submit) and the
   "My attempts" history. Pure presentational: gets the paper, the answer map
   and a precomputed summary; hands control back via onBack/onRetry. */
import { useMemo } from 'react'
import { Trophy, CheckCircle2, XCircle, AlertTriangle, RotateCcw, ArrowLeft } from 'lucide-react'
import { PQ_LETTERS, fmtClock } from '../lib/examEngine'

export default function PyqResult({ paper, answers, summary, onBack, onRetry }) {
  const qs = paper.questions || []
  const topicStats = useMemo(() => {
    const m = new Map()
    qs.forEach(q => {
      if (!m.has(q.topic)) m.set(q.topic, { topic: q.topic, total: 0, correct: 0 })
      const t = m.get(q.topic)
      t.total++
      const a = answers[q.num]
      if (a && PQ_LETTERS.indexOf(a) === q.answer_index) t.correct++
    })
    return [...m.values()].map(t => ({ ...t, acc: t.total ? Math.round(t.correct / t.total * 100) : 0 })).sort((a, b) => a.acc - b.acc)
  }, [qs, answers])
  const weakest = topicStats.filter(t => t.acc < 60).slice(0, 3)

  return (
    <div className="sk-subgrid">
      <div className="mk-result">
        <div className="mk-score">
          <Trophy size={20} />
          <b>{summary.marks}</b>
          <span>/ {summary.totalMarks} marks</span>
        </div>
        <div className="mk-stats">
          <div className="mk-stat ok"><CheckCircle2 size={14} /><b>{summary.c}</b><span>Correct</span></div>
          <div className="mk-stat no"><XCircle size={14} /><b>{summary.w}</b><span>Wrong</span></div>
          <div className="mk-stat sk"><b>{summary.u}</b><span>Skipped</span></div>
          <div className="mk-stat pct"><b>{summary.acc}%</b><span>Accuracy</span></div>
          <div className="mk-stat"><b>{fmtClock(summary.timeTaken)}</b><span>Time</span></div>
        </div>
        <div className="pq-result-btns">
          <button className="btn btn-primary-sm" onClick={onRetry}><RotateCcw size={13} /> Retry paper</button>
          <button className="btn btn-outline-sm" onClick={onBack}><ArrowLeft size={13} /> Back to papers</button>
        </div>
      </div>

      <div className="pq-topics">
        <b className="mk-review-h">Topic-wise accuracy</b>
        {topicStats.map(t => {
          const weak = weakest.some(w => w.topic === t.topic)
          return (
            <div className={'pq-topic-row' + (weak ? ' weak' : '')} key={t.topic}>
              <span className="pq-topic-name">{t.topic}</span>
              <span className="pq-topic-bar"><i style={{ width: t.acc + '%' }} /></span>
              <span className="pq-topic-acc">{t.correct}/{t.total} · {t.acc}%</span>
            </div>
          )
        })}
        {weakest.length > 0 && (
          <p className="pq-weak-hint"><AlertTriangle size={13} /> Weakest: {weakest.map(t => t.topic).join(', ')} — practise these topics.</p>
        )}
      </div>

      <div className="mk-review">
        <b className="mk-review-h">Answer review</b>
        {qs.map(q => {
          const a = answers[q.num]
          const ok = a && PQ_LETTERS.indexOf(a) === q.answer_index
          const cls = a ? (ok ? ' ok' : ' no') : ' sk'
          return (
            <div className={'mk-rev' + cls} key={q.num}>
              <span className="mk-rev-n">Q{q.num}</span>
              <div className="mk-rev-b">
                <p>{q.question}</p>
                <span className="mk-rev-a">
                  Your answer: <b>{a ? a + ') ' + q.options[PQ_LETTERS.indexOf(a)] : 'not attempted'}</b>
                  {!ok && <> · Correct: <b className="mk-rev-c">{PQ_LETTERS[q.answer_index]}) {q.options[q.answer_index]}</b></>}
                </span>
                {q.explanation && <span className="pq-expl">{q.explanation}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}