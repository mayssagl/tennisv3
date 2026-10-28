import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Logo from '../components/Logo'
import Icon from '../components/Icon'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  async function submit() {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setErr('Adresse e-mail invalide.'); return }
    setErr(''); setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    // Always show success — don't reveal whether an account exists.
    if (error && !/rate/i.test(error.message)) { setErr(error.message); return }
    setSent(true)
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo size={54} />
        <div>
          <h2>Mot de passe <em>oublié</em> ?</h2>
          <p>Pas de souci. Indiquez votre e-mail et nous vous enverrons un lien
             pour réinitialiser votre mot de passe.</p>
        </div>
        <span className="auth-tag">M'SAKEN · DEPUIS 2009</span>
      </aside>

      <main className="auth-form">
        <div className="auth-card">
          {sent ? (
            <>
              <h1>E-mail envoyé</h1>
              <p className="sub">Si un compte existe pour <strong>{email}</strong>, vous recevrez
                un lien de réinitialisation. Pensez à vérifier vos spams.</p>
              <Link to="/login" className="btn btn-lime" style={{ width: '100%', justifyContent: 'center' }}>Retour à la connexion</Link>
            </>
          ) : (
            <>
              <h1>Réinitialiser</h1>
              <p className="sub">Recevez un lien de réinitialisation par e-mail.</p>
              <div className="field">
                <label>Adresse e-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submit()} placeholder="vous@exemple.com" />
                {err && <div className="err show">{err}</div>}
              </div>
              <button className="btn btn-lime" style={{ width: '100%', justifyContent: 'center' }} disabled={busy} onClick={submit}>
                <Icon name="mail" />{busy ? 'Envoi…' : 'Envoyer le lien'}
              </button>
              <p className="auth-alt"><Link to="/login">Retour à la connexion</Link></p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
