import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Icon from '../components/Icon'
import TennisBall from '../components/TennisBall'
import juniorImg from '../assets/junior.jpg'
import itfImg from '../assets/itf.jpg'
import holasolImg from '../assets/holasol.jpg'

const FACILITIES = [
  { cls: 'lime', tag: 'Professionnel', title: 'Courts en terre battue',
    text: "Six courts en terre battue méticuleusement entretenus offrant l'authentique expérience du tennis européen — glisse et rebond parfaits." },
  { cls: 'dark', icon: 'bulb', title: 'Éclairage nocturne',
    text: "Prolongez vos heures de jeu. Notre système d'éclairage LED haute performance garde chaque court prêt bien après le coucher du soleil." },
  { cls: 'shop', icon: 'bag', title: 'Pro Shop exclusif', more: 'Découvrir la boutique →',
    text: "Équipez-vous avec le meilleur. Raquettes, cordage, vêtements de performance et conseils professionnels pour tout votre matériel." },
  { cls: 'dark', icon: 'racket', title: 'Académie & Coaching',
    text: "Programmes d'entraînement personnalisés pour tous les âges et tous les niveaux avec notre équipe d'entraîneurs certifiés." },
]
const BENEFITS = [
  { icon: 'bolt', title: 'Réservation prioritaire', text: "Réservez votre court préféré jusqu'à 7 jours à l'avance via notre portail membre dédié." },
  { icon: 'trophy', title: 'Tournois du club', text: "Accès exclusif aux championnats saisonniers, rencontres communautaires et tournois régionaux officiels." },
  { icon: 'tag', title: 'Réductions partenaires', text: "Tarifs préférentiels sur le matériel du pro shop, les invités et les stages de coaching intensifs tout au long de l'année." },
]
const EVENTS = [
  {
    icon: 'trophy',
    meta: 'December 2025',
    title: 'Club Junior Tournament — ITF World Tennis Tour Juniors',
    image: juniorImg,
    text: `A milestone in our club’s history. Proud to have welcomed the ITF World Tennis Tour Juniors to M’Saken Tennis Club. One club. One family. ❤️ A tournament filled with passion, sportsmanship, and unforgettable memories.`,
  },
  {
    icon: 'trophy',
    meta: 'March 2026',
    title: 'HolaSol Team Cup',
    image: holasolImg,
    text: `This tournament proudly carried the name of our sponsor, HolaSol Energie. More than a tournament, a celebration of teamwork, passion, and unforgettable memories. 🎾`,
  },
  {
    icon: 'star',
    meta: 'Club Highlights',
    title: 'Moments forts du club',
    image: itfImg,
    text: `Three unforgettable events captured in one season: the ITF Junior Tournament, the HolaSol Team Cup, and our community celebrations.`,
  },
]

export default function Landing() {
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          const p = e.target.parentElement
          const grid = ['facilities', 'benefits', 'events'].some(c => p.classList.contains(c))
          e.target.style.transitionDelay = grid ? `${[...p.children].indexOf(e.target) * 0.09}s` : '0s'
          e.target.classList.add('in'); io.unobserve(e.target)
        }
      })
    }, { threshold: 0.15 })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <Navbar />

      <section className="hero">
        <div className="tb-impact tb-impact-1" />
        <div className="tb-impact tb-impact-2" />
        <TennisBall echo delay={.18} fade={.22} />
        <TennisBall echo delay={.1} fade={.4} />
        <TennisBall />
        <div className="wrap">
          <span className="eyebrow"><span className="dot" />Au cœur de Msaken · depuis 2009</span>
          <h1>Élevez votre jeu au <em>M'Saken Tennis Club</em></h1>
          <p>Des courts en terre battue de classe mondiale au cœur de Msaken. Que vous soyez
             joueur confirmé ou que vous preniez une raquette pour la première fois, notre
             communauté est votre maison du tennis.</p>
          <div className="cta">
            <Link to="/register" className="btn btn-lime"><Icon name="calendar" />Réserver un court</Link>
            <Link to="/register" className="btn btn-ghost">Rejoindre le club</Link>
          </div>

          <div className="hero-stats">
            <div className="hs-item"><span className="hs-num">150+</span><span className="hs-lbl">Membres</span></div>
            <div className="hs-item"><span className="hs-num">9</span><span className="hs-lbl">Courts</span></div>
            <div className="hs-item"><span className="hs-num">5+</span><span className="hs-lbl">Coachs</span></div>
            <div className="hs-item"><span className="hs-num">2009</span><span className="hs-lbl">Depuis</span></div>
          </div>
        </div>
      </section>

      <section className="sec" id="facilities">
        <div className="wrap">
          <div className="sec-head reveal"><h2>Nos installations premium</h2><div className="rule" /></div>
          <div className="facilities">
            {FACILITIES.map((f, i) => (
              <div key={i} className={`card ${f.cls} reveal`}>
                {f.tag ? <span className="tag">{f.tag}</span>
                       : <div className="ico"><Icon name={f.icon} /></div>}
                <h3>{f.title}</h3>
                <p>{f.text}</p>
                {f.more && <span className="more">{f.more}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec membership">
        <div className="wrap">
          <div className="mem-top reveal">
            <h2>Avantages des membres</h2><div className="rule" />
            <p>Exploitez tout le potentiel de votre parcours tennistique. Rejoignez notre
               communauté grandissante d'athlètes et de passionnés à Msaken.</p>
          </div>
          <div className="benefits">
            {BENEFITS.map((b, i) => (
              <div key={i} className="benefit reveal">
                <div className="ico"><Icon name={b.icon} /></div>
                <h3>{b.title}</h3><p>{b.text}</p>
              </div>
            ))}
          </div>
          <div className="view-plans reveal">
            <Link to="/register" className="btn btn-lime">Voir tous les abonnements</Link>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <div className="sec-head reveal"><h2>Événements &amp; temps forts</h2><div className="rule" /></div>
          <div className="events">
            {EVENTS.map((e, i) => (
              <div key={i} className="event reveal" style={{ overflow: 'hidden', borderRadius: 18, boxShadow: '0 18px 40px rgba(0,0,0,.08)' }}>
                <div className="ph" style={{ background: 'transparent' }}>
                  <img src={e.image} alt={e.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div className="body" style={{ padding: '24px 20px', background: '#fff' }}>
                  <div className="meta" style={{ color: 'var(--lime-deep)', marginBottom: 10, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon name={e.icon} />{e.meta}
                  </div>
                  <h3 style={{ fontSize: 22, margin: '0 0 10px', color: '#121212' }}>{e.title}</h3>
                  <p style={{ fontSize: 15, color: '#5a5a5a', lineHeight: 1.7, margin: 0 }}>{e.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <div className="inner reveal">
            <h2>Prêt à entrer sur le court ?</h2>
            <p>Notre système de réservation est en ligne. Réservez votre créneau sur nos
               courts en terre battue dès aujourd'hui.</p>
            <Link to="/register" className="btn btn-lime">Réserver mon créneau</Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
