import DashboardShell from '../../components/DashboardShell'
const items = [
  { to: '/admin', end: true, icon: 'grid', label: "Vue d'ensemble" },
  { to: '/admin/bookings', icon: 'calendar', label: 'Réservations' },
  { to: '/admin/courts', icon: 'court', label: 'Courts' },
  { to: '/admin/members', icon: 'users', label: 'Membres' },
  { to: '/admin/announcements', icon: 'bell', label: 'Annonces' },
]
export default function AdminLayout() { return <DashboardShell items={items} /> }
