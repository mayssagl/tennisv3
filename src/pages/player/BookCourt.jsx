import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../context/AuthContext'
import Loader from '../../components/ui/Loader'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/Icon'
import CourtMap from '../../components/CourtMap'

const SLOTS = ['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00']
const surfaceLabel = t => (t === 'clay' ? 'Terre battue' : t === 'hard' ? 'Surface dure' : t)

export default function BookCourt() {
  const { user } = useAuth()
  const [courts, setCourts] = useState(null)
  const [courtId, setCourtId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [taken, setTaken] = useState([])
  const [slot, setSlot] = useState('')
  const [busy, setBusy] = useState(false)
  const [announcement, setAnnouncement] = useState(null)

  useEffect(() => {
    Promise.all([
      supabase.from('courts').select('*').order('type').order('name'),
      supabase.from('announcements').select('title,body').order('created_at', { ascending: false }).limit(1),
    ]).then(([c, a]) => {
      setCourts(c.data ?? [])
      setAnnouncement(a.data?.[0] ?? null)
    })
  }, [user.id])

  const selectedCourt = useMemo(() => courts?.find(c => c.id === courtId), [courts, courtId])

  useEffect(() => {
    if (!courtId || !date) return
    setSlot('')
    supabase.from('bookings').select('start_time')
      .eq('court_id', courtId).eq('date', date).in('status', ['pending', 'approved'])
      .then(({ data }) => setTaken((data ?? []).map(b => b.start_time.slice(0, 5))))
  }, [courtId, date])

  async function submit() {
    if (!courtId || !slot) return toast.error('Choisissez un court et un créneau')
    setBusy(true)
    const end = String(Number(slot.slice(0, 2)) + 1).padStart(2, '0') + ':00'

    const { error: bookingError } = await supabase.from('bookings').insert({
      court_id: courtId,
      player_id: user.id,
      date,
      start_time: slot,
      end_time: end,
      status: 'pending',
    })

    setBusy(false)
    if (bookingError) return toast.error(bookingError.message)

    setTaken(t => [...t, slot])
    setSlot('')
    toast.success('Demande de réservation envoyée — en attente de validation.')
  }

  if (!courts) return <Loader />

  return (
    <>
      <div className="page-head">
        <div><h1>Réserver un court</h1><p>Choisissez un court, une date et un créneau.</p></div>
      </div>

      {announcement && (
        <div className="ann-banner">
          <Icon name="bell" />
          <div><strong>{announcement.title}</strong>{announcement.body ? ` — ${announcement.body}` : ''}</div>
        </div>
      )}

      <div className="panel">
        {courts.length === 0
          ? <EmptyState icon="court" title="Aucun court disponible" hint="Revenez bientôt." />
          : <CourtMap courts={courts} selectedId={courtId} onSelect={setCourtId} />}

        {selectedCourt && (
          <div className="court-selected-bar">
            <span className={`surf surf-${selectedCourt.type}`}>{surfaceLabel(selectedCourt.type)}</span>
            <strong>{selectedCourt.name}</strong>
            <button type="button" onClick={() => { setCourtId(''); setSlot('') }}>Changer de court</button>
          </div>
        )}

        {selectedCourt && (
          <>
            <div className="form-grid" style={{ marginTop: 22 }}>
              <div className="field"><label>Date</label>
                <input type="date" value={date} min={new Date().toISOString().slice(0, 10)}
                  onChange={e => setDate(e.target.value)} /></div>
            </div>

            <label style={{ display: 'block', fontWeight: 600, fontSize: 13.5, margin: '22px 0 8px' }}>Créneaux (1 h)</label>
            <div className="slot-grid">
              {SLOTS.map(s => (
                <button key={s} disabled={taken.includes(s)} className={`slot${slot === s ? ' sel' : ''}`} onClick={() => setSlot(s)}>{s}</button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 22, flexWrap: 'wrap' }}>
              <button className="btn btn-lime" disabled={busy || !slot} onClick={submit}>
                <Icon name="calendar" />{busy ? 'Envoi…' : 'Réserver ce créneau'}
              </button>
              <span style={{ color: 'var(--muted)', fontSize: 13.5 }}>
                Votre demande sera confirmée après validation par un administrateur.
              </span>
            </div>
          </>
        )}
      </div>
    </>
  )
}
