import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Navbar() {
  return (
    <header className="site">
      <div className="wrap nav">
        <Link to="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
        </Link>
        <nav className="menu">
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><a href="#facilities">Réserver un court</a></li>
            <li><Link to="/login">Trouver un partenaire</Link></li>
            <li><Link to="/login">Mes réservations</Link></li>
          </ul>
        </nav>
        <Link to="/login" className="signin">Se connecter</Link>
      </div>
    </header>
  )
}
