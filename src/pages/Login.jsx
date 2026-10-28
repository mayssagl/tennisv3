import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Login() {
  const nav = useNavigate()
  const { user, role } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // already logged in -> bounce to dashboard
  useEffect(() => { if (user && role) nav(`/${role}`, { replace: true }) }, [user, role, nav])

  async function submit() {
    setErr('')
    if (!form.email || !form.password) { setErr('Veuillez remplir tous les champs.'); return }
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithPassword(form)
      if (error) { setErr('Identifiants invalides. Réessayez.'); return }
      toast.success('Connexion réussie')
      // role-based redirect happens via the effect once profile loads
    } catch (e) {
      setErr('Erreur réseau. Vérifiez votre connexion et réessayez.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo size={54} />
        <div>
          <h2>Bon retour sur le <em>court</em>.</h2>
          <p>Connectez-vous pour réserver vos créneaux, suivre vos sessions et rester
             au cœur de la vie du club.</p>
        </div>
        <span className="auth-tag">
          M'SAKEN · DEPUIS 2009
        </span>
      </aside>

      <main className="auth-form">
        <div className="auth-card">
          <h1>Connexion</h1>
          <p className="sub">Accédez à votre espace membre.</p>

          <div className="field">
            <label>Adresse e-mail</label>
            <input type="email" value={form.email} autoComplete="email"
              onChange={e => setForm({ ...form, email: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input type="password" value={form.password} autoComplete="current-password"
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          {err && <div className="field"><div className="err">{err}</div></div>}

          <div style={{ textAlign: 'right', margin: '-6px 0 16px' }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--lime-deep)', fontWeight: 600 }}>Mot de passe oublié ?</Link>
          </div>
          <button className="btn btn-lime" onClick={submit} disabled={busy}>
            {busy ? 'Connexion…' : 'Se connecter'}
          </button>

          <p className="auth-alt">Pas encore membre ? <Link to="/register">Créer un compte</Link></p>
        </div>
      </main>
    </div>
  )
}
