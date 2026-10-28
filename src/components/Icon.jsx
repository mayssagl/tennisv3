// Lightweight inline SVG icon set (stroke = currentColor). No emoji.
const P = {
  calendar: <><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/></>,
  bulb: <><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3Z"/></>,
  bag: <><path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></>,
  racket: <><circle cx="9" cy="9" r="5.5"/><path d="m13 13 6.5 6.5"/><path d="M6.5 6.5l5 5M9 6l3 3M6 9l3 3"/></>,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/>,
  trophy: <><path d="M8 4h8v3a4 4 0 0 1-8 0V4Z"/><path d="M8 5H5v1a3 3 0 0 0 3 3M16 5h3v1a3 3 0 0 1-3 3"/><path d="M12 11v4M9 20h6M10 16h4v4h-4z"/></>,
  tag: <><path d="M3 12 12 3h6v6l-9 9-6-6Z"/><circle cx="14.5" cy="7.5" r="1.3"/></>,
  star: <path d="m12 3 2.5 5.5 6 .5-4.5 4 1.3 5.9L12 16l-5.3 2.9L8 13l-4.5-4 6-.5L12 3Z"/>,
  moon: <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>,
  users: <><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3 3 0 0 1 0 5.6M20.5 20a5 5 0 0 0-3.5-4.8"/></>,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></>,
  court: <><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M12 5v14M3 12h18M7 9v6M17 9v6"/></>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM8 11h8M8 15h6"/></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
  cash: <><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></>,
  user: <><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></>,
  logout: <><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 12h10M17 9l3 3-3 3"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  check: <path d="M5 13l4 4L19 7"/>,
  x: <path d="M6 6l12 12M18 6 6 18"/>,
  trash: <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13h10l1-13"/></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z"/><path d="M14 6l4 4"/></>,
  clock: <><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></>,
  coin: <><circle cx="12" cy="12" r="8"/><path d="M12 8v8M9.5 9.8a2.4 2.4 0 0 1 2.5-1.6c1.4 0 2.2.8 2.2 1.7 0 2-4.4 1.3-4.4 3.3 0 .9.9 1.7 2.3 1.7a2.4 2.4 0 0 0 2.4-1.5"/></>,
  medal: <><circle cx="12" cy="15" r="5"/><path d="M12 12.5l1.3 2.6 2.7.2-2 1.8.6 2.6-2.6-1.4-2.6 1.4.6-2.6-2-1.8 2.7-.2z"/><path d="M8.5 9 6 3M15.5 9 18 3"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9.5" r="1.6"/><path d="M3 17l5-4 4 3 3-2.5 6 5"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  upload: <><path d="M12 16V4M8 8l4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></>,
  send: <><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z"/></>,
  phone: <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"/>,
  whatsapp: <><path d="M4 20l1.3-4A8 8 0 1 1 8.2 19L4 20Z"/><path d="M9.2 8.6c.2-.4.6-.4.8 0l.6 1.3c.1.3 0 .5-.2.7l-.4.4a5 5 0 0 0 2.9 2.9l.4-.4c.2-.2.5-.3.7-.2l1.3.6c.4.2.4.6 0 .8-.6.6-1.4.9-2.2.6a8 8 0 0 1-4.5-4.5c-.3-.8 0-1.6.6-2.2Z"/></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/></>,
  facebook: <path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2.5H8V14h2.5v6.5H14V14h2.5l.5-3.5h-3V8Z"/>,
  instagram: <><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r=".6"/></>,
  up: <path d="m6 15 6-6 6 6"/>,
  down: <path d="m6 9 6 6 6-6"/>,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></>,
  globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
  layout: <><rect x="3.5" y="4" width="17" height="16" rx="1.5"/><path d="M3.5 9h17M9 9v11"/></>,
  partner: <><circle cx="8" cy="9" r="3"/><circle cx="17" cy="9" r="3"/><path d="M2 20a6 6 0 0 1 12 0M11 20a6 6 0 0 1 11-3.5"/></>,
}
export default function Icon({ name, className = 'ic', style }) {
  return (
    <svg className={className} viewBox="0 0 24 24" stroke="currentColor" style={style}>
      {P[name] ?? null}
    </svg>
  )
}
