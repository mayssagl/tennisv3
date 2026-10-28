import logo from '../assets/logo.png'

export default function Logo({ to, size = 42, className = '' }) {
  const Tag = to ? 'a' : 'div'
  return (
    <Tag href={to} className={`brand ${className}`}>
      <img src={logo} alt="Msaken Tennis Club" style={{ width: size, height: size }} />
      <span className="name">Msaken Tennis Club<small>Depuis 2009</small></span>
    </Tag>
  )
}
