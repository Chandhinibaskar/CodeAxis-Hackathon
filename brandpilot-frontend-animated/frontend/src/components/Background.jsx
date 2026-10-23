import { useEffect, useRef } from 'react'

// Page background: drifting colour blobs + a light connected-dot network + soft cursor glow.
// Everything is decorative (aria-hidden), never blocks clicks, and stops for reduced-motion users.
export default function Background() {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, x = c.getContext('2d')
    const still = matchMedia('(prefers-reduced-motion:reduce)').matches
    let w, hgt, raf, dots = []
    const size = () => { w = c.width = innerWidth; hgt = c.height = innerHeight
      dots = Array.from({ length: Math.min(70, Math.floor(w / 22)) }, () => ({ x: Math.random() * w, y: Math.random() * hgt, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 })) }
    const draw = () => {
      x.clearRect(0, 0, w, hgt)
      dots.forEach((d, i) => {
        if (!still) { d.x += d.vx; d.y += d.vy; if (d.x < 0 || d.x > w) d.vx *= -1; if (d.y < 0 || d.y > hgt) d.vy *= -1 }
        x.fillStyle = '#6366f1aa'; x.beginPath(); x.arc(d.x, d.y, 2, 0, 7); x.fill()
        for (let j = i + 1; j < dots.length; j++) {
          const e = dots[j], dist = Math.hypot(d.x - e.x, d.y - e.y)
          if (dist < 130) { x.strokeStyle = `rgba(99,102,241,${.22 * (1 - dist / 130)})`; x.beginPath(); x.moveTo(d.x, d.y); x.lineTo(e.x, e.y); x.stroke() }
        }
      })
      if (!still) raf = requestAnimationFrame(draw)
    }
    const move = e => { document.documentElement.style.setProperty('--mx', e.clientX + 'px'); document.documentElement.style.setProperty('--my', e.clientY + 'px') }
    size(); draw(); addEventListener('resize', size)
    if (!still && matchMedia('(pointer:fine)').matches) addEventListener('mousemove', move, { passive: true })
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('mousemove', move) }
  }, [])
  return (<div aria-hidden="true"><div className="aurora"><i /><i /><i /></div>
    <canvas ref={cv} className="pointer-events-none fixed inset-0 -z-10" /><div className="cursor-glow" /></div>)
}
