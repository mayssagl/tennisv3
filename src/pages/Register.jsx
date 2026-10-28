import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '../lib/supabaseClient'
import Logo from '../components/Logo'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  function validate() {
    if (!form.full_name.trim()) return 'Indiquez votre nom complet.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Adresse e-mail invalide.'
    if (form.password.length < 6) return 'Le mot de passe doit faire au moins 6 caractères.'
    if (form.password !== form.confirm) return 'Les mots de passe ne correspondent pas.'
    return ''
  }

  async function submit() {
    const v = validate(); if (v) { setErr(v); return }
    setErr(''); setBusy(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.full_name } },  // read by the DB trigger
      })
      if (error) { setErr(error.message); return }
      toast.success('Compte créé ! Vous pouvez vous connecter.')
      nav('/login')
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
          <h2>Rejoignez le <em>club</em>.</h2>
          <p>Créez votre compte joueur en quelques secondes et réservez votre premier
             créneau sur la terre battue de Msaken.</p>
        </div>
        <span className="auth-tag">
          M'SAKEN · DEPUIS 2009
        </span>
      </aside>

      <main className="auth-form">
        <div className="auth-card">
          <h1>Inscription</h1>
          <p className="sub">Devenez membre du M'Saken Tennis Club.</p>

          <div className="field">
            <label>Nom complet</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
          </div>
          <div className="field">
            <label>Adresse e-mail</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Mot de passe</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Confirmer</label>
              <input type="password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
            </div>
          </div>
          {err && <div className="field"><div className="err">{err}</div></div>}

          <button className="btn btn-lime" onClick={submit} disabled={busy}>
            {busy ? 'Création…' : 'Créer mon compte'}
          </button>

          <p className="auth-alt">Déjà membre ? <Link to="/login">Se connecter</Link></p>
        </div>
      </main>
    </div>
  )
}
