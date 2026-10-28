import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

const LINKS = [
  { href: '#club', label: 'Le Club' },
  { href: '#courts', label: 'Courts' },
  { href: '#calendrier', label: 'Événements' },
  { href: '#vie', label: 'Académie' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="lp-nav">
      <div className="lp-wrap lp-nav-in">
        <Link to="/" className="lp-brand" onClick={() => setOpen(false)}>
          <img src={logo} alt="" />
          <span>
            <b>M'Saken</b>
            <small>Tennis Club · Msaken</small>
          </span>
        </Link>

        <nav className={`lp-menu${open ? ' open' : ''}`}>
          <Link to="/" className="on" onClick={() => setOpen(false)}>Accueil</Link>
          {LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <Link to="/login" className="lp-menu-login" onClick={() => setOpen(false)}>Se connecter</Link>
        </nav>

        <div className="lp-nav-actions">
          <Link to="/login" className="lp-login">Se connecter</Link>
          <Link to="/player" className="lp-btn lp-btn-clay lp-btn-sm">Réserver un court</Link>
          <button type="button" className="lp-burger" aria-label="Menu" aria-expanded={open}
            onClick={() => setOpen(o => !o)}>
            <i /><i />
          </button>
        </div>
      </div>
    </header>
  )
}
