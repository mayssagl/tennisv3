import Icon from '../Icon'
export default function EmptyState({ icon = 'clipboard', title, hint }) {
  return (
    <div className="empty">
      <Icon name={icon} />
      <h3 style={{ fontSize: 22, marginBottom: 4 }}>{title}</h3>
      {hint && <p style={{ fontSize: 14 }}>{hint}</p>}
    </div>
  )
}
