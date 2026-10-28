import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { needsMigration } from '../../lib/admin'
import { loadSiteContent } from '../../lib/siteContent'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import MigrationNotice from '../../components/ui/MigrationNotice'
import Icon from '../../components/Icon'

const BLANK = { title: '', body: '', pinned: false, is_public: false }

export default function Announcements() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [editId, setEditId] = useState(null)
  const [migrate, setMigrate] = useState(false)
  const [busy, setBusy] = useState(false)

  async function load() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    const list = data ?? []
    // Before migration_v4 the pinned / is_public columns don't exist yet.
    setMigrate(list.length > 0 && !('pinned' in list[0]))
    setRows([...list].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)))
  }
  useEffect(() => { load() }, [])

  const afterChange = () => { loadSiteContent({ fresh: true }); load() }

  async function save() {
    if (!form.title.trim()) return toast.error('Le titre est requis')
    setBusy(true)
    const payload = { title: form.title.trim(), body: form.body.trim(), pinned: form.pinned, is_public: form.is_public }
    const { error } = editId
      ? await supabase.from('announcements').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editId)
      : await supabase.from('announcements').insert({ ...payload, created_by: user.id })
    setBusy(false)
    if (error) { if (needsMigration(error)) setMigrate(true); return toast.error(needsMigration(error) ? 'Exécutez migration_v4.sql dans Supabase (voir ci-dessus).' : error.message) }
    toast.success(editId ? 'Annonce modifiée' : 'Annonce publiée')
    setForm(BLANK); setEditId(null); afterChange()
  }

  async function patch(a, values) {
    const { error } = await supabase.from('announcements').update(values).eq('id', a.id)
    if (error) return toast.error(needsMigration(error) ? 'Exécutez migration_v4.sql dans Supabase.' : error.message)
    afterChange()
  }

  async function remove(a) {
    if (!confirm(`Supprimer l'annonce « ${a.title} » ?`)) return
    await supabase.from('announcements').delete().eq('id', a.id); afterChange()
  }

  function edit(a) {
    setEditId(a.id); setForm({ title: a.title, body: a.body ?? '', pinned: !!a.pinned, is_public: !!a.is_public })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="page-head"><div><h1>Annonces</h1><p>Communiquez avec les membres, et affichez une annonce sur le site public.</p></div></div>
      {migrate && <MigrationNotice />}

      <div className="panel">
        <h3>{editId ? "Modifier l'annonce" : 'Nouvelle annonce'}</h3>
        <div className="field"><label>Titre</label>
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ex. Tournoi interne — inscriptions ouvertes" /></div>
        <div className="field"><label>Message</label>
          <textarea rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <label className="check"><input type="checkbox" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} />
            Épingler en haut</label>
          <label className="check"><input type="checkbox" checked={form.is_public} onChange={e => setForm({ ...form, is_public: e.target.checked })} />
            Afficher aussi sur la page d'accueil du site (visible par tous)</label>
        </div>
        <div className="form-actions">
          <button className="btn btn-lime btn-sm" disabled={busy} onClick={save}><Icon name={editId ? 'check' : 'bell'} />{editId ? 'Enregistrer' : 'Publier'}</button>
          {editId && <button className="btn btn-dark btn-sm" onClick={() => { setEditId(null); setForm(BLANK) }}>Annuler</button>}
        </div>
      </div>

      <div className="panel">
        <h3>Annonces publiées</h3>
        {rows.length === 0 ? <EmptyState icon="bell" title="Aucune annonce" /> : rows.map(a => (
          <div key={a.id} className="list-row">
            <div style={{ minWidth: 0 }}>
              <div className="tag-row">
                {a.pinned && <span className="mini-tag on">Épinglée</span>}
                {a.is_public && <span className="mini-tag dark">Sur le site</span>}
                <span className="mini-tag">{new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
              <h4>{a.title}</h4>
              {a.body && <p style={{ whiteSpace: 'pre-wrap' }}>{a.body}</p>}
            </div>
            <div className="row-actions" style={{ flex: 'none' }}>
              <button className="icon-btn" title={a.pinned ? 'Désépingler' : 'Épingler'} onClick={() => patch(a, { pinned: !a.pinned })}><Icon name="pin" /></button>
              <button className="icon-btn" title={a.is_public ? 'Retirer du site' : 'Afficher sur le site'} onClick={() => patch(a, { is_public: !a.is_public })}><Icon name="globe" /></button>
              <button className="icon-btn" title="Modifier" onClick={() => edit(a)}><Icon name="edit" /></button>
              <button className="icon-btn no" title="Supprimer" onClick={() => remove(a)}><Icon name="trash" /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
