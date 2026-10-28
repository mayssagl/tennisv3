// Default website content. The admin "Site web" page stores its own copy in
// Supabase (migration_v4.sql); these values are only used until that exists
// or if the database can't be reached.

export const DEFAULT_SETTINGS = {
  phone: '+216 55 563 355',
  whatsapp: '+216 55 563 355',
  facebook: 'https://www.facebook.com/MsakenTennis09',
  instagram: 'https://www.instagram.com/msaken__tennis_club/',
  address_line1: "Avenue de l'Indépendance",
  address_line2: 'Msaken, Sousse — Tunisie',
  hours: 'Tous les jours · 08:00 – 23:00',
  maps_link: 'https://maps.app.goo.gl/kmvK2bZcYibMuAqm8',
}

export const SETTING_FIELDS = [
  { key: 'phone', label: 'Téléphone', hint: 'Affiché tel quel, ex. +216 55 563 355' },
  { key: 'whatsapp', label: 'Numéro WhatsApp', hint: 'Avec indicatif, ex. +216 55 563 355' },
  { key: 'facebook', label: 'Lien Facebook' },
  { key: 'instagram', label: 'Lien Instagram' },
  { key: 'address_line1', label: 'Adresse (ligne 1)' },
  { key: 'address_line2', label: 'Adresse (ligne 2)' },
  { key: 'hours', label: "Horaires d'ouverture" },
  { key: 'maps_link', label: 'Lien Google Maps (itinéraire)' },
]

// Map pin for the embedded map (club location on Google Maps)
const MAPS_EMBED = 'https://maps.google.com/maps?q=M%27SAKEN%20Tennis%20Club%2C%20Msaken&ll=35.7365216,10.5876913&z=16&output=embed'

const digits = s => (s ?? '').replace(/[^\d]/g, '')

// Turn raw settings into the links the pages use.
export function buildClub(s = DEFAULT_SETTINGS) {
  return {
    name: 'Msaken Tennis Club',
    phoneDisplay: s.phone,
    phoneHref: `tel:+${digits(s.phone)}`,
    whatsapp: `https://wa.me/${digits(s.whatsapp)}`,
    facebook: s.facebook,
    instagram: s.instagram,
    mapsLink: s.maps_link,
    mapsEmbed: MAPS_EMBED,
    address: [s.address_line1, s.address_line2],
    hours: s.hours,
  }
}

export const CLUB = buildClub()

export const DEFAULT_STAFF = [
  { name: 'Najeh Ajroud', role: 'Directeur sportif', extra: 'Responsable de formation', is_lead: true },
  { name: 'Nabil Ghezal', role: 'Directeur technique', is_lead: true },
  { name: 'Mohamed Graa', role: "Responsable de l'école", extra: 'Préparateur physique', is_lead: true },
  { name: 'Renold Saizonou', role: 'Responsable Club Junior', is_lead: true },
  ...['Hamdi Bhiri', 'Ilyes Guellim', 'Fares Bouhlel', 'Wadhah Triaa', 'Mohamed Amer Gzara',
    'Mohamed Belhssan', 'Wissem Berriri', 'Mahmoud Bouhlel', 'Adem Gharbi']
    .map(name => ({ name, role: 'Entraîneur', is_lead: false })),
]

export const DEFAULT_EVENTS = [
  {
    title: 'ITF World Tennis Tour Juniors', kind: 'Tournoi international', featured: true,
    when_label: 'Saison 2025 — Msaken Tennis Club', link_label: 'Suivre les tournois',
    body: "Une étape historique pour le club : accueillir le circuit mondial junior de l'ITF à Msaken. Un tournoi rempli de passion, de fair-play et de souvenirs inoubliables.",
    details: 'Circuit: ITF World Tennis Tour\nCatégorie: Juniors\nOrganisateur: Msaken TC',
  },
  {
    title: 'HolaSol Team Cup', kind: 'Tournoi par équipes', when_label: 'Mars 2026', link_label: 'Voir les résultats',
    body: "Un tournoi aux couleurs de notre partenaire HolaSol Energie. Plus qu'une compétition : une fête de l'esprit d'équipe.",
  },
  {
    title: 'Championnats du club', kind: 'Compétition interne', when_label: 'Toute la saison', link_label: "S'inscrire",
    body: 'Championnats saisonniers et rencontres entre membres. Inscriptions ouvertes depuis votre espace membre.',
  },
  {
    title: 'Programmes jeunes & adultes', kind: 'Académie', when_label: 'Chaque semaine', link_label: 'Rejoindre un groupe',
    body: "Séances d'entraînement encadrées par nos entraîneurs, de l'initiation à la compétition.",
  },
]
