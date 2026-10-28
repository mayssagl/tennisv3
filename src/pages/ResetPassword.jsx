import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import Icon from '../components/Icon'

// Handles BOTH the email recovery link and a logged-in user changing their password.
export default function ResetPassword() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [ready, setReady] = useState(false)   // a session exists (recovery or normal)
  const [checking, setChecking] = useState(true)
  const [pw, setPw] = useState({ a: '', b: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // Supabase puts the reason in the link when it's expired or already used,
  // e.g. #error=access_denied&error_code=otp_expired&error_description=...
  const linkError = (() => {
    const p = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
    const code = p.get('error_code'), desc = p.get('error_description')
    if (!code && !desc) return ''
    if (code === 'otp_expired') return 'Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau (il est valable une heure et ne fonctionne qu\'une fois).'
    return desc?.replace(/\+/g, ' ') || 'Lien invalide.'
  })()

  useEffect(() => {
    // recovery link establishes a temporary session; or the user is already logged in
    supabase.auth.getSession().then(({ data }) => { setReady(!!data.session); setChecking(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function submit() {
    if (pw.a.length < 6) { setErr('6 caractères minimum.'); return }
    if (pw.a !== pw.b) { setErr('Les mots de passe ne correspondent pas.'); return }
    setErr(''); setBusy(true)
    const { error } = await supabase.auth.updateUser({ password: pw.a })
    setBusy(false)
    if (error) { setErr(error.message); return }
    toast.success('Mot de passe mis à jour')
    nav(user ? '/player/profile' : '/login', { replace: true })
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo size={54} />
        <div>
          <h2>Nouveau <em>mot de passe</em>.</h2>
          <p>Choisissez un mot de passe solide pour sécuriser votre compte membre.</p>
        </div>
      </aside>

      <main className="auth-form">
        <div className="auth-card">
          <h1>Définir le mot de passe</h1>
          {checking && !ready ? (
            <p className="sub">Vérification du lien…</p>
          ) : !ready ? (
            <>
              <p className="sub">{linkError || 'Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.'}</p>
              <Link to="/forgot-password" className="btn btn-lime" style={{ width: '100%', justifyContent: 'center' }}>Demander un lien</Link>
            </>
          ) : (
            <>
              <p className="sub">Saisissez votre nouveau mot de passe.</p>
              <div className="field"><label>Nouveau mot de passe</label>
                <input type="password" value={pw.a} onChange={e => setPw({ ...pw, a: e.target.value })} placeholder="••••••••" /></div>
              <div className="field"><label>Confirmer</label>
                <input type="password" value={pw.b} onChange={e => setPw({ ...pw, b: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && submit()} placeholder="••••••••" />
                {err && <div className="err show">{err}</div>}</div>
              <button className="btn btn-lime" style={{ width: '100%', justifyContent: 'center' }} disabled={busy} onClick={submit}>
                <Icon name="lock" />{busy ? 'Enregistrement…' : 'Mettre à jour'}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
