import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { needsMigration, reorder } from '../../lib/admin'
import { loadSiteContent } from '../../lib/siteContent'
import { SETTING_FIELDS, DEFAULT_SETTINGS } from '../../lib/club'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import MigrationNotice from '../../components/ui/MigrationNotice'
import Icon from '../../components/Icon'

const TABS = [
  { key: 'events', label: 'Événements', icon: 'trophy' },
  { key: 'staff', label: 'Staff technique', icon: 'users' },
  { key: 'contact', label: 'Contact', icon: 'phone' },
]

const refreshSite = () => loadSiteContent({ fresh: true })

export default function Site() {
  const [tab, setTab] = useState('events')
  const [migrate, setMigrate] = useState(false)
  return (
    <>
      <div className="page-head">
        <div><h1>Site web</h1><p>Modifiez le contenu de la page d'accueil publique.</p></div>
        <a className="btn btn-dark btn-sm" href="/" target="_blank" rel="noreferrer"><Icon name="eye" /> Voir le site</a>
      </div>
      {migrate && <MigrationNotice />}
      <div className="tabs">
        {TABS.map(t => <button key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}><Icon name={t.icon} /> {t.label}</button>)}
      </div>
      {tab === 'events' && <Events onMissing={() => setMigrate(true)} />}
      {tab === 'staff' && <Staff onMissing={() => setMigrate(true)} />}
      {tab === 'contact' && <Contact onMissing={() => setMigrate(true)} />}
    </>
  )
}

/* ------------------------------ EVENTS ------------------------------ */
const EVENT_BLANK = { title: '', kind: '', when_label: '', body: '', details: '', link_label: '', featured: false, visible: true, image_url: '' }

