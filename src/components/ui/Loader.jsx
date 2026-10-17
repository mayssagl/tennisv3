export default function Loader({ full }) {
  return <div className={`loader${full ? ' full' : ''}`}><div className="spin" /></div>
}
