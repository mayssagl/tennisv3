import DashboardShell from '../../components/DashboardShell'
const items = [
  { to: '/coach', end: true, icon: 'calendar', label: 'Mon planning' },
  { to: '/coach/players', icon: 'users', label: 'Mes joueurs' },
]
export default function CoachLayout() { return <DashboardShell items={items} /> }
