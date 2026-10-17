import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import Icon from './Icon'

// Shared sidebar shell for admin / coach / player dashboards.
export default function DashboardShell({ items }) {
  const { profile, role, signOut } = useAuth()
  const nav = useNavigate()

  async function handleLogout() {
    await signOut()
    nav('/login', { replace: true })
  }

  return (
    <div className="shell">
      <aside className="side">
        <Logo size={38} />
        <nav>
          {items.map(it => (
            <NavLink key={it.to} to={it.to} end={it.end}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <Icon name={it.icon} /> {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="who">
          <div className="who-top">
            <div className="avatar-sm">{profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" />
              : <span>{(profile?.full_name ?? '?').slice(0,1).toUpperCase()}</span>}</div>
            <div>
              <div className="nm">{profile?.full_name ?? 'Membre'}</div>
              <div className="rl">{role}</div>
            </div>
          </div>
          <button className="btn btn-lime btn-sm logout" onClick={handleLogout}>
            <Icon name="logout" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  )
}
