const LABELS = {
  pending: 'En attente', approved: 'Approuvée', rejected: 'Rejetée',
  cancelled: 'Annulée', available: 'Disponible', maintenance: 'Maintenance',
  admin: 'Admin', coach: 'Coach', player: 'Joueur',
}
export default function StatusBadge({ status }) {
  return <span className={`badge-s b-${status}`}>{LABELS[status] ?? status}</span>
}
