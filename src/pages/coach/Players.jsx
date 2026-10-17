import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'

export default function CoachPlayers() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)

  useEffect(() => {
    // distinct players this coach has sessions with, plus their latest note
    supabase.from('sessions')
      .select('notes,date,player:profiles!sessions_player_id_fkey(id,full_name,email,phone)')
      .eq('coach_id', user.id).order('date', { ascending: false })
      .then(({ data }) => {
        const map = new Map()
        ;(data ?? []).forEach(s => {
          if (s.player && !map.has(s.player.id)) map.set(s.player.id, { ...s.player, lastNote: s.notes, lastDate: s.date })
        })
        setRows([...map.values()])
      })
  }, [user.id])

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Mes joueurs</h1><p>Les joueurs que vous encadrez.</p></div></div>
      <div className="panel" style={{ padding: rows.length ? 0 : 24 }}>
        {rows.length === 0
          ? <EmptyState icon="users" title="Aucun joueur assigné" hint="Planifiez une session pour voir le joueur ici." />
          : (
          <table>
            <thead><tr><th>Joueur</th><th>Contact</th><th>Dernière session</th><th>Note</th></tr></thead>
            <tbody>{rows.map(p => (
              <tr key={p.id}><td style={{ fontWeight: 600 }}>{p.full_name}</td>
                <td><div>{p.email}</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{p.phone}</div></td>
                <td>{p.lastDate}</td><td style={{ color: 'var(--muted)' }}>{p.lastNote ?? '—'}</td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  )
}
