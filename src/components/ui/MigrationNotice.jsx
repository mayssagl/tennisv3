import Icon from '../Icon'

// Shown on admin pages that need supabase/migration_v4.sql.
export default function MigrationNotice() {
  return (
    <div className="warn-box">
      <Icon name="info" />
      <div>
        <strong>Une mise à jour de la base de données est nécessaire.</strong>
        <div style={{ marginTop: 4 }}>
          Ouvrez Supabase → <b>SQL Editor</b>, collez le contenu du fichier
          <code style={{ margin: '0 4px' }}>supabase/migration_v4.sql</code> et cliquez sur <b>Run</b>.
          Rechargez ensuite cette page.
        </div>
      </div>
    </div>
  )
}
