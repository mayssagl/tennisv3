import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { levelLabel } from '../../lib/points'
import Loader from '../../components/ui/Loader'
import StatusBadge from '../../components/ui/StatusBadge'
import Icon from '../../components/Icon'

export default function Members() {
  const { profile } = useAuth()
  const [rows, setRows] = useState(null)

  async function load() {
    const { data: profiles } = await supabase.from('profiles')
      .select('id,full_name,email,role,phone,level,created_at')
      .order('created_at', { ascending: false })
    setRows(profiles ?? [])
  }
  useEffect(() => { load() }, [])

  async function changeRole(id, role) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) return toast.error('Échec — vérifiez vos droits admin.')
    toast.success('Rôle mis à jour')
    setRows(rs => rs.map(r => r.id === id ? { ...r, role } : r))
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Membres</h1><p>{rows.length} membre(s) · rôles et points.</p></div></div>
      <div className="panel" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Nom</th><th>Niveau</th><th>Rôle</th><th>Changer rôle</th></tr></thead>
          <tbody>
            {rows.map(m => (
              <tr key={m.id}>
                <td><div style={{ fontWeight: 600 }}>{m.full_name ?? '—'}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{m.email}</div></td>
                <td>{levelLabel(m.level)}</td>
                <td><StatusBadge status={m.role} /></td>
                <td>
                  <select value={m.role} onChange={e => changeRole(m.id, e.target.value)}
                    style={{ padding: '7px 10px', borderRadius: 8, border: '1px solid var(--line)' }}>
                    <option value="player">Joueur</option><option value="coach">Coach</option><option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
