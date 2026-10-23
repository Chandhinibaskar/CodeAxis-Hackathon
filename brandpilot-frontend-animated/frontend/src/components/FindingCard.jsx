const SEV = {
  High: { icon: '▲', border: 'border-l-rose-500', chip: 'bg-rose-100 text-rose-900' },
  Medium: { icon: '●', border: 'border-l-amber-500', chip: 'bg-amber-100 text-amber-900' },
  Low: { icon: '◆', border: 'border-l-cyan-500', chip: 'bg-cyan-100 text-cyan-900' } }

// One finding: severity (icon + text + colour), excerpt, explanation, source, side-by-side suggestion.
export default function FindingCard({ f, index = 0, active, evidence, state, canAccept, onAccept, onDismiss }) {
  const sev = SEV[f.severity] || SEV.Medium
  const sources = (f.evidence_ids || []).map(id => ({ id, text: evidence[id] }))
  return (
    <li id={`finding-${f.id}`} tabIndex={-1} style={{ '--i': index }} className={`panel reveal lift border-l-8 p-4 ${active ? 'ring-4 ring-violet-400' : ''} ${sev.border} ${state === 'accepted' ? 'pop !border-emerald-500 !bg-emerald-50' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 text-sm font-bold ${sev.chip}`}><span aria-hidden="true">{sev.icon} </span>{f.severity} severity</span>
        <span className="rounded-full bg-indigo-100 px-3 text-sm font-bold text-indigo-900">{f.category}</span>
        {f.confidence && <span className="text-sm text-slate-600">Confidence: {f.confidence}</span>}
      </div>
      <p className="mt-2">Found: <mark className="rounded bg-yellow-200 px-1">{f.excerpt}</mark></p>
      <p className="mt-1">{f.explanation}</p>
      <div className="mt-2 rounded-r-lg border-l-4 border-violet-600 bg-violet-50 px-3 py-2 text-sm">
        <strong>Source: </strong>
        {sources.length ? sources.map(s => <span key={s.id} className="block">{s.id}{s.text ? `: ${s.text}` : ''}</span>)
          : 'No approved source found. Needs human verification.'}
      </div>
      {f.suggestion && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-rose-50 p-2"><span className="block text-xs font-bold text-slate-600">Your text</span>{f.excerpt}</div>
          <div className="rounded-lg bg-emerald-50 p-2"><span className="block text-xs font-bold text-slate-600">Suggested</span>{f.suggestion}</div>
        </div>)}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {state === 'accepted'
          ? <span className="font-bold text-emerald-700">✓ Accepted. Your draft was updated.</span>
          : <>
            <button type="button" disabled={!canAccept} onClick={onAccept} className="btn-primary px-4">Accept suggestion</button>
            <button type="button" onClick={onDismiss} className="btn-ghost px-4">Dismiss finding</button>
            {!canAccept && <span className="text-sm text-slate-600">{f.suggestion ? 'This text is no longer in your draft.' : 'No rewrite available. A person must check this.'}</span>}
          </>}
      </div>
    </li>)
}
