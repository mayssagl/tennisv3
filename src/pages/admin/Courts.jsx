import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import StatusBadge from '../../components/ui/StatusBadge'
import Icon from '../../components/Icon'

const BLANK = { name: '', type: 'clay', description: '', status: 'available' }

export default function Courts() {
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [editId, setEditId] = useState(null)

  async function load() {
    const { data } = await supabase.from('courts').select('*').order('created_at')
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.name.trim()) return toast.error('Le nom du court est requis')
    const payload = { ...form }
    const { error } = editId
      ? await supabase.from('courts').update(payload).eq('id', editId)
      : await supabase.from('courts').insert(payload)
    if (error) return toast.error(error.message)
    toast.success(editId ? 'Court mis à jour' : 'Court ajouté')
    setForm(BLANK); setEditId(null); load()
  }

  async function toggle(c) {
    const status = c.status === 'available' ? 'maintenance' : 'available'
    await supabase.from('courts').update({ status }).eq('id', c.id)
    setRows(rs => rs.map(r => r.id === c.id ? { ...r, status } : r))
  }

  async function remove(id) {
    if (!confirm('Supprimer ce court ?')) return
    const { error } = await supabase.from('courts').delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Court supprimé'); load()
  }

  function edit(c) { setEditId(c.id); setForm({ name: c.name, type: c.type, description: c.description ?? '', status: c.status }) }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Courts</h1><p>Gérez les courts et leur disponibilité.</p></div></div>

      <div className="panel">
        <h3>{editId ? 'Modifier le court' : 'Ajouter un court'}</h3>
        <div className="form-grid">
          <div className="field"><label>Nom</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option value="clay">Terre battue</option><option value="hard">Surface dure</option><option value="indoor">Couvert</option>
            </select></div>
        </div>
        <div className="field" style={{ marginTop: 16 }}><label>Description</label>
          <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-lime btn-sm" onClick={save}><Icon name={editId ? 'edit' : 'plus'} />{editId ? 'Enregistrer' : 'Ajouter'}</button>
          {editId && <button className="btn btn-dark btn-sm" onClick={() => { setEditId(null); setForm(BLANK) }}>Annuler</button>}
        </div>
      </div>

      <div className="panel" style={{ padding: 0 }}>
        {rows.length === 0
          ? <EmptyState icon="court" title="Aucun court" hint="Ajoutez votre premier court ci-dessus." />
          : (
          <table>
            <thead><tr><th>Nom</th><th>Type</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {rows.map(c => (
                <tr key={c.id}>
                  <td><div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{c.description}</div></td>
                  <td style={{ textTransform: 'capitalize' }}>{c.type}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td><div className="row-actions">
                    <button className="icon-btn" onClick={() => toggle(c)}>{c.status === 'available' ? 'Mettre en maintenance' : 'Rendre disponible'}</button>
                    <button className="icon-btn" onClick={() => edit(c)}><Icon name="edit" /></button>
                    <button className="icon-btn no" onClick={() => remove(c.id)}><Icon name="trash" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
