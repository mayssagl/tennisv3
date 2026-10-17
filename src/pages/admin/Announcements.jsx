import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/Icon'

export default function Announcements() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState({ title: '', body: '' })

  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function post() {
    if (!form.title.trim()) return toast.error('Le titre est requis')
    const { error } = await supabase.from('announcements').insert({ ...form, created_by: user.id })
    if (error) return toast.error(error.message)
    toast.success('Annonce publiée'); setForm({ title: '', body: '' }); load()
  }

  async function remove(id) {
    await supabase.from('announcements').delete().eq('id', id); load()
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Annonces</h1><p>Communiquez avec tous les membres.</p></div></div>
      <div className="panel">
        <h3>Nouvelle annonce</h3>
        <div className="field"><label>Titre</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="field" style={{ marginTop: 14 }}><label>Message</label>
          <textarea rows={3} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
        <button className="btn btn-lime btn-sm" style={{ marginTop: 14 }} onClick={post}><Icon name="bell" /> Publier</button>
      </div>
      {rows.length === 0
        ? <div className="panel"><EmptyState icon="bell" title="Aucune annonce" /></div>
        : rows.map(a => (
          <div key={a.id} className="panel" style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h3 style={{ marginBottom: 6 }}>{a.title}</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14.5 }}>{a.body}</p>
              <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 8 }}>{new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
            </div>
            <button className="icon-btn no" style={{ alignSelf: 'flex-start' }} onClick={() => remove(a.id)}><Icon name="trash" /></button>
          </div>
        ))}
    </>
  )
}
