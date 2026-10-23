// Shows the draft with each open finding highlighted in place. Clicking a highlight jumps to its card.
function split(text, findings) {
  const hits = []
  findings.forEach(f => { const i = text.indexOf(f.excerpt); if (i > -1 && f.excerpt) hits.push({ i, len: f.excerpt.length, f }) })
  hits.sort((a, b) => a.i - b.i)
  const out = []; let pos = 0
  hits.forEach(h => { if (h.i < pos) return; out.push(text.slice(pos, h.i)); out.push(h); pos = h.i + h.len })
  out.push(text.slice(pos)); return out
}
export default function DraftPreview({ text, findings, activeId, onPick }) {
  return (
    <div className="mt-3 rounded-xl bg-indigo-50/70 p-3">
      <h3 className="font-bold">Highlighted draft</h3>
      <p className="text-sm text-slate-600">Select a highlight to jump to its finding.</p>
      <p className="mt-2 whitespace-pre-wrap leading-loose">
        {split(text, findings).map((p, k) => typeof p === 'string' ? p :
          <button key={k} type="button" onClick={() => onPick(p.f.id)} aria-label={`${p.f.severity} severity finding: ${p.f.excerpt}`}
            className={`hl hl-${p.f.severity} ${activeId === p.f.id ? 'on' : ''}`}>{text.slice(p.i, p.i + p.len)}</button>)}
      </p>
    </div>)
}
