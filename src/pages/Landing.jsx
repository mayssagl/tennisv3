import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../landing.css'
import juniorImg from '../assets/junior.jpg'
import itfImg from '../assets/itf.jpg'
import holasolImg from '../assets/holasol.jpg'
import aerialImg from '../assets/terrain1-map.jpg'
import heroImg from '../assets/hero-aerial.jpg'
import hallImg from '../assets/terrain2-map.jpg'
import ballImg from '../assets/tn.png'
import staffImg from '../assets/staff-2026.jpg'
import Icon from '../components/Icon'
import { useSiteContent } from '../lib/siteContent'

// "Circuit: ITF World Tennis Tour" lines -> [['Circuit', 'ITF World Tennis Tour'], ...]
const parseDetails = txt => (txt ?? '').split('\n')
  .map(l => l.split(':')).filter(p => p.length > 1 && p[0].trim())
  .map(([k, ...v]) => [k.trim(), v.join(':').trim()])

const SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

const STATS = [
  { k: 'Installations', v: '9 courts', s: '1 terre battue · 8 en dur' },
  { k: 'Communauté', v: '150+', s: 'Membres actifs' },
  { k: 'Staff technique', v: 'STAFF_COUNT', s: 'Encadrants · saison 2026–27' },
  { k: 'Fondation', v: '2009', s: 'Au cœur de Msaken' },
]

const COURTS = [
  {
    no: 'Court 01', tag: 'Surface signature', title: 'Court en terre battue',
    text: "Notre court signature. Glisse maîtrisée, rebond lent et échanges longs : l'expérience authentique du tennis européen.",
    img: aerialImg, zoom: { pos: '50% 0%', t: 'scale(2) translate(-19%, 4%)' },
    specs: [['Courts', '1'], ['Surface', 'Terre battue'], ['Zone', 'Principale']],
  },
  {
    no: 'Courts 02 — 07', tag: 'Zone principale', title: 'Courts en dur',
    text: 'Six courts en dur pour un jeu rapide et régulier. Idéal pour l\'entraînement, les matchs entre membres et les tournois.',
    img: aerialImg, zoom: { pos: '50% 40%', t: 'scale(2) translate(25%, 0)' },
    specs: [['Courts', '6'], ['Surface', 'Dur'], ['Zone', 'Principale']],
  },
  {
    no: 'Courts 08 — 09', tag: 'Salle couverte', title: 'Zone salle couverte',
    text: 'Deux courts en dur au calme, à côté de la salle couverte du club. Parfaits pour les cours particuliers et l\'académie.',
    img: hallImg, zoom: { pos: '50% 30%', t: 'scale(1.35) translate(8%, 6%)' },
    specs: [['Courts', '2'], ['Surface', 'Dur'], ['Zone', 'Salle couverte']],
  },
]

