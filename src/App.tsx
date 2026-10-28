import { useEffect, useRef, useState } from 'react'
import { navigation, projects, site, skills } from './data/content'
import { SectionHeading } from './components/SectionHeading'
import { Flourish, SkillSymbol } from './components/Ornaments'
import { VideoCard } from './components/VideoCard'
import { Testimonials } from './components/Testimonials'

function Header() {
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  return <header className="header"><a className="identity" href="#inicio" aria-label="O Grimório do Editor — início"><span className="seal" aria-hidden="true">O</span><span>O Grimório<span>do Editor</span></span></a><button ref={toggleRef} className="menu-toggle" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}><span/><span/><span/></button><nav id="main-navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label="Navegação principal" onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus() } }}>{navigation.map(item => <a key={item.id} href={`#${item.id}`} onClick={() => setOpen(false)}>{item.label}</a>)}</nav></header>
}

function Hero() {
  return <section className="hero" aria-labelledby="hero-title"><div className="hero-layout"><VideoCard project={site.hero.video} hero/><div className="hero-copy"><p className="eyebrow">Marcos · Editor & Storyteller</p><h1 id="hero-title">{site.hero.title}</h1><p>{site.hero.description}</p><a className="button button-primary" href="#demoreel-player" onClick={event => { event.preventDefault(); const player = document.getElementById('demoreel-player') as HTMLVideoElement; player.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' }); if (player.currentSrc) { void player.play().catch(() => player.focus()) } else { player.closest('.video-frame')?.querySelector<HTMLInputElement>('input')?.click() } }}>Assista ao demoreel <span aria-hidden="true">↗</span></a></div></div><div className="hero-bottom"><Flourish/><p>A mesma essência, novos horizontes.</p><span className="eyebrow">Audiovisual com propósito</span></div></section>
}

function Journey() {
  return <section id="jornada" className="section journey" aria-labelledby="journey-title"><div className="journey-copy reveal"><SectionHeading id="journey-title" initial="D" continuation="e onde vim e onde cheguei:" title="A Jornada"/>{site.journey.map((paragraph, index) => <p className={index === 0 ? 'journey-opening' : ''} key={paragraph}>{paragraph}</p>)}</div><figure className="journey-art"><img src="/assets/city-scene.svg" width="800" height="480" loading="lazy" alt="Ilustração provisória em tinta sépia: artesão contemplando uma cidade medieval."/><figcaption>O cenário muda. A essência permanece.</figcaption></figure></section>
}

function PortfolioGallery() {
  const [category, setCategory] = useState('Todos')
  const [index, setIndex] = useState(0)
  const categories = ['Todos', ...new Set(projects.map(project => project.category))]
  const filtered = projects.filter(project => category === 'Todos' || category === project.category)
  const active = filtered[index] || filtered[0]
  return <section id="acervo" className="section portfolio" aria-labelledby="portfolio-title"><div className="section-intro reveal"><SectionHeading id="portfolio-title" initial="A" continuation="cervo de contos" title="Portfólio"/><p>Aqui estão alguns dos projetos que ganharão vida através da edição. Cada vídeo é um conto, com um objetivo e um resultado.</p><p className="pending-label">Acervo demonstrativo · vídeos reais aguardam seleção</p></div><div className="portfolio-tabs" role="group" aria-label="Filtrar projetos demonstrativos">{categories.map(item => <button key={item} aria-pressed={category === item} className={category === item ? 'active' : ''} onClick={() => { setCategory(item); setIndex(0) }}>{item}</button>)}</div><div className="portfolio-stage" aria-live="polite"><VideoCard key={active.id} project={active}/></div><div className="gallery-controls"><button className="round-button" aria-label="Projeto anterior" disabled={filtered.length < 2} onClick={() => setIndex((index - 1 + filtered.length) % filtered.length)}>←</button><div className="gallery-dots" aria-label="Selecionar projeto">{filtered.map((project, position) => <button key={project.id} className={position === index ? 'active' : ''} aria-label={`Ver ${project.title}`} aria-current={position === index ? 'true' : undefined} onClick={() => setIndex(position)}/>)}</div><button className="round-button" aria-label="Próximo projeto" disabled={filtered.length < 2} onClick={() => setIndex((index + 1) % filtered.length)}>→</button></div><a className="text-link" href={site.channel} target="_blank" rel="noreferrer">Visite o canal do editor <span aria-hidden="true">↗</span></a></section>
}

function SkillCard({ skill }: { skill: typeof skills[number] }) {
  return <article className="skill-card"><SkillSymbol kind={skill.symbol}/><div><h3>{skill.title}</h3><p>{skill.description}</p></div></article>
}

function Arsenal() {
  return <section id="grimorio" className="section arsenal" aria-labelledby="arsenal-title"><div className="section-intro reveal"><SectionHeading id="arsenal-title" initial="O" continuation="meu arsenal" title="O Grimório"/><p className="arsenal-subtitle">Como eu construo o seu vídeo.</p><p>{site.arsenal}</p></div><div className="skills-grid">{skills.map(skill => <SkillCard key={skill.symbol} skill={skill}/>)}</div></section>
}

function ContactEpilogue() {
  const [notice, setNotice] = useState(false)
  const whatsapp = site.whatsapp.replace(/\D/g, '')
  return <section id="epilogo" className="section epilogue" aria-labelledby="epilogue-title"><div className="epilogue-copy reveal"><SectionHeading id="epilogue-title" initial="V" continuation="amos contar" title="A Sua História?"/><p>{site.contact}</p>{whatsapp ? <a className="button button-primary" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(site.message)}`} target="_blank" rel="noreferrer">Escreva o Seu Próximo Capítulo <span aria-hidden="true">↗</span></a> : <button className="button button-primary" aria-expanded={notice} aria-controls="contact-notice" onClick={() => setNotice(!notice)}>Escreva o Seu Próximo Capítulo <span aria-hidden="true">↗</span></button>}<p id="contact-notice" className="contact-notice" role="status">{notice ? 'O contato por WhatsApp será disponibilizado em breve.' : ''}</p></div><figure className="epilogue-art"><img src="/assets/epilogue-scene.svg" width="800" height="400" loading="lazy" alt="Ilustração provisória de livros, pena, pergaminho e vela sobre uma mesa."/><figcaption>Todo grande projeto começa<br/>com uma boa conversa.</figcaption></figure></section>
}

function Footer() {
  return <footer className="footer"><Flourish/><a href="#inicio">O Grimório do Editor</a><p>Marcos · Edição de vídeo & Storytelling</p><span className="eyebrow">Histórias feitas para permanecer.</span></footer>
}

export default function App() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let dispose: (() => void) | undefined
    let cancelled = false
    const setup = async () => {
      try {
        const base = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5'
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import(`${base}/+esm`), import(`${base}/ScrollTrigger.js/+esm`)])
        if (cancelled) return
        gsap.registerPlugin(ScrollTrigger)
        const context = gsap.context(() => {
          document.querySelectorAll('.reveal').forEach(section => gsap.from(section, { y: 14, opacity: 0, duration: .65, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 94%', once: true } }))
        })
        dispose = () => context.revert()
      } catch { }
    }
    void setup()
    return () => { cancelled = true; dispose?.() }
  }, [])
  return <><a className="skip-link" href="#conteudo">Pular para o conteúdo</a><div className="manuscript" id="inicio"><Header/><main id="conteudo"><Hero/><Journey/><PortfolioGallery/><Arsenal/><Testimonials/><ContactEpilogue/></main><Footer/></div></>
}
