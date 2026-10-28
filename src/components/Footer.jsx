import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="lp-foot">
      <div className="lp-wrap">
        <div className="lp-foot-grid">
          <div className="lp-foot-brand">
            <div className="lp-foot-name">Msaken Tennis Club<small>Depuis 2009</small></div>
            <p>Sportif. Communautaire. Professionnel. La maison du tennis à Msaken depuis 2009.</p>
            <address>Avenue de l'Indépendance<br />Msaken, Sousse — Tunisie</address>
          </div>

          <div>
            <h4>Le club</h4>
            <a href="#club">Notre histoire</a>
            <a href="#courts">Nos courts</a>
            <a href="#vie">Académie & coaching</a>
            <a href="#">Règlement du club</a>
          </div>
          <div>
            <h4>Courts</h4>
            <a href="#courts">Terre battue</a>
            <a href="#courts">Courts en dur</a>
            <a href="#courts">Zone salle couverte</a>
            <Link to="/player">Réserver un créneau</Link>
          </div>
          <div>
            <h4>Calendrier</h4>
            <a href="#calendrier">ITF World Tennis Tour Juniors</a>
            <a href="#calendrier">HolaSol Team Cup</a>
            <a href="#calendrier">Tournois du club</a>
          </div>
          <div>
            <h4>Espace membre</h4>
            <Link to="/login">Se connecter</Link>
            <Link to="/register">Créer un compte</Link>
            <Link to="/forgot-password">Mot de passe oublié</Link>
            <a href="#">Nous contacter</a>
          </div>
        </div>

      </div>

      <div className="lp-foot-strip">
        <div className="lp-wrap">
          <span><i className="lp-dot" />Ouvert tous les jours · 08:00 – 23:00</span>
          <span>Msaken, Sousse</span>
          <span>© 2026 Msaken Tennis Club. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  )
}
