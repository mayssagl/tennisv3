import DashboardShell from '../../components/DashboardShell'
const items = [
  { to: '/admin', end: true, icon: 'grid', label: "Vue d'ensemble" },
  { to: '/admin/bookings', icon: 'calendar', label: 'Réservations' },
  { to: '/admin/members', icon: 'users', label: 'Membres' },
  { to: '/admin/announcements', icon: 'bell', label: 'Annonces' },
  { to: '/admin/site', icon: 'layout', label: 'Site web' },
  { to: '/admin/courts', icon: 'court', label: 'Courts' },
  { to: '/admin/coaching', icon: 'clipboard', label: 'Coaching' },
  { to: '/admin/partners', icon: 'partner', label: 'Partenaires' },
]
export default function AdminLayout() { return <DashboardShell items={items} /> }
