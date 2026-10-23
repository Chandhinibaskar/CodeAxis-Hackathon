import { useEffect, useState } from 'react'

// Animated "brand health" ring. A simple indicator of how many issues are still open, NOT an accuracy score.
export default function ScoreRing({ score }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { setShown(score); return }
    let raf, start = performance.now(), from = shown
    const tick = t => { const p = Math.min(1, (t - start) / 900); setShown(Math.round(from + (score - from) * p)); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [score])
  const C = 2 * Math.PI * 34, color = score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#e11d48'
  return (
    <div className="flex items-center gap-3" role="img" aria-label={`Brand health ${score} out of 100. This is an indicator of open issues, not an accuracy score.`}>
      <svg width="84" height="84" viewBox="0 0 84 84" aria-hidden="true">
        <circle cx="42" cy="42" r="34" fill="none" strokeWidth="9" className="ring-bg" />
        <circle cx="42" cy="42" r="34" fill="none" strokeWidth="9" strokeLinecap="round" className="ring-fg" stroke={color}
          strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} transform="rotate(-90 42 42)" />
        <text x="42" y="48" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a">{shown}</text>
      </svg>
      <div><p className="font-display text-lg font-extrabold leading-tight">Brand health</p><p className="text-sm text-slate-600">Based on issues still open</p></div>
    </div>)
}
