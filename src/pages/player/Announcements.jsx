import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'

export default function PlayerAnnouncements() {
  const [rows, setRows] = useState(null)
  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setRows([...(data ?? [])].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))))
  }, [])
  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Annonces</h1><p>Les actualités du club.</p></div></div>
      {rows.length === 0
        ? <div className="panel"><EmptyState icon="bell" title="Aucune annonce" hint="Les actualités du club apparaîtront ici." /></div>
        : rows.map(a => (
          <div key={a.id} className="panel">
            {a.pinned && <span className="pinned-mark">Épinglée</span>}
            <h3 style={{ marginBottom: 6 }}>{a.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 15, whiteSpace: 'pre-wrap' }}>{a.body}</p>
            <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 12 }}>
              {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        ))}
    </>
  )
}
