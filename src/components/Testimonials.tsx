import { useEffect, useRef, useState } from 'react'
import { useContent } from '../context/ContentContext'
import { ArrowIcon, FrameCorners } from './Ornaments'
import { SectionHeading } from './SectionHeading'
import './testimonials.css'

export function Testimonials() {
  const { feedbacks } = useContent()
  const testimonials = feedbacks.items
  const trackRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState(0)
  const [atEnd, setAtEnd] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = testimonials.find(item => item.id === selectedId)
  function updatePosition() {
    const track = trackRef.current
    if (!track || track.children.length < 2) { setActive(0); setAtEnd(true); return }
    const first = track.children[0] as HTMLElement
    const second = track.children[1] as HTMLElement
    setActive(Math.min(Math.max(0, Math.round(track.scrollLeft / (second.offsetLeft - first.offsetLeft))), testimonials.length - 1))
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2)
  }
  useEffect(() => {
    const observer = new ResizeObserver(updatePosition)
    if (trackRef.current) observer.observe(trackRef.current)
    updatePosition()
    return () => observer.disconnect()
  }, [testimonials.length])
  useEffect(() => { if (!selected && dialogRef.current?.open) dialogRef.current.close() }, [selected])
  function navigate(direction: number) {
    const track = trackRef.current
    if (!track || !testimonials.length) return
    const next = Math.max(0, Math.min(testimonials.length - 1, active + direction))
    const card = track.children[next] as HTMLElement
    const first = track.children[0] as HTMLElement
    track.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <section id="feedbacks" className="section testimonials" aria-labelledby="testimonials-title">
    <SectionHeading id="testimonials-title" {...feedbacks.heading}/><p>{feedbacks.intro}</p>
    {testimonials.length ? <><div ref={trackRef} id="feedback-track" className="feedback-track" role="region" aria-label="Feedbacks recebidos dos clientes" tabIndex={0} onScroll={updatePosition} onKeyDown={event => {
      if (event.target !== event.currentTarget) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); navigate(event.key === 'ArrowRight' ? 1 : -1) }
    }}>
      {testimonials.map((item, index) => <article key={item.id} className="feedback-card" aria-label={'Feedback ' + (index + 1)}>
        <FrameCorners/><button className="feedback-preview" onClick={() => { setSelectedId(item.id); dialogRef.current?.showModal() }} aria-label={'Ampliar feedback ' + (index + 1)} aria-haspopup="dialog">
          {item.image ? <img src={item.image} alt={item.alt} loading="lazy" width="1080" height="1440"/> : <div className="feedback-written"><blockquote>{item.text}</blockquote>{item.name && <strong>{item.name}</strong>}{item.role && <small>{item.role}</small>}</div>}
          <span>{item.image ? 'Ver conversa completa' : 'Ler feedback completo'}<ArrowIcon/></span>
        </button>
      </article>)}
    </div><div className="gallery-controls feedback-controls">
      <button className="round-button" aria-label="Feedback anterior" aria-controls="feedback-track" disabled={active === 0} onClick={() => navigate(-1)}><ArrowIcon direction="left"/></button>
      <span className="feedback-count" aria-live="polite">{Math.min(active + 1, testimonials.length)} de {testimonials.length}</span>
      <button className="round-button" aria-label="Próximo feedback" aria-controls="feedback-track" disabled={atEnd} onClick={() => navigate(1)}><ArrowIcon direction="right"/></button>
    </div></> : <p className="content-empty">{feedbacks.empty}</p>}
    <dialog ref={dialogRef} className="feedback-dialog" aria-labelledby="feedback-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close() }} onClose={() => setSelectedId(null)}>
      <div className="feedback-dialog-header"><h3 id="feedback-dialog-title">Feedback do cliente</h3><button className="round-button" aria-label="Fechar feedback ampliado" autoFocus onClick={() => dialogRef.current?.close()}>×</button></div>
      {selected?.image && <img src={selected.image} alt={selected.alt}/>}
      {selected && (selected.text || selected.name || selected.role) && <div className="feedback-written feedback-written-dialog">{selected.text && <blockquote>{selected.text}</blockquote>}{selected.name && <strong>{selected.name}</strong>}{selected.role && <small>{selected.role}</small>}</div>}
    </dialog>
  </section>
}
