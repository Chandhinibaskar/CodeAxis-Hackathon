// DEMO-ONLY authentication stored in this browser (localStorage). Not secure for production.
// Replace signup/login/logout/currentUser with calls to a real auth API later; the UI will not change.
const USERS = 'bp:users', SESSION = 'bp:session'
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }

// Passwords are never stored as plain text: salted SHA-256 (demo level only).
async function hash(p) {
  if (!(window.crypto && crypto.subtle)) return 'x' + btoa(unescape(encodeURIComponent(p)))
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('bp-demo-salt:' + p))
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')
}
export const currentUser = () => read(SESSION, null)
export const logout = () => { try { localStorage.removeItem(SESSION) } catch { /* ignore */ } }

export async function signup({ name, email, org, password }) {
  const users = read(USERS, []), mail = email.trim().toLowerCase()
  if (users.some(u => u.email === mail)) throw new Error('An account with this email already exists. Try signing in.')
  const user = { name: name.trim(), email: mail, org: org.trim() }
  write(USERS, [...users, { ...user, h: await hash(password) }]); write(SESSION, user)
  return user
}
export async function login({ email, password }) {
  const u = read(USERS, []).find(x => x.email === email.trim().toLowerCase())
  if (!u || u.h !== await hash(password)) throw new Error('Email or password is incorrect.')
  const user = { name: u.name, email: u.email, org: u.org }
  write(SESSION, user)
  return user
}
