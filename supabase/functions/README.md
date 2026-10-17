# Supabase Edge Functions for Flouci

Set these secrets in Supabase Dashboard > Project Settings > Edge Functions > Secrets:

- FLOUCI_APP_TOKEN
- FLOUCI_APP_SECRET
- SUPABASE_SERVICE_ROLE_KEY
- SITE_URL

Optional overrides:
- FLOUCI_BASE_URL
- FLOUCI_VERIFY_URL

Deploy with:

supabase functions deploy flouci-initiate
supabase functions deploy flouci-verify
