import { useEffect, useRef, useState } from 'react'
import { reviewDraft } from './api.js'
import { SAMPLE_REFERENCE, SAMPLE_DRAFT, EMPTY_REFERENCE } from './sample.js'
import FindingCard from './components/FindingCard.jsx'
import ScoreRing from './components/ScoreRing.jsx'
import DraftPreview from './components/DraftPreview.jsx'

const MAX = 5000 // keep in sync with the backend input limit
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }
const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`
const WEIGHT = { High: 18, Medium: 9, Low: 4 }

function toCsv(findings, handled) {
  const rows = [['Category', 'Severity', 'Excerpt', 'Explanation', 'Suggestion', 'Sources', 'Decision']]
  findings.forEach(f => rows.push([f.category, f.severity, f.excerpt, f.explanation, f.suggestion || '', (f.evidence_ids || []).join('; ') || 'No approved source found', handled[f.id] || 'open']))
  return rows.map(r => r.map(q).join(',')).join('\n')
}
function download(name, text) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' })); a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}

export default function Workspace({ user, onLogout }) {
  const [draft, setDraft] = useState('')
  const [useSample, setUseSample] = useState(true)
  const [status, setStatus] = useState('idle') // idle | loading | error | done
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [handled, setHandled] = useState({}) // finding id -> 'accepted' | 'dismissed'
  const [filter, setFilter] = useState('All')
  const [activeId, setActiveId] = useState(null)
  const [note, setNote] = useState('')
  const [size, setSize] = useState(read('bp:fs', 100))
  const histKey = `bp:history:${user.email}`
  const [history, setHistory] = useState(read(histKey, []))
  const resultsRef = useRef(null)
  const ref = useSample ? SAMPLE_REFERENCE : EMPTY_REFERENCE

  useEffect(() => { document.documentElement.style.fontSize = size + '%'; write('bp:fs', size) }, [size])

  // id -> text lookup so each finding can show the source it cites
  const evidence = {}
  ref.brand_guidelines.forEach(g => { evidence[g.id] = g.text })
  ref.approved_facts.forEach(g => { evidence[g.id] = g.text })
  ref.approved_terms.forEach(t => { evidence[t.id] = `Use "${t.preferred}" instead of ${t.avoid.map(a => `"${a}"`).join(', ')}` })

  async function runReview() {
    if (!draft.trim()) { setFormError('Add some text first. Paste a draft or load the sample.'); return }
    if (draft.length > MAX) { setFormError(`This draft is over ${MAX} characters. Shorten it and try again.`); return }
    setFormError(''); setError(''); setStatus('loading'); setHandled({}); setFilter('All'); setActiveId(null); setNote('')
    try {
      const data = await reviewDraft({ draft_text: draft, ...ref })
      setResult(data); setStatus('done')
      const entry = { t: Date.now(), text: draft, n: data.findings.length, high: data.findings.filter(f => f.severity === 'High').length }
      const next = [entry, ...history].slice(0, 8); setHistory(next); write(histKey, next)
      setTimeout(() => resultsRef.current?.focus(), 50)
    } catch (e) { setError(e.message); setStatus('error') }
  }

  const canAccept = f => !!f.suggestion && draft.includes(f.excerpt)
  function accept(f) { setDraft(d => d.replace(f.excerpt, f.suggestion)); setHandled(h => ({ ...h, [f.id]: 'accepted' })) }
  const dismiss = f => setHandled(h => ({ ...h, [f.id]: 'dismissed' }))
  function pick(id) {
    setActiveId(id); setFilter('All')
    setTimeout(() => { const el = document.getElementById(`finding-${id}`); el?.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth' }); el?.focus({ preventScroll: true }) }, 30)
  }
  async function copySummary() {
    const open = all.filter(f => !handled[f.id])
    const text = `BrandPilot AI review: ${all.length} findings, ${open.length} still open (score ${score}/100).\n` + all.map(f => `- [${f.severity}] ${f.category}: "${f.excerpt}" -> ${f.suggestion || 'needs human check'} (${handled[f.id] || 'open'})`).join('\n')
    try { await navigator.clipboard.writeText(text); setNote('Summary copied.') } catch { setNote('Could not copy. Use Download report instead.') }
  }

  const all = result?.findings || []
  const unresolved = all.filter(f => !handled[f.id])
  const score = Math.max(0, 100 - unresolved.reduce((a, f) => a + (WEIGHT[f.severity] ?? 9), 0))
  const visible = all.filter(f => handled[f.id] !== 'dismissed')
  const shown = visible.filter(f => filter === 'All' || f.severity === filter)
  const counts = ['High', 'Medium', 'Low'].map(s => [s, visible.filter(f => f.severity === s).length])

  return (
    <>
      <a href="#results" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:bg-white focus:p-2">Skip to results</a>
      <header className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4">
        <span className="grad-text font-display text-2xl font-extrabold">BrandPilot AI</span>
        <span className="hidden text-sm text-slate-600 md:inline">Review smarter. Publish with confidence.</span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Text size" className="flex gap-1">
            {[[100, 'A'], [115, 'A+'], [130, 'A++']].map(([v, l]) => <button key={v} type="button" aria-pressed={size === v} aria-label={`Text size ${v} percent`} onClick={() => setSize(v)} className="tab !min-h-[40px]">{l}</button>)}
          </div>
          <span className="text-sm">Signed in as <b>{user.name}</b></span>
          <button type="button" onClick={onLogout} className="btn-ghost px-4">Log out</button>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-4 pb-16 lg:grid-cols-2">
        <section aria-labelledby="draft-h" className="panel reveal p-4 lg:sticky lg:top-4 lg:self-start">
          <h1 id="draft-h" className="text-2xl font-extrabold">Check your draft before it goes live</h1>
          <p className="text-sm text-slate-600">Paste your copy and BrandPilot compares it with your approved guidelines. You decide what changes.</p>
          <label htmlFor="draft" className="mt-3 block font-bold">Your draft</label>
          <textarea id="draft" value={draft} onChange={e => setDraft(e.target.value)} rows={9}
            onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runReview() }}
            aria-invalid={!!formError} aria-describedby="draft-help draft-err"
            className="field mt-1 w-full p-3 leading-relaxed" placeholder="Paste a post, email or page here. Tip: press Ctrl+Enter to review." />
          <div className="flex justify-between text-sm text-slate-600" id="draft-help"><span>{draft.length} / {MAX} characters</span><span>{draft.trim() ? draft.trim().split(/\s+/).length : 0} words</span></div>
          <p id="draft-err" role="alert" className="min-h-[1.5rem] text-red-700">{formError}</p>
          <label className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5" checked={useSample} onChange={e => setUseSample(e.target.checked)} />
            Check against the sample brand guidelines</label>
          {useSample && (
            <details className="mt-2 rounded-lg bg-indigo-50 p-2 text-sm"><summary className="cursor-pointer font-bold">See the rules being used</summary>
              <ul className="mt-1 list-disc pl-5">{Object.entries(evidence).map(([id, t]) => <li key={id}><b>{id}</b>: {t}</li>)}</ul></details>)}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={runReview} disabled={status === 'loading'} className="btn-primary px-5">{status === 'loading' ? 'Reviewing…' : status === 'done' ? 'Review again' : 'Review my draft'}</button>
            <button type="button" onClick={() => { setDraft(SAMPLE_DRAFT); setFormError('') }} className="btn-ghost px-4">Try a sample draft</button>
            <button type="button" onClick={() => { setDraft(''); setResult(null); setStatus('idle') }} className="btn-ghost px-4">Clear</button>
          </div>
          {status === 'done' && visible.length > 0 && <DraftPreview text={draft} findings={visible.filter(f => !handled[f.id])} activeId={activeId} onPick={pick} />}
          {history.length > 0 && (
            <details className="mt-3 rounded-lg bg-indigo-50 p-2 text-sm"><summary className="cursor-pointer font-bold">Recent reviews ({history.length})</summary>
              <ul className="mt-2 grid gap-1">{history.map(h => (
                <li key={h.t} className="flex items-center justify-between gap-2 rounded bg-white p-2">
                  <span>{new Date(h.t).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} · {h.n} findings{h.high ? ` (${h.high} high)` : ''}<span className="block truncate text-slate-600">{h.text.slice(0, 50)}…</span></span>
                  <button type="button" className="btn-ghost px-3" onClick={() => { setDraft(h.text); setResult(null); setStatus('idle') }}>Load</button></li>))}</ul>
              <button type="button" className="mt-2 font-bold text-indigo-700 underline" onClick={() => { setHistory([]); write(histKey, []) }}>Clear history</button></details>)}
        </section>

        <section id="results" aria-labelledby="res-h" aria-busy={status === 'loading'}>
          <h2 id="res-h" ref={resultsRef} tabIndex={-1} className="text-2xl font-extrabold">What we found</h2>
          <div aria-live="polite">
            {status === 'idle' && <p className="empty reveal mt-2 p-6">Nothing to show yet. Paste a draft, or try the sample, then choose <b>Review my draft</b>. Each finding will show the rule behind it and a suggested fix.</p>}
            {status === 'loading' && <div className="panel pop mt-2 p-6"><p className="font-bold">Comparing your draft with your guidelines…</p><div className="bar mt-3" aria-hidden="true"><i /></div></div>}
            {status === 'error' && <div role="alert" className="mt-2 rounded-xl border-2 border-red-700 bg-red-50 p-4"><p className="font-bold text-red-800">{error}</p>
              <button type="button" onClick={runReview} className="btn-primary mt-2 px-4">Try again</button></div>}
            {status === 'done' && all.length === 0 && <p className="pop mt-2 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4 font-bold text-emerald-800">Looking good. No issues found against the guidelines you supplied. A person still decides what gets published.</p>}
            {status === 'done' && all.length > 0 && <>
              <div className="panel pop mt-2 flex flex-wrap items-center justify-between gap-3 p-4">
                <ScoreRing score={score} />
                <div className="flex flex-wrap gap-2">{counts.map(([s, n]) => <span key={s} className={`chip chip-${s}`}>{n} {s}</span>)}</div>
              </div>
              {result.needs_human_review && <p className="mt-2 rounded-lg bg-indigo-50 p-2 text-sm">Suggestions are optional. A person must review and approve this content. BrandPilot never approves it.</p>}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div role="group" aria-label="Filter findings by severity" className="flex flex-wrap gap-2">
                  {['All', 'High', 'Medium', 'Low'].map(s => <button key={s} type="button" className="tab" aria-pressed={filter === s} onClick={() => setFilter(s)}>{s}</button>)}</div>
                <span className="ml-auto flex gap-2">
                  <button type="button" className="btn-ghost px-3" onClick={copySummary}>Copy summary</button>
                  <button type="button" className="btn-ghost px-3" onClick={() => download('brandpilot-report.csv', toCsv(all, handled))}>Download report</button></span>
              </div>
              <p role="status" className="min-h-[1.25rem] text-sm text-emerald-700">{note}</p>
              {visible.length === 0 && <p className="pop rounded-xl border-2 border-emerald-600 bg-emerald-50 p-4 font-bold text-emerald-800">All findings handled. Nice work. A person still gives the final approval.</p>}
              {visible.length > 0 && shown.length === 0 && <p className="empty p-4">No {filter.toLowerCase()} severity findings. Choose All to see the rest.</p>}
              <ul className="mt-2 grid gap-3">{shown.map((f, i) => <FindingCard key={f.id} index={i} f={f} active={activeId === f.id} evidence={evidence} state={handled[f.id]} canAccept={canAccept(f)} onAccept={() => accept(f)} onDismiss={() => dismiss(f)} />)}</ul></>}
          </div>
        </section>
      </main>
    </>)
}
