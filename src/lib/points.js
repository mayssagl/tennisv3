// Player skill level config.
export const LEVELS = [
  { key: 'beginner',     label: 'Débutant' },
  { key: 'junior',       label: 'Junior' },
  { key: 'intermediate', label: 'Intermédiaire' },
  { key: 'advanced',     label: 'Avancé' },
  { key: 'competitor',   label: 'Compétiteur' },
]
export const levelLabel = k => LEVELS.find(l => l.key === k)?.label ?? 'Débutant'
