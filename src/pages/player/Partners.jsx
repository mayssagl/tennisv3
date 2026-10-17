import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LEVELS, levelLabel } from '../../lib/points'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/Icon'

const SURFACES = [
  { key: 'any', label: 'Indifférent' },
  { key: 'clay', label: 'Terre battue' },
  { key: 'hard', label: 'Surface dure' },
]
const surfLabel = k => SURFACES.find(s => s.key === k)?.label ?? 'Indifférent'
const Avatar = ({ url, name }) => (
  <div className="avatar-sm" style={{ width: 40, height: 40, background: 'var(--char)', color: 'var(--lime)' }}>
    {url ? <img src={url} alt="" /> : <span>{(name ?? '?').slice(0, 1).toUpperCase()}</span>}
  </div>
)

export default function Partners() {
  const { user } = useAuth()
  const [tab, setTab] = useState('board')
  return (
    <>
      <div className="page-head"><div><h1>Trouver un partenaire</h1><p>Trouvez quelqu'un à votre niveau, ou publiez une annonce de match.</p></div></div>
      <div className="tabs">
        <button className={tab === 'board' ? 'on' : ''} onClick={() => setTab('board')}><Icon name="partner" /> Annonces de match</button>
        <button className={tab === 'dir' ? 'on' : ''} onClick={() => setTab('dir')}><Icon name="users" /> Joueurs</button>
      </div>
      {tab === 'board' ? <MatchBoard user={user} /> : <Directory user={user} />}
    </>
  )
}