const LIFE = [
  {
    tag: 'Académie', title: 'Académie & coaching', img: juniorImg, pos: '50% 62%',
    text: "Programmes personnalisés pour tous les âges et tous les niveaux, avec notre équipe d'entraîneurs certifiés.",
    foot: 'STAFF_COUNT encadrants · saison 2026–27', cta: "Voir l'équipe", href: '#equipe',
  },
  {
    tag: 'Communauté', title: 'Trouver un partenaire', img: holasolImg, pos: '50% 30%',
    text: "Publiez une annonce de match, parcourez l'annuaire des joueurs et trouvez un adversaire à votre niveau.",
    foot: 'Réservé aux membres', cta: 'Accéder', to: '/player/partners',
  },
  {
    tag: 'Équipement', title: 'Pro Shop', ball: true,
    text: 'Raquettes, cordage, vêtements de performance et conseils professionnels pour tout votre matériel.',
    foot: 'Tarifs préférentiels membres', cta: 'En savoir plus', to: '/register',
  },
]

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function SectionLabel({ n, label, aside }) {
  return (
    <div className="lp-label reveal">
      <span>[ {n} / {label} ]</span>
      {aside && <span className="lp-label-aside">{aside}</span>}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('courts')
  const [date, setDate] = useState(today())
  const [surface, setSurface] = useState('clay')
  const [slot, setSlot] = useState('18:00')
  const [players, setPlayers] = useState('simple')
  const [hideBanner, setHideBanner] = useState(false)

  const content = useSiteContent()
  const { club: CLUB, staff, events, banner } = content
  const leads = staff.filter(s => s.is_lead)
  const coaches = staff.filter(s => !s.is_lead)
  const featured = events.find(e => e.featured) ?? events[0]
  const agenda = events.filter(e => e !== featured).slice(0, 3)
  const featSpecs = parseDetails(featured?.details)

  // Fade-in on scroll. Re-runs when content arrives from the database so new items are picked up.
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return
        const sibs = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'))
        e.target.style.transitionDelay = `${Math.max(0, sibs.indexOf(e.target)) * 0.08}s`
        e.target.classList.add('in')
        io.unobserve(e.target)
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.lp .reveal:not(.in)').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [content])

  const book = (e) => {
    e.preventDefault()
    navigate(tab === 'partner' ? '/player/partners' : '/player')
  }

  return (
    <div className="lp">
      <Navbar />

      {banner && !hideBanner && (
        <div className="lp-banner" role="status">
          <div className="lp-wrap lp-banner-in">
            <Icon name="bell" />
            <p><strong>{banner.title}</strong>{banner.body && <span> — {banner.body}</span>}</p>
            <button type="button" aria-label="Fermer l'annonce" onClick={() => setHideBanner(true)}><Icon name="x" /></button>
          </div>
        </div>
      )}

      {/* ================= HERO ================= */}
      <section className="lp-hero" style={{ '--hero-img': `url(${heroImg})` }}>
        <div className="lp-wrap">
          <div className="lp-hero-top">
            <span className="lp-hero-top-r">
              <span>1 court en terre battue</span>
              <span>8 courts en dur</span>
            </span>
          </div>

          <div className="lp-hero-body">
            <p className="lp-kicker">Le tennis au cœur du Sahel</p>
            <h1>Votre court.<br /><em>Votre jeu.</em></h1>
            <p className="lp-hero-sub">Terre battue & surfaces dures, réservables en ligne, ouvertes tous les jours.</p>
            <div className="lp-hero-cta">
              <Link to="/player" className="lp-btn lp-btn-clay">Réserver un court <span aria-hidden>→</span></Link>
              <a href="#calendrier" className="lp-btn lp-btn-ghost">Événements & tournois</a>
            </div>
          </div>

          {/* Booking widget */}
          <form className="lp-book" onSubmit={book}>
            <div className="lp-book-head">
              <div className="lp-book-tabs" role="tablist">
                {[['courts', 'Courts de tennis'], ['coach', 'Cours particulier'], ['partner', 'Trouver un partenaire']].map(([k, l]) => (
                  <button key={k} type="button" role="tab" aria-selected={tab === k}
                    className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
                ))}
              </div>
              <span className="lp-book-live"><i className="lp-dot lp-dot-live" />Club ouvert · 08:00 – 23:00</span>
            </div>
            <div className="lp-book-row">
              <label className="lp-field">
                <span>Date</span>
                <input type="date" value={date} min={today()} onChange={e => setDate(e.target.value)} />
              </label>
              <label className="lp-field">
                <span>Surface</span>
                <select value={surface} onChange={e => setSurface(e.target.value)}>
                  <option value="clay">Terre battue</option>
                  <option value="hard">Court en dur</option>
                  <option value="any">Peu importe</option>
                </select>
              </label>
              <label className="lp-field">
                <span>Créneau</span>
                <select value={slot} onChange={e => setSlot(e.target.value)}>
                  {SLOTS.map(s => (
                    <option key={s} value={s}>{s} – {String(+s.slice(0, 2) + 1).padStart(2, '0')}:00</option>
                  ))}
                </select>
              </label>
              <label className="lp-field">
                <span>Joueurs</span>
                <select value={players} onChange={e => setPlayers(e.target.value)}>
                  <option value="simple">Simple (2 joueurs)</option>
                  <option value="double">Double (4 joueurs)</option>
                </select>
              </label>
              <button type="submit" className="lp-btn lp-btn-forest lp-book-go">
                Voir les créneaux <span aria-hidden>→</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ================= 01 / LE CLUB ================= */}
      <section className="lp-sec" id="club">
        <div className="lp-wrap">
          <SectionLabel n="01" label="Le club" aside="Msaken · Sousse · Tunisie" />

          <div className="lp-club">
            <div className="lp-club-text reveal">
              <h2>L'esprit Msaken Tennis Club :<br /><em>un club, une famille.</em></h2>
              <p>Depuis 2009, le Msaken Tennis Club réunit joueurs confirmés, juniors et
                 débutants autour d'une même passion. Neuf courts, une académie et une
                 communauté qui grandit chaque saison.</p>
              <p>Que vous preniez une raquette pour la première fois ou que vous prépariez
                 votre prochain tournoi, notre maison du tennis vous accueille tous les jours,
                 du matin jusqu'en soirée.</p>
              <blockquote>
                « Un club. Une famille. Un tournoi rempli de passion, de fair-play et de
                souvenirs inoubliables. »
                <cite>— À propos de l'ITF World Tennis Tour Juniors à Msaken</cite>
              </blockquote>
            </div>

            <div className="lp-collage reveal">
              <figure className="lp-ph lp-ph-tall">
                <img src={juniorImg} alt="Remise des prix des juniors sur le court" style={{ objectPosition: '50% 60%' }} />
                <figcaption>Remise des prix · Juniors</figcaption>
              </figure>
              <figure className="lp-ph">
                <img src={itfImg} alt="Trophées de l'ITF World Tennis Tour Juniors" style={{ objectPosition: '70% 50%' }} />
                <figcaption>ITF World Tennis Tour Juniors</figcaption>
              </figure>
              <figure className="lp-ph">
                <img src={holasolImg} alt="Vainqueurs de la HolaSol Team Cup" />
                <figcaption>HolaSol Team Cup 2026</figcaption>
              </figure>
            </div>
          </div>

          <div className="lp-stats">
            {STATS.map(s => (
              <div key={s.k} className="lp-stat reveal">
                <span className="lp-mono">{s.k}</span>
                <strong>{s.v.replace('STAFF_COUNT', staff.length)}</strong>
                <small>{s.s}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 02 / COURTS ================= */}
      <section className="lp-sec lp-sec-alt" id="courts">
        <div className="lp-wrap">
          <SectionLabel n="02" label="Courts" />
          <div className="lp-head reveal">
            <h2>Deux surfaces, <em>neuf courts.</em></h2>
            <p>Chaque court est entretenu par l'équipe du club. Réservez votre créneau d'une
               heure en ligne, avec confirmation immédiate.</p>
          </div>

          <div className="lp-courts">
            {COURTS.map(c => (
              <article key={c.title} className="lp-court reveal">
                <div className="lp-court-top">
                  <span className="lp-mono">{c.no}</span>
                  <span className="lp-tag">{c.tag}</span>
                </div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
                <div className="lp-court-img">
                  <img src={c.img} alt={`Vue aérienne — ${c.title}`}
                    style={{ objectPosition: c.zoom.pos, transform: c.zoom.t }} />
                </div>
                <dl className="lp-specs">
                  {c.specs.map(([k, v]) => (
                    <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                  ))}
                </dl>
                <div className="lp-slots">
                  <span className="lp-mono">Créneaux d'une heure</span>
                  <div>{['08:00', '11:00', '14:00', '18:00', '20:00'].map(s => <i key={s}>{s}</i>)}<i>…</i></div>
                </div>
                <Link to="/player" className="lp-btn lp-btn-forest lp-btn-block">Réserver ce court <span aria-hidden>→</span></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 03 / CALENDRIER ================= */}
      <section className="lp-sec" id="calendrier">
        <div className="lp-wrap">
          <SectionLabel n="03" label="Calendrier" aside="Tournois & temps forts" />

          <div className="lp-agenda">
            {featured && (
              <article className="lp-feature reveal" style={{ '--feat-img': `url(${featured.image_url || itfImg})` }}>
                <div className="lp-feature-in">
                  <div className="lp-feature-tags">
                    {featured.kind && <span className="lp-tag lp-tag-clay">{featured.kind}</span>}
                  </div>
                  <h3>{featured.title}</h3>
                  {featured.when_label && <p className="lp-feature-when">{featured.when_label}</p>}
                  {featured.body && <p>{featured.body}</p>}
                  {featSpecs.length > 0 && (
                    <dl className="lp-feature-specs" style={{ gridTemplateColumns: `repeat(${Math.min(featSpecs.length, 3)}, 1fr)` }}>
                      {featSpecs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
                    </dl>
                  )}
                  <div className="lp-feature-cta">
                    <Link to="/register" className="lp-btn lp-btn-clay">{featured.link_label || 'En savoir plus'}</Link>
                    <Link to="/login" className="lp-btn lp-btn-ghost">Espace membre</Link>
                  </div>
                </div>
              </article>
            )}

            <div className="lp-agenda-list">
              {agenda.map(a => (
                <article key={a.id ?? a.title} className="lp-agenda-item reveal">
                  <div className="lp-agenda-meta">
                    <span>{a.kind}</span>
                    <span>{a.when_label}</span>
                  </div>
                  <h4>{a.title}</h4>
                  <p>{a.body}</p>
                  <Link to="/register" className="lp-more">{a.link_label || 'En savoir plus'} <span aria-hidden>→</span></Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= 04 / VIE DU CLUB ================= */}
      <section className="lp-sec lp-sec-alt" id="vie">
        <div className="lp-wrap">
          <SectionLabel n="04" label="Vie du club" />
          <div className="lp-head reveal">
            <h2>Au-delà <em>du court.</em></h2>
            <p>L'adhésion au club, c'est aussi une académie, une communauté de joueurs et des
               avantages réservés aux membres tout au long de l'année.</p>
          </div>

          <div className="lp-life">
            {LIFE.map(l => (
              <article key={l.title} className="lp-life-card reveal">
                <div className={`lp-life-img${l.ball ? ' lp-life-ball' : ''}`}>
                  {l.ball
                    ? <img src={ballImg} alt="" />
                    : <img src={l.img} alt={l.title} style={{ objectPosition: l.pos }} />}
                  <span className="lp-tag">{l.tag}</span>
                </div>
                <div className="lp-life-body">
                  <h3>{l.title}</h3>
                  <p>{l.text}</p>
                  <div className="lp-life-foot">
                    <span className="lp-mono">{l.foot.replace('STAFF_COUNT', staff.length)}</span>
                    {l.href
                      ? <a href={l.href} className="lp-more">{l.cta} <span aria-hidden>→</span></a>
                      : <Link to={l.to} className="lp-more">{l.cta} <span aria-hidden>→</span></Link>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 05 / ÉQUIPE ================= */}
      <section className="lp-sec" id="equipe">
        <div className="lp-wrap">
          <SectionLabel n="05" label="Équipe" aside="Staff technique 2026 – 2027" />
          <div className="lp-head reveal">
            <h2>Le staff <em>technique.</em></h2>
            <p>{staff.length} encadrants accompagnent les joueurs du club, de l'école de tennis
               jusqu'à la compétition.</p>
          </div>

          <div className="lp-staff">
            <figure className="lp-staff-poster reveal">
              <a href={staffImg} target="_blank" rel="noreferrer" title="Agrandir l'organigramme">
                <img src={staffImg}  alt="Organigramme du staff technique 2026 – 2027 du Msaken Tennis Club" />
              </a>
              <figcaption>Organigramme officiel · saison 2026 – 2027</figcaption>
            </figure>

            <div className="lp-staff-list reveal">
              <h4 className="lp-mono">Direction & responsables</h4>
              <ul className="lp-leads">
                {leads.map(s => (
                  <li key={s.id ?? s.name}>
                    <span className="lp-initials" aria-hidden>{s.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
                    <div>
                      <strong>{s.name}</strong>
                      <span>{s.role}{s.extra && <> · {s.extra}</>}</span>
                    </div>
                  </li>
                ))}
              </ul>

              <h4 className="lp-mono">Entraîneurs</h4>
              <ul className="lp-coaches">
                {coaches.map(s => <li key={s.id ?? s.name}>{s.name}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 06 / CONTACT ================= */}
      <section className="lp-sec lp-sec-alt" id="contact">
        <div className="lp-wrap">
          <SectionLabel n="06" label="Contact" aside="Msaken · Sousse · Tunisie" />
          <div className="lp-head reveal">
            <h2>Venez nous <em>rendre visite.</em></h2>
            <p>Une question sur les cours, l'adhésion ou une réservation&nbsp;? Appelez-nous ou
               écrivez-nous sur WhatsApp, nous répondons rapidement.</p>
          </div>

          <div className="lp-contact">
            <div className="lp-contact-list reveal">
              <a className="lp-contact-item" href={CLUB.phoneHref}>
                <Icon name="phone" />
                <div><span className="lp-mono">Téléphone</span><strong>{CLUB.phoneDisplay}</strong></div>
              </a>
              <a className="lp-contact-item" href={CLUB.whatsapp} target="_blank" rel="noreferrer">
                <Icon name="whatsapp" />
                <div><span className="lp-mono">WhatsApp</span><strong>Écrire au club</strong></div>
              </a>
              <a className="lp-contact-item" href={CLUB.mapsLink} target="_blank" rel="noreferrer">
                <Icon name="pin" />
                <div><span className="lp-mono">Adresse · itinéraire</span><strong>{CLUB.address[0]}</strong><small>{CLUB.address[1]}</small></div>
              </a>
              <div className="lp-contact-item">
                <Icon name="clock" />
                <div><span className="lp-mono">Horaires</span><strong>{CLUB.hours}</strong></div>
              </div>
              <div className="lp-contact-social">
                <a href={CLUB.facebook} target="_blank" rel="noreferrer"><Icon name="facebook" />Facebook</a>
                <a href={CLUB.instagram} target="_blank" rel="noreferrer"><Icon name="instagram" />Instagram</a>
              </div>
            </div>

            <div className="lp-map reveal">
              <iframe title="Plan d'accès — Msaken Tennis Club" src={CLUB.mapsEmbed}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="lp-cta">
        <div className="lp-wrap lp-cta-in">
          <div className="reveal">
            <p className="lp-kicker">Accueil du club</p>
            <h2>Entrez sur le court.<br /><em>Votre prochain match commence ici.</em></h2>
            <p>Réservez un créneau en quelques secondes ou créez votre compte membre pour
               profiter de la réservation prioritaire, des tournois du club et des tarifs
               partenaires.</p>
            <ul className="lp-cta-info">
              <li><a href={CLUB.phoneHref}>{CLUB.phoneDisplay}</a></li>
              <li>{CLUB.hours}</li>
            </ul>
          </div>
          <div className="lp-cta-btns reveal">
            <Link to="/player" className="lp-btn lp-btn-clay lp-btn-block">Réserver un créneau <span aria-hidden>→</span></Link>
            <Link to="/register" className="lp-btn lp-btn-ghost lp-btn-block">Devenir membre</Link>
          </div>
        </div>
      </section>

      <Footer />

      <a className="lp-wa" href={CLUB.whatsapp} target="_blank" rel="noreferrer" aria-label="Écrire au club sur WhatsApp">
        <Icon name="whatsapp" /><span>WhatsApp</span>
      </a>
    </div>
  )
}
