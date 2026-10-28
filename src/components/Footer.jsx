import { Link } from 'react-router-dom'
import Icon from './Icon'
import { useSiteContent } from '../lib/siteContent'

export default function Footer() {
  const { club: CLUB } = useSiteContent()
  return (
    <footer className="lp-foot">
      <div className="lp-wrap">
        <div className="lp-foot-grid">
          <div className="lp-foot-brand">
            <div className="lp-foot-name">Msaken Tennis Club<small>Depuis 2009</small></div>
            <p>Sportif. Communautaire. Professionnel. La maison du tennis à Msaken depuis 2009.</p>
            <address>{CLUB.address[0]}<br />{CLUB.address[1]}<br /><a href={CLUB.phoneHref}>{CLUB.phoneDisplay}</a></address>
            <div className="lp-foot-social">
              <a href={CLUB.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="facebook" /></a>
              <a href={CLUB.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" /></a>
              <a href={CLUB.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="whatsapp" /></a>
            </div>
          </div>

          <div>
            <h4>Le club</h4>
            <a href="#club">Notre histoire</a>
            <a href="#courts">Nos courts</a>
            <a href="#vie">Académie & coaching</a>
            <a href="#equipe">Staff technique</a>
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
            <a href="#contact">Nous contacter</a>
          </div>
        </div>
      </div>

      <div className="lp-foot-strip">
        <div className="lp-wrap">
          <span><i className="lp-dot" />Ouvert {CLUB.hours.toLowerCase()}</span>
          <span>Msaken, Sousse</span>
          <span>© 2026 Msaken Tennis Club. Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  )
}
