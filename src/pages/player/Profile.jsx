import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LEVELS } from '../../lib/points'
import Icon from '../../components/Icon'

export default function Profile() {
  const { profile, user, refreshProfile } = useAuth()
  const fileRef = useRef()
  const [form, setForm] = useState({
    full_name: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    bio: profile?.bio ?? '',
    level: profile?.level ?? 'beginner',
  })
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? '')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)

  const initials = (form.full_name || profile?.email || '?')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  async function onPick(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Choisissez une image')
    if (file.size > 3 * 1024 * 1024) return toast.error('Image trop lourde (max 3 Mo)')
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars')
      .upload(path, file, { upsert: true })
    if (error) { setUploading(false); return toast.error("Échec de l'envoi de l'image") }
    const url = supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    setAvatar(url); setUploading(false); refreshProfile()
    toast.success('Photo mise à jour')
  }

  async function save() {
    if (!form.full_name.trim()) return toast.error('Le nom est requis')
    setBusy(true)
    const { error } = await supabase.from('profiles').update(form).eq('id', user.id)
    setBusy(false)
    if (error) return toast.error(error.message)
    toast.success('Profil mis à jour'); refreshProfile()
  }

  return (
    <>
      <div className="page-head"><div><h1>Mon profil</h1><p>Personnalisez votre présence au club.</p></div></div>

      <div className="panel" style={{ maxWidth: 620 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 26 }}>
          <div className="avatar-lg">
            {avatar ? <img src={avatar} alt="" /> : <span>{initials}</span>}
          </div>
          <div>
            <button className="btn btn-dark btn-sm" disabled={uploading} onClick={() => fileRef.current.click()}>
              <Icon name="upload" />{uploading ? 'Envoi…' : 'Changer la photo'}
            </button>
            <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 8 }}>JPG ou PNG, max 3 Mo.</p>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPick} />
          </div>
        </div>

        <div className="form-grid">
          <div className="field"><label>Nom complet</label>
            <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
          <div className="field"><label>Niveau</label>
            <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
              {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
            </select></div>
        </div>

        <div className="form-grid" style={{ marginTop: 16 }}>
          <div className="field"><label>E-mail</label>
            <input value={profile?.email ?? ''} disabled style={{ background: 'var(--paper)' }} /></div>
          <div className="field"><label>Téléphone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        </div>

        <div className="field" style={{ marginTop: 16 }}><label>Bio</label>
          <textarea rows={3} placeholder="Quelques mots sur votre jeu, vos disponibilités, votre main forte…"
            value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} /></div>

        <button className="btn btn-lime btn-sm" style={{ marginTop: 18 }} disabled={busy} onClick={save}>
          <Icon name="check" />{busy ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </>
  )
}
