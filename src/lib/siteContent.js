import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { DEFAULT_SETTINGS, DEFAULT_STAFF, DEFAULT_EVENTS, buildClub } from './club'

const DEFAULTS = {
  club: buildClub(DEFAULT_SETTINGS),
  staff: DEFAULT_STAFF,
  events: DEFAULT_EVENTS,
  banner: null,
}

// One shared request per page load; every component reuses it.
let pending = null

async function fetchContent() {
  const [ev, st, se, an] = await Promise.all([
    supabase.from('site_events').select('*').eq('visible', true).order('sort_order').order('created_at'),
    supabase.from('staff_members').select('*').order('sort_order').order('created_at'),
    supabase.from('site_settings').select('key,value'),
    supabase.from('announcements').select('id,title,body,created_at,pinned')
      .eq('is_public', true).order('pinned', { ascending: false }).order('created_at', { ascending: false }).limit(1),
  ])

  // Any table missing (migration not run yet) or empty -> keep the defaults for that part.
  const settings = { ...DEFAULT_SETTINGS }
  ;(se.data ?? []).forEach(r => { if (r.value?.trim()) settings[r.key] = r.value.trim() })

  return {
    club: buildClub(settings),
    staff: !st.error && st.data?.length ? st.data : DEFAULT_STAFF,
    events: !ev.error && ev.data?.length ? ev.data : DEFAULT_EVENTS,
    banner: !an.error ? an.data?.[0] ?? null : null,
  }
}

export function loadSiteContent({ fresh = false } = {}) {
  if (!pending || fresh) pending = fetchContent().catch(() => DEFAULTS)
  return pending
}

export function useSiteContent() {
  const [content, setContent] = useState(DEFAULTS)
  useEffect(() => {
    let alive = true
    loadSiteContent().then(c => { if (alive) setContent(c) })
    return () => { alive = false }
  }, [])
  return content
}