/* -------------------- MATCH BOARD -------------------- */
function MatchBoard({ user }) {
  const [posts, setPosts] = useState(null)
  const [myResponses, setMyResponses] = useState({})   // post_id -> response row
  const [counts, setCounts] = useState({})             // post_id -> nb responses (own posts)
  const [form, setForm] = useState({ play_date: '', play_time: '', surface: 'any', level_pref: 'any', note: '' })
  const [showForm, setShowForm] = useState(false)

  async function load() {
    const { data: ps } = await supabase
      .from('match_posts')
      .select('*, author:profiles!match_posts_author_id_fkey(full_name,level,avatar_url)')
      .eq('status', 'open').order('created_at', { ascending: false })

    const { data: rs } = await supabase
      .from('match_responses').select('id,post_id,responder_id')
    const mine = {}, cnt = {}
    ;(rs ?? []).forEach(r => {
      cnt[r.post_id] = (cnt[r.post_id] ?? 0) + 1
      if (r.responder_id === user.id) mine[r.post_id] = r
    })
    setPosts(ps ?? []); setMyResponses(mine); setCounts(cnt)
  }
  useEffect(() => { load() }, [])

  async function publish() {
    if (!form.play_date) return toast.error('Indiquez une date')
    const { error } = await supabase.from('match_posts').insert({ ...form, author_id: user.id })
    if (error) return toast.error(error.message)
    toast.success('Annonce publiée')
    setForm({ play_date: '', play_time: '', surface: 'any', level_pref: 'any', note: '' }); setShowForm(false); load()
  }
  async function respond(post) {
    const { error } = await supabase.from('match_responses').insert({ post_id: post.id, responder_id: user.id })
    if (error) return toast.error(error.code === '23505' ? 'Vous avez déjà répondu' : error.message)
    toast.success('Réponse envoyée — le joueur verra votre intérêt'); load()
  }
  async function unrespond(post) {
    await supabase.from('match_responses').delete().eq('post_id', post.id).eq('responder_id', user.id)
    load()
  }
  async function closePost(post) {
    if (!confirm('Clôturer cette annonce ?')) return
    await supabase.from('match_posts').update({ status: 'closed' }).eq('id', post.id)
    toast.success('Annonce clôturée'); load()
  }

  if (!posts) return <Loader />

  return (
    <>
      <div style={{ marginBottom: 18 }}>
        <button className="btn btn-lime btn-sm" onClick={() => setShowForm(v => !v)}>
          <Icon name="plus" /> {showForm ? 'Fermer' : 'Publier une annonce'}
        </button>
      </div>

      {showForm && (
        <div className="panel">
          <h3>Nouvelle annonce de match</h3>
          <div className="form-grid">
            <div className="field"><label>Date souhaitée</label>
              <input type="date" min={new Date().toISOString().slice(0, 10)} value={form.play_date}
                onChange={e => setForm({ ...form, play_date: e.target.value })} /></div>
            <div className="field"><label>Heure (indicative)</label>
              <input type="time" value={form.play_time} onChange={e => setForm({ ...form, play_time: e.target.value })} /></div>
            <div className="field"><label>Surface</label>
              <select value={form.surface} onChange={e => setForm({ ...form, surface: e.target.value })}>
                {SURFACES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select></div>
            <div className="field"><label>Niveau recherché</label>
              <select value={form.level_pref} onChange={e => setForm({ ...form, level_pref: e.target.value })}>
                <option value="any">Indifférent</option>
                {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}</select></div>
          </div>
          <div className="field" style={{ marginTop: 16 }}><label>Message</label>
            <textarea rows={2} placeholder="Ex. : cherche un échange amical en double samedi matin."
              value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
          <button className="btn btn-lime btn-sm" style={{ marginTop: 14 }} onClick={publish}><Icon name="send" /> Publier</button>
        </div>
      )}

      {posts.length === 0
        ? <div className="panel"><EmptyState icon="partner" title="Aucune annonce ouverte" hint="Soyez le premier à proposer un match." /></div>
        : posts.map(p => {
          const mine = p.author_id === user.id
          const responded = myResponses[p.id]
          return (
            <div key={p.id} className="panel match-post">
              <div className="mp-head">
                <Avatar url={p.author?.avatar_url} name={p.author?.full_name} />
                <div>
                  <div style={{ fontWeight: 600 }}>{p.author?.full_name ?? 'Membre'} {mine && <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· vous</span>}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Niveau : {levelLabel(p.author?.level)}</div>
                </div>
                <div className="mp-meta">
                  <span><Icon name="calendar" />{p.play_date}{p.play_time ? ` · ${p.play_time}` : ''}</span>
                  <span><Icon name="court" />{surfLabel(p.surface)}</span>
                  {p.level_pref !== 'any' && <span><Icon name="medal" />{levelLabel(p.level_pref)}</span>}
                </div>
              </div>
              {p.note && <p className="mp-note">{p.note}</p>}
              <div className="mp-actions">
                {mine ? (
                  <>
                    <span className="mp-count">{counts[p.id] ?? 0} réponse(s)</span>
                    <button className="icon-btn no" onClick={() => closePost(p)}><Icon name="x" /> Clôturer</button>
                  </>
                ) : responded ? (
                  <button className="icon-btn ok" onClick={() => unrespond(p)}><Icon name="check" /> Vous êtes partant — annuler</button>
                ) : (
                  <button className="btn btn-lime btn-sm" onClick={() => respond(p)}><Icon name="partner" /> Je suis partant</button>
                )}
              </div>
            </div>
          )
        })}
    </>
  )
}

/* -------------------- DIRECTORY -------------------- */
function Directory({ user }) {
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [lvl, setLvl] = useState('any')

  useEffect(() => {
    supabase.from('profiles').select('id,full_name,email,phone,level,bio,avatar_url')
      .neq('id', user.id).order('full_name')
      .then(({ data }) => setRows(data ?? []))
  }, [user.id])

  if (!rows) return <Loader />
  const filtered = rows.filter(r =>
    (lvl === 'any' || r.level === lvl) &&
    (!q || (r.full_name ?? '').toLowerCase().includes(q.toLowerCase())))

  return (
    <>
      <div className="panel" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="field" style={{ marginBottom: 0, flex: '1 1 220px' }}>
          <label>Rechercher</label>
          <div style={{ position: 'relative' }}>
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nom du joueur" style={{ paddingLeft: 38 }} />
            <Icon name="search" style={{ width: 18, height: 18, position: 'absolute', left: 12, top: 13, color: 'var(--muted)' }} />
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0, width: 200 }}>
          <label>Niveau</label>
          <select value={lvl} onChange={e => setLvl(e.target.value)}>
            <option value="any">Tous les niveaux</option>
            {LEVELS.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0
        ? <div className="panel"><EmptyState icon="users" title="Aucun joueur trouvé" hint="Ajustez votre recherche." /></div>
        : (
        <div className="dir-grid">
          {filtered.map(m => (
            <div key={m.id} className="dir-card">
              <Avatar url={m.avatar_url} name={m.full_name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{m.full_name ?? 'Membre'}</div>
                <span className="lvl-chip">{levelLabel(m.level)}</span>
                {m.bio && <p className="dir-bio">{m.bio}</p>}
                <div className="dir-contact">
                  {m.email && <a href={`mailto:${m.email}`}><Icon name="mail" />{m.email}</a>}
                  {m.phone && <span><Icon name="user" />{m.phone}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
