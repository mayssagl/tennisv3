import Icon from '../Icon'
export default function StatCard({ icon, label, value }) {
  return (
    <div className="stat">
      <div className="lbl"><Icon name={icon} /> {label}</div>
      <div className="val">{value}</div>
    </div>
  )
}
