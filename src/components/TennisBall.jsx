import tnImg from '../assets/tn.png'

export default function TennisBall({ echo = false, delay = 0, fade = .4 }) {
  if (echo) {
    return (
      <div className="tb-fly tb-echo" style={{ animationDelay: `${delay}s` }} aria-hidden="true">
        <div className="tb-echo-dot" style={{ opacity: fade }} />
      </div>
    )
  }

  return (
    <div className="tb-fly" aria-hidden="true">
      <div className="tb-shadow" />
      <div className="tb-squash">
        <div className="tb-spin">
          <img src={tnImg} alt="" className="tb-img" />
        </div>
      </div>
    </div>
  )
}
