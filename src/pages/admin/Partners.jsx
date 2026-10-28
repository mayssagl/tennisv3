import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { levelLabel } from '../../lib/points'
import { formatDate } from '../../lib/booking'
import { fmtDateTime } from '../../lib/admin'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/Icon'

const FILTERS = [{ key: 'open', label: 'Ouvertes' }, { key: 'closed', label: 'Clôturées' }, { key: 'all', label: 'Toutes' }]
const SURF = { any: 'Indifférent', clay: 'Terre battue', hard: 'Surface dure' }

export default function AdminPartners() {
  const [rows, setRows] = useState(null)
  const [counts, setCounts] = useState({})
  const [filter, setFilter] = useState('open')

  async function load() {
    const [{ data, error }, { data: rs }] = await Promise.all([
      supabase.from('match_posts').select('*, author:profiles!match_posts_author_id_fkey(full_name,email,phone)').order('created_at', { ascending: false }),
      supabase.from('match_responses').select('post_id'),
    ])
    if (error) toast.error(error.message)
    const c = {}; (rs ?? []).forEach(r => { c[r.post_id] = (c[r.post_id] ?? 0) + 1 })
    setRows(data ?? []); setCounts(c)
  }
  useEffect(() => { load() }, [])

  const shown = useMemo(() => (rows ?? []).filter(p => filter === 'all' || p.status === filter), [rows, filter])

  async function setStatus(p, status) {
    const { error } = await supabase.from('match_posts').update({ status }).eq('id', p.id)
    if (error) return toast.error(error.message)
    setRows(rs => rs.map(r => r.id === p.id ? { ...r, status } : r))
  }
  async function remove(p) {
    if (!confirm(`Supprimer l'annonce de ${p.author?.full_name ?? 'ce membre'} ? Les réponses seront aussi supprimées.`)) return
    const { error } = await supabase.from('match_posts').delete().eq('id', p.id)
    if (error) return toast.error(error.message)
    toast.success('Annonce supprimée'); setRows(rs => rs.filter(r => r.id !== p.id))
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Partenaires</h1><p>Modérez les annonces de match publiées par les membres.</p></div></div>
      <div className="toolbar"><div className="tabs">
        {FILTERS.map(f => <button key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>{f.label}</button>)}
      </div></div>

      <div className="panel">
        {shown.length === 0 ? <EmptyState icon="partner" title="Aucune annonce" /> : shown.map(p => (
          <div key={p.id} className="list-row">
            <div style={{ minWidth: 0 }}>
              <div className="tag-row">
                <span className={`mini-tag${p.status === 'open' ? ' on' : ''}`}>{p.status === 'open' ? 'Ouverte' : 'Clôturée'}</span>
                <span className="mini-tag">{formatDate(p.play_date)}{p.play_time ? ` · ${p.play_time}` : ''}</span>
                <span className="mini-tag">{SURF[p.surface] ?? p.surface}</span>
                {p.level_pref && p.level_pref !== 'any' && <span className="mini-tag">{levelLabel(p.level_pref)}</span>}
                <span className="mini-tag">{counts[p.id] ?? 0} réponse(s)</span>
              </div>
              <h4>{p.author?.full_name ?? '—'}</h4>
              {p.note && <p>{p.note}</p>}
              <p className="sub-muted" style={{ marginTop: 4 }}>Publiée le {fmtDateTime(p.created_at)} · {p.author?.phone || p.author?.email}</p>
            </div>
            <div className="row-actions" style={{ flex: 'none' }}>
              {p.status === 'open'
                ? <button className="icon-btn" onClick={() => setStatus(p, 'closed')}><Icon name="lock" /> Clôturer</button>
                : <button className="icon-btn" onClick={() => setStatus(p, 'open')}>Rouvrir</button>}
              <button className="icon-btn no" onClick={() => remove(p)} title="Supprimer"><Icon name="trash" /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
