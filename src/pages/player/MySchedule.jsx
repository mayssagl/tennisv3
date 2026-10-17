import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'

export default function MySchedule() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)

  useEffect(() => {
    supabase.from('sessions')
      .select('id,date,time,notes,courts(name),coach:profiles!sessions_coach_id_fkey(full_name)')
      .eq('player_id', user.id).order('date')
      .then(({ data }) => setRows(data ?? []))
  }, [user.id])

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Mon planning</h1><p>Vos sessions de coaching à venir.</p></div></div>
      <div className="panel" style={{ padding: rows.length ? 0 : 24 }}>
        {rows.length === 0
          ? <EmptyState icon="calendar" title="Aucune session planifiée" hint="Votre coach planifiera vos sessions ici." />
          : (
          <table>
            <thead><tr><th>Date</th><th>Heure</th><th>Coach</th><th>Court</th><th>Notes</th></tr></thead>
            <tbody>{rows.map(s => (
              <tr key={s.id}><td>{s.date}</td><td>{s.time?.slice(0,5)}</td>
                <td>{s.coach?.full_name ?? '—'}</td><td>{s.courts?.name ?? '—'}</td>
                <td style={{ color: 'var(--muted)' }}>{s.notes}</td></tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </>
  )
}
