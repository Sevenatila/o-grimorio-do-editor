import { useEffect, useRef, useState } from 'react'
import { testimonials, type Testimonial } from '../data/content'
import { ArrowIcon, FrameCorners } from './Ornaments'
import { SectionHeading } from './SectionHeading'
import './testimonials.css'

export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [active, setActive] = useState(0)
  const [atEnd, setAtEnd] = useState(false)
  const [selected, setSelected] = useState<Testimonial | null>(null)

  function updatePosition() {
    const track = trackRef.current
    if (!track || track.children.length < 2) return
    const first = track.children[0] as HTMLElement
    const second = track.children[1] as HTMLElement
    setActive(Math.round(track.scrollLeft / (second.offsetLeft - first.offsetLeft)))
    setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 2)
  }

  useEffect(() => {
    const observer = new ResizeObserver(updatePosition)
    if (trackRef.current) observer.observe(trackRef.current)
    return () => observer.disconnect()
  }, [])

  function navigate(direction: number) {
    const track = trackRef.current
    if (!track) return
    const next = Math.max(0, Math.min(testimonials.length - 1, active + direction))
    const card = track.children[next] as HTMLElement
    const first = track.children[0] as HTMLElement
    track.scrollTo({ left: card.offsetLeft - first.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  function openFeedback(testimonial: Testimonial) {
    setSelected(testimonial)
    dialogRef.current?.showModal()
  }

  return <section id="feedbacks" className="section testimonials" aria-labelledby="testimonials-title">
    <SectionHeading id="testimonials-title" initial="F" continuation="eedbacks" title="Dos Clientes"/>
    <p>Histórias reais de quem já confiou no meu trabalho.</p>
    <div ref={trackRef} id="feedback-track" className="feedback-track" role="region" aria-label="Feedbacks recebidos dos clientes" tabIndex={0} onScroll={updatePosition} onKeyDown={event => {
      if (event.target !== event.currentTarget) return
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        navigate(event.key === 'ArrowRight' ? 1 : -1)
      }
    }}>
      {testimonials.map((testimonial, index) => <article key={testimonial.id} className="feedback-card" aria-label={`Feedback ${index + 1}`}>
        <FrameCorners/>
        <button className="feedback-preview" onClick={() => openFeedback(testimonial)} aria-label={`Ampliar feedback ${index + 1}`} aria-haspopup="dialog">
          <img src={testimonial.image} alt={testimonial.alt} loading="lazy" width="1080" height="1440"/>
          <span>Ver conversa completa <ArrowIcon/></span>
        </button>
      </article>)}
    </div>
    <div className="gallery-controls feedback-controls">
      <button className="round-button" aria-label="Feedback anterior" aria-controls="feedback-track" disabled={active === 0} onClick={() => navigate(-1)}><ArrowIcon direction="left"/></button>
      <span className="feedback-count" aria-live="polite">{active + 1} de {testimonials.length}</span>
      <button className="round-button" aria-label="Próximo feedback" aria-controls="feedback-track" disabled={atEnd} onClick={() => navigate(1)}><ArrowIcon direction="right"/></button>
    </div>
    <dialog ref={dialogRef} className="feedback-dialog" aria-labelledby="feedback-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialogRef.current?.close() }} onClose={() => setSelected(null)}>
      <div className="feedback-dialog-header"><h3 id="feedback-dialog-title">Feedback do cliente</h3><button className="round-button" aria-label="Fechar feedback ampliado" autoFocus onClick={() => dialogRef.current?.close()}>×</button></div>
      {selected && <img src={selected.image} alt={selected.alt}/>}
    </dialog>
  </section>
}
