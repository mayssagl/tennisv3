// Booking rules shared by the player and admin pages.
export const SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

export const endTime = slot => String(Number(slot.slice(0, 2)) + 1).padStart(2, '0') + ':00'

export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export const formatDate = iso =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'

// Readable messages for the errors the database raises.
export function bookingError(err, { forAdmin = false } = {}) {
  const msg = err?.message ?? ''
  // Only happens if the old points charge is still active in the database
  // (supabase/migration_v4.sql not run yet).
  if (msg.includes('INSUFFICIENT_POINTS')) {
    return forAdmin
      ? "Réservation bloquée par l'ancien système de points : exécutez supabase/migration_v4.sql dans Supabase."
      : 'Réservation impossible pour le moment. Contactez le club.'
  }
  if (msg.includes('ONLY_ADMIN_CAN_CHANGE_ROLE')) return 'Seul un administrateur peut changer un rôle.'
  return msg || 'Une erreur est survenue.'
}
