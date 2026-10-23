import { useState } from 'react'
import { signup, login } from '../auth.js'

const score = p => [p.length >= 8, /[A-Z]/.test(p) && /[a-z]/.test(p), /\d/.test(p), /[^\w\s]/.test(p)].filter(Boolean).length
const LABEL = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong']
const COLOR = ['bg-red-600', 'bg-red-600', 'bg-amber-600', 'bg-emerald-600', 'bg-emerald-600']

function Field({ id, label, error, children }) {
  return (
    <div className="mt-3">
      <label htmlFor={id} className="block font-bold">{label}</label>
      {children}
      <p id={`${id}-err`} role="alert" className="min-h-[1.25rem] text-sm text-red-700">{error}</p>
    </div>)
}
const input = 'field mt-1 w-full p-2.5'

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const su = mode === 'signup'
  const [f, setF] = useState({ name: '', email: '', org: '', password: '', confirm: '', terms: false })
  const [errs, setErrs] = useState({})
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [serverErr, setServerErr] = useState('')
  const set = k => e => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const s = score(f.password)

  function validate() {
    const e = {}
    if (su && !f.name.trim()) e.name = 'Enter your full name.'
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) e.email = 'Enter a valid email, like name@company.com.'
    if (su && !f.org.trim()) e.org = 'Enter your organisation.'
    if (f.password.length < 8) e.password = 'Use at least 8 characters.'
    if (su && f.confirm !== f.password) e.confirm = 'Passwords do not match.'
    if (su && !f.terms) e.terms = 'Accept the terms to continue.'
    setErrs(e); return !Object.keys(e).length
  }
  async function submit(ev) {
    ev.preventDefault(); setServerErr('')
    if (!validate()) return
    setBusy(true)
    try { onAuth(su ? await signup(f) : await login(f)) }
    catch (x) { setServerErr(x.message); setBusy(false) }
  }
  const switchMode = () => { setMode(su ? 'login' : 'signup'); setErrs({}); setServerErr('') }
  const a11y = id => ({ id, 'aria-invalid': !!errs[id], 'aria-describedby': `${id}-err` })

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      
      <aside className="aurora-panel relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-center" aria-hidden="false">
        {['✓', '¶', '✎'].map((c, i) => (
          <span key={c} aria-hidden="true" className="absolute text-6xl opacity-20"
            style={{ left: `${12 + i * 30}%`, top: `${10 + i * 26}%`, animation: `drift ${12 + i * 4}s ease-in-out infinite alternate` }}>{c}</span>))}
        <p className="font-display text-2xl font-extrabold">BrandPilot <span className="text-cyan-300">AI</span></p>
        <h2 className="mt-4 max-w-md text-4xl font-extrabold">Review smarter. Publish with confidence.</h2>
        <p className="mt-3 max-w-md text-slate-300">Catch off-brand wording, outdated facts and risky claims before they go live. Every finding shows its source, and you always make the final call.</p>
        <ul className="mt-6 grid gap-2">{['Every finding cites a source', 'Suggestions never auto-apply', 'You approve what gets published'].map((t, i) => (<li key={t} className="reveal flex items-center gap-2" style={{ '--i': i + 2 }}><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-300 font-bold text-slate-900" aria-hidden="true">✓</span>{t}</li>))}</ul>
      </aside>
      <main className="flex items-center justify-center p-4">
        <form onSubmit={submit} noValidate className="panel reveal w-full max-w-md p-6">
          <p className="font-display text-xl font-extrabold lg:hidden">BrandPilot <span className="text-indigo-600">AI</span></p>
          <h1 className="grad-text text-3xl font-extrabold">{su ? 'Create your free demo account' : 'Welcome back'}</h1>
          <p className="text-sm text-slate-600">Demo only: your account is saved in this browser, not on a server.</p>
          {serverErr && <p role="alert" className="mt-3 rounded-lg border-2 border-red-700 bg-red-50 p-2 font-bold text-red-800">{serverErr}</p>}

          {su && <Field id="name" label="Full name" error={errs.name}><input {...a11y('name')} className={input} autoComplete="name" value={f.name} onChange={set('name')} /></Field>}
          <Field id="email" label={su ? 'Work email' : 'Email'} error={errs.email}><input {...a11y('email')} type="email" className={input} autoComplete="email" value={f.email} onChange={set('email')} /></Field>
          {su && <Field id="org" label="Organisation" error={errs.org}><input {...a11y('org')} className={input} autoComplete="organization" value={f.org} onChange={set('org')} /></Field>}
          <Field id="password" label="Password" error={errs.password}>
            <div className="relative">
              <input {...a11y('password')} type={show ? 'text' : 'password'} className={input} autoComplete={su ? 'new-password' : 'current-password'} value={f.password} onChange={set('password')} />
              <button type="button" onClick={() => setShow(!show)} aria-pressed={show} className="absolute right-1 top-2 min-h-[36px] px-2 font-bold text-indigo-700">{show ? 'Hide' : 'Show'}</button>
            </div>
            {su && f.password && <div className="mt-1"><div className="h-1.5 rounded bg-slate-200" aria-hidden="true"><div className={`h-full rounded transition-all ${COLOR[s]}`} style={{ width: `${s * 25}%` }} /></div>
              <p className="text-sm text-slate-600" aria-live="polite">Strength: {LABEL[s]}</p></div>}
          </Field>
          {su && <Field id="confirm" label="Confirm password" error={errs.confirm}><input {...a11y('confirm')} type={show ? 'text' : 'password'} className={input} autoComplete="new-password" value={f.confirm} onChange={set('confirm')} /></Field>}
          {su && <div className="mt-1"><label className="flex items-center gap-2"><input id="terms" type="checkbox" className="h-5 w-5" checked={f.terms} onChange={set('terms')} aria-describedby="terms-err" />I accept the demo terms</label>
            <p id="terms-err" role="alert" className="min-h-[1.25rem] text-sm text-red-700">{errs.terms}</p></div>}

          <button type="submit" disabled={busy} className="btn-primary mt-2 w-full">
            {busy ? 'Please wait…' : su ? 'Create account' : 'Sign in'}</button>
          <p className="mt-4 text-center">{su ? 'Already have an account? ' : 'New to BrandPilot? '}
            <button type="button" onClick={switchMode} className="font-bold text-indigo-700 underline">{su ? 'Sign in' : 'Create account'}</button></p>
        </form>
      </main>
    </div>)
}
