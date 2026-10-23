// DEV MOCK ONLY: lets you test the UI before the real FastAPI backend is ready. Same contract as POST /api/review.
import http from 'node:http'
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }
  if (req.method !== 'POST' || req.url !== '/api/review') { res.writeHead(404); return res.end() }
  let b = ''; req.on('data', c => b += c); req.on('end', () => {
    let p; try { p = JSON.parse(b) } catch { res.writeHead(422); return res.end('{}') }
    const t = p.draft_text || '', out = []; let n = 1
    const add = (o) => out.push({ id: 'F-' + String(n++).padStart(3, '0'), evidence_ids: [], confidence: 'medium', suggestion: '', ...o })
    ;(p.approved_terms || []).forEach(x => x.avoid.forEach(a => { if (t.includes(a)) add({ category: 'Terminology', severity: 'Low', excerpt: a, explanation: `The term list prefers "${x.preferred}".`, suggestion: x.preferred, evidence_ids: [x.id], confidence: 'high' }) }))
    if (/best in the world/i.test(t)) add({ category: 'Claims', severity: 'High', excerpt: 'best in the world', explanation: 'Superlatives need a cited ranking.', suggestion: 'a leading option', evidence_ids: ['CLAIM-01'] })
    if (/hey guys/i.test(t)) add({ category: 'Tone', severity: 'Medium', excerpt: 'Hey guys', explanation: 'Avoid gendered group greetings.', suggestion: 'Hi everyone', evidence_ids: ['VOICE-01'] })
    if (/never fails/i.test(t)) add({ category: 'Claims', severity: 'Medium', excerpt: 'never fails', explanation: 'No approved source supports this absolute claim.' })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ findings: out, review_summary: 'Review completed (mock)', needs_human_review: true }))
  })
}).listen(8000, () => console.log('Mock API on http://localhost:8000'))
