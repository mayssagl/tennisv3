import Logo from './Logo'
export default function Footer() {
  return (
    <footer className="site">
      <div className="wrap">
        <div className="foot">
          <div className="foot-col" style={{ maxWidth: 320 }}>
            <Logo size={44} />
            <p style={{ marginTop: 14 }}>Sportif. Communautaire. Professionnel.
              La maison du tennis sur terre battue à Msaken.</p>
          </div>
          <div className="foot-col">
            <h4>Explorer</h4>
            <div className="foot-links">
              <a href="#">Politique de confidentialité</a>
              <a href="#">Conditions d'utilisation</a>
              <a href="#">Nous contacter</a>
              <a href="#">Règlement du club</a>
            </div>
          </div>
          <div className="foot-col">
            <h4>Nous rendre visite</h4>
            <p>Avenue de l'Indépendance<br/>Msaken, Sousse, Tunisie</p>
            <p style={{ marginTop: 10 }}>Ouvert tous les jours : <span className="hours">08h00 – 23h00</span></p>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 M'Saken Tennis Club. Tous droits réservés.</span>
          <span>Conçu pour la communauté tennistique de Msaken</span>
        </div>
      </div>
    </footer>
  )
}
