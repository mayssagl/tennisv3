import DashboardShell from '../../components/DashboardShell'
const items = [
  { to: '/player', end: true, icon: 'court', label: 'Réserver un court' },
  { to: '/player/bookings', icon: 'clipboard', label: 'Mes réservations' },
  { to: '/player/schedule', icon: 'calendar', label: 'Mon planning' },
  { to: '/player/partners', icon: 'partner', label: 'Trouver un partenaire' },
  { to: '/player/announcements', icon: 'bell', label: 'Annonces' },
  { to: '/player/profile', icon: 'user', label: 'Mon profil' },
]
export default function PlayerLayout() { return <DashboardShell items={items} /> }
