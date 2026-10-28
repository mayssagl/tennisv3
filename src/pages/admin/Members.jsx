import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LEVELS, levelLabel } from '../../lib/points'
import { bookingError, formatDate } from '../../lib/booking'
import { initials } from '../../lib/admin'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import Icon from '../../components/Icon'

const ROLE_TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'player', label: 'Joueurs' },
  { key: 'coach', label: 'Coachs' },
  { key: 'admin', label: 'Admins' },
]

export default function Members() {
  const [rows, setRows] = useState(null)
  const [role, setRole] = useState('all')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState(null)

  async function load() {
    const { data, error } = await supabase.from('profiles')
      .select('id,full_name,email,role,phone,level,avatar_url,created_at').order('full_name')
    if (error) toast.error(error.message)
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  const shown = useMemo(() => {
    let list = rows ?? []
    if (role !== 'all') list = list.filter(m => m.role === role)
    const s = q.trim().toLowerCase()
    if (s) list = list.filter(m => `${m.full_name} ${m.email} ${m.phone}`.toLowerCase().includes(s))
    return list
  }, [rows, role, q])

  if (!rows) return <Loader />
  const open = rows.find(m => m.id === openId)

  return (
    <>
      <div className="page-head"><div><h1>Membres</h1><p>{rows.length} membre(s) · rôles et coordonnées.</p></div></div>

      <div className="toolbar">
        <div className="tabs">
          {ROLE_TABS.map(t => (
            <button key={t.key} className={role === t.key ? 'on' : ''} onClick={() => setRole(t.key)}>
              {t.label} <span className="sub-muted" style={{ color: 'inherit', opacity: .7 }}>{t.key === 'all' ? rows.length : rows.filter(m => m.role === t.key).length}</span>
            </button>
          ))}
        </div>
        <label className="search"><Icon name="search" />
          <input placeholder="Nom, e-mail ou téléphone" value={q} onChange={e => setQ(e.target.value)} /></label>
      </div>

      <div className="panel" style={{ padding: shown.length ? 0 : 24 }}>
        {shown.length === 0 ? <EmptyState icon="users" title="Aucun membre trouvé" /> : (
          <table>
            <thead><tr><th>Membre</th><th>Téléphone</th><th>Niveau</th><th>Rôle</th><th>Inscrit le</th><th></th></tr></thead>
            <tbody>
              {shown.map(m => (
                <tr key={m.id}>
                  <td style={{ cursor: 'pointer' }} onClick={() => setOpenId(m.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <div className="avatar-sm">{m.avatar_url ? <img src={m.avatar_url} alt="" /> : <span>{initials(m.full_name)}</span>}</div>
                      <div><div className="cell-strong">{m.full_name ?? '—'}</div><div className="sub-muted">{m.email}</div></div>
                    </div>
                  </td>
                  <td>{m.phone || <span className="sub-muted">—</span>}</td>
                  <td>{levelLabel(m.level)}</td>
                  <td><StatusBadge status={m.role} /></td>
                  <td className="sub-muted">{new Date(m.created_at).toLocaleDateString('fr-FR')}</td>
                  <td><button className="icon-btn" onClick={() => setOpenId(m.id)}><Icon name="edit" /> Gérer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <MemberDrawer member={open}
          onClose={() => setOpenId(null)}
          onChanged={profile => setRows(rs => rs.map(r => r.id === open.id ? { ...r, ...profile } : r))} />
      )}
    </>
  )
}

function MemberDrawer({ member, onClose, onChanged }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ full_name: member.full_name ?? '', phone: member.phone ?? '', level: member.level ?? 'beginner', role: member.role })
  const [bookings, setBookings] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('bookings').select('id,date,start_time,status,courts(name)')
      .eq('player_id', member.id).order('date', { ascending: false }).limit(8)
      .then(({ data }) => setBookings(data ?? []))
  }, [member.id])
  useEffect(() => {
    const onKey = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function saveInfo() {
    if (!form.full_name.trim()) return toast.error('Le nom est requis')
    if (member.id === user.id && form.role !== 'admin' && !confirm("Vous allez retirer vos propres droits d'administrateur. Continuer ?")) return
    setBusy(true)
    const { error } = await supabase.from('profiles').update(form).eq('id', member.id)
    setBusy(false)
    if (error) return toast.error(bookingError(error))
    toast.success('Fiche membre mise à jour'); onChanged(form)
  }

  return (
    <>
      <div className="drawer-bg" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={`Fiche de ${member.full_name}`}>
        <div className="drawer-head">
          <div className="avatar-sm">{member.avatar_url ? <img src={member.avatar_url} alt="" /> : <span>{initials(member.full_name)}</span>}</div>
          <h3>{member.full_name ?? member.email}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><Icon name="x" /></button>
        </div>
        <div className="drawer-body">
          <section className="drawer-sec">
            <h4>Informations</h4>
            <div className="field"><label>Nom complet</label><input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="form-grid">
              <div className="field"><label>Téléphone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="field"><label>Niveau</label>
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                  {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                </select></div>
            </div>
            <div className="field" style={{ marginTop: 16 }}><label>Rôle</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="player">Joueur</option><option value="coach">Coach</option><option value="admin">Admin</option>
              </select></div>
            <p className="sub-muted">E-mail : {member.email} · inscrit le {new Date(member.created_at).toLocaleDateString('fr-FR')}</p>
            <div className="form-actions"><button className="btn btn-lime btn-sm" disabled={busy} onClick={saveInfo}><Icon name="check" /> Enregistrer la fiche</button></div>
          </section>

          <section className="drawer-sec">
            <h4>Dernières réservations</h4>
            {!bookings ? <Loader /> : bookings.length === 0 ? <p className="sub-muted">Aucune réservation.</p> : bookings.map(b => (
              <div key={b.id} className="tx">
                <span>{b.courts?.name ?? '—'}<br /><span className="sub-muted">{formatDate(b.date)} · {b.start_time?.slice(0, 5)}</span></span>
                <StatusBadge status={b.status} />
              </div>
            ))}
          </section>
        </div>
      </aside>
    </>
  )
}
