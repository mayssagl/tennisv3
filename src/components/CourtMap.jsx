import { toast } from 'sonner'
import Icon from './Icon'
import terrain1Img from '../assets/terrain1-map.jpg'
import terrain2Img from '../assets/terrain2-map.jpg'

// Zone 1 (main cluster): 4 hard courts left column, clay top-right, 2 hard bottom-right
const ZONE1_HARD_SPOTS = [
  { left: 2.86, top: 2.38, width: 43.43, height: 26.19 },
  { left: 2.86, top: 28.57, width: 43.43, height: 27.38 },
  { left: 2.86, top: 55.95, width: 43.43, height: 26.19 },
  { left: 2.86, top: 82.14, width: 43.43, height: 15.48 },
  { left: 49.71, top: 38.10, width: 47.43, height: 28.57 },
  { left: 49.71, top: 66.67, width: 47.43, height: 29.76 },
]
const ZONE1_CLAY_SPOT = { left: 49.71, top: 12.5, width: 40.0, height: 25.0 }

// Zone 2 (salle couverte area): 2 hard courts — the covered hall itself is not clickable
const ZONE2_HARD_SPOTS = [
  { left: 18.82, top: 1.31, width: 51.44, height: 32.72 },
  { left: 1.25, top: 34.03, width: 31.37, height: 37.96 },
]

function Spot({ c, rect, selectedId, onPick }) {
  const sel = selectedId === c.id
  const maint = c.status !== 'available'
  return (
    <button type="button"
      className={`court-spot court-spot-${c.type}${sel ? ' sel' : ''}${maint ? ' disabled' : ''}`}
      style={{ left: `${rect.left}%`, top: `${rect.top}%`, width: `${rect.width}%`, height: `${rect.height}%` }}
      onClick={() => onPick(c)}>
      <span className="court-spot-beacon"><i /><i /></span>
      <span className="court-spot-label">{c.name}{maint ? ' · maintenance' : ''}</span>
    </button>
  )
}

export default function CourtMap({ courts, selectedId, onSelect }) {
  const clay = courts.filter(c => c.type === 'clay')
  const hard = courts.filter(c => c.type !== 'clay')

  const claySlotCourt = clay[0]
  const zone1Hard = hard.slice(0, ZONE1_HARD_SPOTS.length)
  const zone2Hard = hard.slice(ZONE1_HARD_SPOTS.length, ZONE1_HARD_SPOTS.length + ZONE2_HARD_SPOTS.length)
  const overflow = [...clay.slice(1), ...hard.slice(ZONE1_HARD_SPOTS.length + ZONE2_HARD_SPOTS.length)]

  function pick(c) {
    if (c.status !== 'available') { toast.info(`${c.name} est actuellement en maintenance.`); return }
    onSelect(c.id)
  }

  const zone1Spots = zone1Hard.map((c, i) => ({ court: c, rect: ZONE1_HARD_SPOTS[i] }))
  if (claySlotCourt) zone1Spots.push({ court: claySlotCourt, rect: ZONE1_CLAY_SPOT })
  const zone2Spots = zone2Hard.map((c, i) => ({ court: c, rect: ZONE2_HARD_SPOTS[i] }))

  return (
    <div className="court-map-card">
      <div className="court-map-head">
        <div className="court-map-head-ico"><Icon name="court" /></div>
        <div>
          <h3>Plan du club</h3>
          <p>Cliquez sur un court pour voir ses disponibilités</p>
        </div>
      </div>

      <div className="court-map-group">
        <div className="court-map-zone">
          <div className="court-map-label">Zone principale</div>
          <div className="court-map">
            <img src={terrain1Img} alt="Plan des courts — zone principale" />
            {zone1Spots.map(({ court: c, rect }) => <Spot key={c.id} c={c} rect={rect} selectedId={selectedId} onPick={pick} />)}
          </div>
        </div>

        {zone2Spots.length > 0 && (
          <div className="court-map-zone">
            <div className="court-map-label">Zone salle couverte</div>
            <div className="court-map">
              <img src={terrain2Img} alt="Plan des courts — zone salle couverte" />
              {zone2Spots.map(({ court: c, rect }) => <Spot key={c.id} c={c} rect={rect} selectedId={selectedId} onPick={pick} />)}
            </div>
          </div>
        )}
      </div>

      {overflow.length > 0 && (
        <div className="grid-cards" style={{ marginTop: 16 }}>
          {overflow.map(c => (
            <button key={c.id} type="button"
              className={`court-pick${selectedId === c.id ? ' sel' : ''}${c.status !== 'available' ? ' disabled' : ''}`}
              onClick={() => pick(c)}>
              <span className="court-nm">{c.name}</span>
              {c.status !== 'available' && <span className="surf">Maintenance</span>}
            </button>
          ))}
        </div>
      )}

      <div className="court-map-legend">
        <span><i className="lg-dot lg-hard" />Surface dure</span>
        <span><i className="lg-dot lg-clay" />Terre battue</span>
        <span><i className="lg-dot lg-sel" />Sélectionné</span>
        <span><i className="lg-dot lg-maint" />En maintenance</span>
      </div>
    </div>
  )
}