function Events({ onMissing }) {
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState(EVENT_BLANK)
  const [editId, setEditId] = useState(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef()

  async function load() {
    const { data, error } = await supabase.from('site_events').select('*').order('sort_order').order('created_at')
    if (error) { if (needsMigration(error)) onMissing(); else toast.error(error.message); return setRows([]) }
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.title.trim()) return toast.error('Le titre est requis')
    setBusy(true)
    const payload = { ...form, title: form.title.trim() }
    if (!payload.featured) payload.details = form.details || null
    const res = editId
      ? await supabase.from('site_events').update(payload).eq('id', editId).select('id').single()
      : await supabase.from('site_events').insert({ ...payload, sort_order: rows.length }).select('id').single()
    // Only one event can be the large "à la une" card.
    if (!res.error && payload.featured) await supabase.from('site_events').update({ featured: false }).neq('id', res.data.id)
    setBusy(false)
    if (res.error) return toast.error(needsMigration(res.error) ? 'Exécutez migration_v4.sql dans Supabase.' : res.error.message)
    toast.success(editId ? 'Événement modifié' : 'Événement ajouté')
    setForm(EVENT_BLANK); setEditId(null); refreshSite(); load()
  }

  async function upload(e) {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Choisissez une image')
    if (file.size > 4 * 1024 * 1024) return toast.error('Image trop lourde (max 4 Mo)')
    setBusy(true)
    const path = `events/${Date.now()}.${file.name.split('.').pop()}`
    const { error } = await supabase.storage.from('site').upload(path, file)
    setBusy(false)
    if (error) return toast.error(needsMigration(error) || /bucket/i.test(error.message) ? 'Exécutez migration_v4.sql dans Supabase.' : error.message)
    setForm(f => ({ ...f, image_url: supabase.storage.from('site').getPublicUrl(path).data.publicUrl }))
    toast.success('Image envoyée — pensez à enregistrer')
  }

  async function move(i, dir) {
    const { rows: next, changed } = reorder(rows, i, dir)
    setRows(next)
    await Promise.all(changed.map(c => supabase.from('site_events').update({ sort_order: c.sort_order }).eq('id', c.id)))
    refreshSite()
  }
  async function patch(ev, values) {
    if (values.featured) await supabase.from('site_events').update({ featured: false }).neq('id', ev.id)
    const { error } = await supabase.from('site_events').update(values).eq('id', ev.id)
    if (error) return toast.error(error.message)
    refreshSite(); load()
  }
  async function remove(ev) {
    if (!confirm(`Supprimer « ${ev.title} » ?`)) return
    await supabase.from('site_events').delete().eq('id', ev.id); refreshSite(); load()
  }
  function edit(ev) {
    setEditId(ev.id)
    setForm({ ...EVENT_BLANK, ...Object.fromEntries(Object.keys(EVENT_BLANK).map(k => [k, ev[k] ?? EVENT_BLANK[k]])) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!rows) return <Loader />

  return (
    <>
      <div className="panel">
        <h3>{editId ? "Modifier l'événement" : 'Ajouter un événement'}</h3>
        <div className="form-grid-3">
          <div className="field"><label>Titre</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ex. Open Msaken 2026" /></div>
          <div className="field"><label>Catégorie</label><input value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} placeholder="ex. Tournoi international" /></div>
          <div className="field"><label>Date affichée</label><input value={form.when_label} onChange={e => setForm({ ...form, when_label: e.target.value })} placeholder="ex. Mars 2026" /></div>
        </div>
        <div className="field" style={{ marginTop: 16 }}><label>Description</label>
          <textarea rows={3} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} /></div>
        <div className="form-grid">
          <div className="field"><label>Texte du bouton</label><input value={form.link_label} onChange={e => setForm({ ...form, link_label: e.target.value })} placeholder="ex. S'inscrire" /></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
            <label className="check"><input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />À la une (grande carte, un seul à la fois)</label>
            <label className="check"><input type="checkbox" checked={form.visible} onChange={e => setForm({ ...form, visible: e.target.checked })} />Visible sur le site</label>
          </div>
        </div>
        {form.featured && (
          <div className="form-grid" style={{ marginTop: 16 }}>
            <div className="field"><label>Détails (un par ligne, « Libellé: Valeur »)</label>
              <textarea rows={3} value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder={'Circuit: ITF World Tennis Tour\nCatégorie: Juniors'} /></div>
            <div className="field"><label>Image de fond</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {form.image_url && <img className="thumb" src={form.image_url} alt="" />}
                <button className="btn btn-dark btn-sm" type="button" disabled={busy} onClick={() => fileRef.current.click()}><Icon name="upload" />{form.image_url ? 'Changer' : 'Choisir une image'}</button>
                {form.image_url && <button className="icon-btn no" type="button" onClick={() => setForm({ ...form, image_url: '' })}><Icon name="x" /></button>}
              </div>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={upload} />
            </div>
          </div>
        )}
        <div className="form-actions">
          <button className="btn btn-lime btn-sm" disabled={busy} onClick={save}><Icon name={editId ? 'check' : 'plus'} />{editId ? 'Enregistrer' : 'Ajouter'}</button>
          {editId && <button className="btn btn-dark btn-sm" onClick={() => { setEditId(null); setForm(EVENT_BLANK) }}>Annuler</button>}
        </div>
      </div>

      <div className="panel">
        <h3>Événements ({rows.length})</h3>
        <p className="sub-muted" style={{ marginTop: -10, marginBottom: 8 }}>La page d'accueil affiche l'événement « à la une » et les 3 suivants dans cet ordre.</p>
        {rows.length === 0 ? <EmptyState icon="trophy" title="Aucun événement" hint="Tant que la liste est vide, le site affiche les événements par défaut." /> : rows.map((ev, i) => (
          <div key={ev.id} className={`list-row${ev.visible ? '' : ' is-hidden-row'}`}>
            <div style={{ display: 'flex', gap: 14, minWidth: 0 }}>
              {ev.image_url && <img className="thumb" src={ev.image_url} alt="" />}
              <div style={{ minWidth: 0 }}>
                <div className="tag-row">
                  {ev.featured && <span className="mini-tag on">À la une</span>}
                  {!ev.visible && <span className="mini-tag">Masqué</span>}
                  {ev.kind && <span className="mini-tag">{ev.kind}</span>}
                  {ev.when_label && <span className="mini-tag">{ev.when_label}</span>}
                </div>
                <h4>{ev.title}</h4>
                {ev.body && <p>{ev.body}</p>}
              </div>
            </div>
            <div className="row-actions" style={{ flex: 'none' }}>
              <button className="icon-btn" disabled={i === 0} onClick={() => move(i, -1)} title="Monter"><Icon name="up" /></button>
              <button className="icon-btn" disabled={i === rows.length - 1} onClick={() => move(i, 1)} title="Descendre"><Icon name="down" /></button>
              {!ev.featured && <button className="icon-btn" onClick={() => patch(ev, { featured: true })} title="Mettre à la une"><Icon name="star" /></button>}
              <button className="icon-btn" onClick={() => patch(ev, { visible: !ev.visible })} title={ev.visible ? 'Masquer' : 'Afficher'}><Icon name="eye" /></button>
              <button className="icon-btn" onClick={() => edit(ev)} title="Modifier"><Icon name="edit" /></button>
              <button className="icon-btn no" onClick={() => remove(ev)} title="Supprimer"><Icon name="trash" /></button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

/* ------------------------------ STAFF ------------------------------ */
const STAFF_BLANK = { name: '', role: 'Entraîneur', extra: '', is_lead: false }

function Staff({ onMissing }) {
  const [rows, setRows] = useState(null)
  const [form, setForm] = useState(STAFF_BLANK)
  const [editId, setEditId] = useState(null)

  async function load() {
    const { data, error } = await supabase.from('staff_members').select('*').order('sort_order').order('created_at')
    if (error) { if (needsMigration(error)) onMissing(); else toast.error(error.message); return setRows([]) }
    setRows(data ?? [])
  }
  useEffect(() => { load() }, [])

  async function save() {
    if (!form.name.trim()) return toast.error('Le nom est requis')
    const payload = { ...form, name: form.name.trim(), extra: form.extra.trim() || null }
    const { error } = editId
      ? await supabase.from('staff_members').update(payload).eq('id', editId)
      : await supabase.from('staff_members').insert({ ...payload, sort_order: rows.length })
    if (error) return toast.error(needsMigration(error) ? 'Exécutez migration_v4.sql dans Supabase.' : error.message)
    toast.success(editId ? 'Membre du staff modifié' : 'Membre du staff ajouté')
    setForm(STAFF_BLANK); setEditId(null); refreshSite(); load()
  }
  async function move(list, i, dir) {
    const { changed } = reorder(list, i, dir)
    await Promise.all(changed.map(c => supabase.from('staff_members').update({ sort_order: c.sort_order + (list[0]?.is_lead ? 0 : 100) }).eq('id', c.id)))
    refreshSite(); load()
  }
  async function remove(s) {
    if (!confirm(`Retirer ${s.name} du staff ?`)) return
    await supabase.from('staff_members').delete().eq('id', s.id); refreshSite(); load()
  }

  if (!rows) return <Loader />
  const groups = [
    { title: 'Direction & responsables', list: rows.filter(s => s.is_lead) },
    { title: 'Entraîneurs', list: rows.filter(s => !s.is_lead) },
  ]

  return (
    <>
      <div className="panel">
        <h3>{editId ? 'Modifier' : 'Ajouter au staff'}</h3>
        <div className="form-grid-3">
          <div className="field"><label>Nom</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="field"><label>Fonction</label><input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="ex. Directeur technique" /></div>
          <div className="field"><label>Deuxième fonction (optionnel)</label><input value={form.extra} onChange={e => setForm({ ...form, extra: e.target.value })} placeholder="ex. Préparateur physique" /></div>
        </div>
        <label className="check" style={{ marginTop: 14 }}><input type="checkbox" checked={form.is_lead} onChange={e => setForm({ ...form, is_lead: e.target.checked })} />
          Direction / responsable (affiché en haut avec sa fonction)</label>
        <div className="form-actions">
          <button className="btn btn-lime btn-sm" onClick={save}><Icon name={editId ? 'check' : 'plus'} />{editId ? 'Enregistrer' : 'Ajouter'}</button>
          {editId && <button className="btn btn-dark btn-sm" onClick={() => { setEditId(null); setForm(STAFF_BLANK) }}>Annuler</button>}
        </div>
      </div>

      {rows.length === 0 && <div className="panel"><EmptyState icon="users" title="Aucun membre du staff" hint="Tant que la liste est vide, le site affiche le staff par défaut." /></div>}
      {groups.map(g => g.list.length > 0 && (
        <div key={g.title} className="panel">
          <h3>{g.title} ({g.list.length})</h3>
          {g.list.map((s, i) => (
            <div key={s.id} className="list-row" style={{ alignItems: 'center' }}>
              <div><h4 style={{ marginBottom: 0 }}>{s.name}</h4><p>{s.role}{s.extra && ` · ${s.extra}`}</p></div>
              <div className="row-actions">
                <button className="icon-btn" disabled={i === 0} onClick={() => move(g.list, i, -1)} title="Monter"><Icon name="up" /></button>
                <button className="icon-btn" disabled={i === g.list.length - 1} onClick={() => move(g.list, i, 1)} title="Descendre"><Icon name="down" /></button>
                <button className="icon-btn" onClick={() => { setEditId(s.id); setForm({ name: s.name, role: s.role ?? '', extra: s.extra ?? '', is_lead: s.is_lead }); window.scrollTo({ top: 0, behavior: 'smooth' }) }} title="Modifier"><Icon name="edit" /></button>
                <button className="icon-btn no" onClick={() => remove(s)} title="Retirer"><Icon name="trash" /></button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </>
  )
}

/* ------------------------------ CONTACT ------------------------------ */
function Contact({ onMissing }) {
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    supabase.from('site_settings').select('key,value').then(({ data, error }) => {
      if (error && needsMigration(error)) onMissing()
      const s = { ...DEFAULT_SETTINGS }
      ;(data ?? []).forEach(r => { s[r.key] = r.value ?? '' })
      setForm(s)
    })
  }, [])

  async function save() {
    setBusy(true)
    const rows = SETTING_FIELDS.map(f => ({ key: f.key, value: (form[f.key] ?? '').trim(), updated_at: new Date().toISOString() }))
    const { error } = await supabase.from('site_settings').upsert(rows)
    setBusy(false)
    if (error) return toast.error(needsMigration(error) ? 'Exécutez migration_v4.sql dans Supabase.' : error.message)
    toast.success('Coordonnées mises à jour sur le site'); refreshSite()
  }

  if (!form) return <Loader />
  return (
    <div className="panel">
      <h3>Coordonnées du club</h3>
      <p className="sub-muted" style={{ marginTop: -10, marginBottom: 18 }}>Utilisées dans la section Contact, le pied de page et le bouton WhatsApp du site.</p>
      <div className="form-grid">
        {SETTING_FIELDS.map(f => (
          <div key={f.key} className="field">
            <label>{f.label}</label>
            <input value={form[f.key] ?? ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            {f.hint && <div className="sub-muted" style={{ marginTop: 4 }}>{f.hint}</div>}
          </div>
        ))}
      </div>
      <div className="form-actions"><button className="btn btn-lime btn-sm" disabled={busy} onClick={save}><Icon name="check" /> Enregistrer</button></div>
    </div>
  )
}
