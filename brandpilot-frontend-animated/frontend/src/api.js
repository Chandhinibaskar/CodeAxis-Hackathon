// API client for POST /api/review. Base URL comes from VITE_API_URL (empty = same origin / dev proxy).
const BASE = import.meta.env.VITE_API_URL || ''
export class ApiError extends Error {}

export async function reviewDraft(payload, timeoutMs = 30000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}/api/review`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: ctrl.signal })
    if (!res.ok) {
      const msg = res.status === 422 ? 'The server could not read this request. Check the draft text.'
        : res.status === 429 ? 'Too many reviews at once. Wait a moment and try again.'
        : res.status >= 500 ? 'The review service had a problem. Please try again.'
        : `The request failed (status ${res.status}).`
      throw new ApiError(msg)
    }
    const data = await res.json()
    if (!data || !Array.isArray(data.findings)) throw new ApiError('The server sent an unexpected response.')
    return data
  } catch (e) {
    if (e instanceof ApiError) throw e
    if (e.name === 'AbortError') throw new ApiError('The review took too long. Please try again.')
    throw new ApiError('Cannot reach the review service. Check that the backend is running.')
  } finally { clearTimeout(timer) }
}
