import { useEffect, useRef, useState } from 'react'
import { artwork } from './data/content'
import { useContent, useLocale, useUI } from './context/ContentContext'
import { featuredVideo, isSafeUrl, toProject, type SectionKey, type SiteContent } from './lib/content-model'
import { SectionHeading } from './components/SectionHeading'
import { ArrowIcon, Flourish, SkillSymbol } from './components/Ornaments'
import { VideoCard } from './components/VideoCard'
import { Testimonials } from './components/Testimonials'

const sectionIds: Record<SectionKey, string> = { journey: 'jornada', portfolio: 'acervo', arsenal: 'grimorio', feedbacks: 'feedbacks', contact: 'epilogo' }

function Header() {
  const content = useContent()
  const locale = useLocale()
  const labels = useUI()
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const items = (Object.keys(sectionIds) as SectionKey[]).filter(key => content.visible[key])
  return <header className="header">
    <a className="identity" href="#inicio" aria-label={content.general.name + ' — ' + labels.home}><span className="seal" aria-hidden="true">{[...content.general.name][0]}</span><span className="identity-name">{content.general.name}</span></a>
    <nav id="main-navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label={labels.navigation} onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus() } }}>{items.map(key => <a key={key} href={'#' + sectionIds[key]} onClick={() => setOpen(false)}>{content.navigation[key]}</a>)}</nav>
    <div className="header-tools"><div className="language-switch" role="group" aria-label={labels.language}><a href={'/' + location.hash} hrefLang="pt-BR" lang="pt-BR" aria-label={labels.portuguese} aria-current={locale === 'pt' ? 'page' : undefined}>PT</a><span aria-hidden="true">/</span><a href={'/en' + location.hash} hrefLang="en" lang="en" aria-label={labels.english} aria-current={locale === 'en' ? 'page' : undefined}>EN</a></div><button ref={toggleRef} className="menu-toggle" aria-label={open ? labels.closeMenu : labels.openMenu} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}><span/><span/><span/></button></div>
  </header>
}

function Hero() {
  const content = useContent()
  const entry = featuredVideo(content)
  const playPresentation = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    const frame = document.getElementById('demoreel-player')
    if (!frame) return
    frame.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' })
    const button = frame.querySelector<HTMLButtonElement>('.youtube-launch')
    const video = frame.querySelector('video')
    if (button) button.click()
    else if (video?.currentSrc) void video.play().catch(() => video.focus())
    else if (frame.querySelector('iframe')) frame.querySelector('iframe')?.focus()
    else frame.querySelector<HTMLInputElement>('input')?.click()
  }
  return <section className="hero" aria-labelledby="hero-title">
    {content.hero.desktopBackdrop && <picture className="hero-backdrop" aria-hidden="true"><source media="(min-width: 1050px)" srcSet={content.hero.desktopBackdrop === artwork.heroDesktop.src ? artwork.heroDesktop.srcSet : content.hero.desktopBackdrop} sizes="(min-width: 1500px) 1440px, 100vw"/><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" width="1920" height="1080"/></picture>}
    <div className="hero-layout"><VideoCard key={entry.url} project={{ ...toProject(entry), id: 'demoreel' }} hero/>
      <div className="hero-copy"><p className="eyebrow">{content.general.author} · {content.general.role}</p><h1 id="hero-title">{content.hero.title}</h1><p>{content.hero.description}</p><a className="button button-primary" href="#demoreel-player" onClick={playPresentation}>{content.hero.cta}<ArrowIcon/></a></div>
    </div>
    <div className="hero-bottom"><Flourish/><p>{content.hero.tagline}</p><span className="eyebrow">{content.hero.signature}</span></div>
  </section>
}

function Journey() {
  const { journey } = useContent()
  return <section id="jornada" className="section journey" aria-labelledby="journey-title">
    <div className="journey-copy reveal"><SectionHeading id="journey-title" {...journey.heading}/>{journey.paragraphs.map((paragraph, index) => <p className={index === 0 ? 'journey-opening' : ''} key={index}>{paragraph}</p>)}</div>
    {journey.image && <figure className="journey-art"><img src={journey.image} srcSet={journey.image === artwork.journey.src ? artwork.journey.srcSet : undefined} sizes="(min-width: 1050px) 600px, 100vw" width="1600" height="960" loading="lazy" alt={journey.alt}/><figcaption>{journey.caption}</figcaption></figure>}
  </section>
}

function PortfolioGallery() {
  const content = useContent()
  const labels = useUI()
  const projects = content.portfolio.videos
  const [category, setCategory] = useState(labels.all)
  const [index, setIndex] = useState(0)
  const categories = [labels.all, ...new Set(projects.map(project => project.category))]
  const selectedCategory = categories.includes(category) ? category : labels.all
  const filtered = projects.filter(project => selectedCategory === labels.all || selectedCategory === project.category)
  const safeIndex = Math.min(index, Math.max(0, filtered.length - 1))
  const active = filtered[safeIndex]
  return <section id="acervo" className="section portfolio" aria-labelledby="portfolio-title">
    <div className="section-intro reveal"><SectionHeading id="portfolio-title" {...content.portfolio.heading}/><p>{content.portfolio.intro}</p></div>
    {projects.length > 0 ? <>
      <div className="portfolio-tabs" role="group" aria-label={labels.filter}>{categories.map(item => <button key={item} aria-pressed={selectedCategory === item} className={selectedCategory === item ? 'active' : ''} onClick={() => { setCategory(item); setIndex(0) }}>{item}</button>)}</div>
      <div className="portfolio-stage" aria-live="polite">{active && <VideoCard key={active.id + active.url} project={toProject(active)}><div className="portfolio-playlist" role="group" aria-label={labels.chooseVideo}>{filtered.map((project, position) => <button key={project.id} type="button" aria-label={labels.select + ' ' + project.title} aria-pressed={position === safeIndex} onClick={() => { setIndex(position); requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('.portfolio-playlist button[aria-pressed="true"]')?.focus({ preventScroll: true })) }}><img src={toProject(project).poster} alt="" loading="lazy" width="48" height="64"/><span><small>{String(position + 1).padStart(2, '0')} · {project.category}</small><span>{project.title}</span></span></button>)}</div></VideoCard>}</div>
      <div className="gallery-controls"><button className="round-button" aria-label={labels.previousProject} disabled={filtered.length < 2} onClick={() => setIndex((safeIndex - 1 + filtered.length) % filtered.length)}><ArrowIcon direction="left"/></button>
        <div className="gallery-dots" aria-label={labels.chooseProject}>{filtered.map((project, position) => <button key={project.id} className={position === safeIndex ? 'active' : ''} aria-label={labels.view + ' ' + project.title} aria-current={position === safeIndex ? 'true' : undefined} onClick={() => setIndex(position)}/>)}</div>
        <button className="round-button" aria-label={labels.nextProject} disabled={filtered.length < 2} onClick={() => setIndex((safeIndex + 1) % filtered.length)}><ArrowIcon direction="right"/></button></div>
    </> : <p className="content-empty">{content.portfolio.empty}</p>}
    {content.general.channel && isSafeUrl(content.general.channel) && <a className="text-link" href={content.general.channel} target="_blank" rel="noreferrer">{labels.channel} <ArrowIcon/></a>}
  </section>
}

function SkillCard({ skill }: { skill: SiteContent['arsenal']['skills'][number] }) {
  return <article className="skill-card"><SkillSymbol kind={skill.symbol}/><div><h3>{skill.title}</h3><p>{skill.description}</p></div></article>
}

function Arsenal() {
  const { arsenal } = useContent()
  return <section id="grimorio" className="section arsenal" aria-labelledby="arsenal-title"><div className="section-intro reveal"><SectionHeading id="arsenal-title" {...arsenal.heading}/><p className="arsenal-subtitle">{arsenal.subtitle}</p><p>{arsenal.intro}</p></div><div className="skills-grid">{arsenal.skills.map((skill, index) => <SkillCard key={index} skill={skill}/>)}</div></section>
}

function ContactEpilogue() {
  const content = useContent()
  const [notice, setNotice] = useState(false)
  const whatsapp = content.general.whatsapp.replace(/\D/g, '')
  return <section id="epilogo" className="section epilogue" aria-labelledby="epilogue-title"><div className="epilogue-copy reveal"><SectionHeading id="epilogue-title" {...content.contact.heading}/><p>{content.contact.text}</p>
    {whatsapp ? <a className="button button-primary" href={'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(content.general.message)} target="_blank" rel="noreferrer">{content.contact.cta}<ArrowIcon/></a> : <button className="button button-primary" aria-expanded={notice} aria-controls="contact-notice" onClick={() => setNotice(!notice)}>{content.contact.cta}<ArrowIcon/></button>}
    <p id="contact-notice" className="contact-notice" role="status">{notice ? content.contact.unavailable : ''}</p></div>
    {(content.contact.image || content.contact.desktopImage) && <figure className="epilogue-art"><picture>{content.contact.desktopImage && <source media="(min-width: 1050px)" srcSet={content.contact.desktopImage === artwork.epilogue.desktopSrc ? artwork.epilogue.desktopSrcSet : content.contact.desktopImage} sizes="(min-width: 1600px) 680px, 50vw" width="1200" height="800"/>}<img src={content.contact.image || content.contact.desktopImage} srcSet={content.contact.image === artwork.epilogue.src ? artwork.epilogue.srcSet : undefined} sizes="100vw" width="1600" height="800" loading="lazy" alt={content.contact.alt}/></picture><figcaption>{content.contact.caption}</figcaption></figure>}
  </section>
}

function Footer() {
  const content = useContent()
  return <footer className="footer"><Flourish/><a href="#inicio">{content.general.name}</a><p>{content.footer.description}</p><span className="eyebrow">{content.footer.tagline}</span></footer>
}

export default function App() {
  const content = useContent()
  const locale = useLocale()
  const labels = useUI()
  useEffect(() => {
    const root = document.documentElement
    root.lang = locale === 'en' ? 'en' : 'pt-BR'
    const palette = content.appearance
    for (const [name, value] of Object.entries({ parchment: palette.paper, ink: palette.ink, gold: palette.gold, burgundy: palette.accent, night: palette.night })) root.style.setProperty('--' + name, value)
    root.style.setProperty('--heading', "'" + palette.headingFont + "', Georgia, serif")
    root.style.setProperty('--display-gold', palette.gold.toLowerCase() === '#a3874f' ? '#e1c789' : palette.gold)
    root.style.setProperty('--body-font', "'" + palette.bodyFont + "', Georgia, serif")
    root.style.setProperty('--paper-texture', palette.texture ? 'url(' + JSON.stringify(new URL(palette.texture, location.origin).href) + ')' : 'none')
    document.title = content.general.name + ' — ' + content.general.author
    document.querySelector('meta[name="description"]')?.setAttribute('content', content.hero.description)
  }, [content, locale])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let dispose: (() => void) | undefined
    let cancelled = false
    const setup = async () => {
      try {
        const base = 'https://cdn.jsdelivr.net/npm/gsap@3.12.5'
        const [{ gsap }, { ScrollTrigger }] = await Promise.all([import(base + '/+esm'), import(base + '/ScrollTrigger.js/+esm')])
        if (cancelled) return
        gsap.registerPlugin(ScrollTrigger)
        const context = gsap.context(() => document.querySelectorAll('.reveal').forEach(section => gsap.from(section, { y: 14, opacity: 0, duration: .65, ease: 'power2.out', scrollTrigger: { trigger: section, start: 'top 94%', once: true } })))
        dispose = () => context.revert()
      } catch {}
    }
    void setup()
    return () => { cancelled = true; dispose?.() }
  }, [])
  return <><a className="skip-link" href="#conteudo">{labels.skip}</a><div className="manuscript" id="inicio"><Header/><main id="conteudo"><Hero/>{content.visible.journey && <Journey/>}{content.visible.portfolio && <PortfolioGallery/>}{content.visible.arsenal && <Arsenal/>}{content.visible.feedbacks && <Testimonials/>}{content.visible.contact && <ContactEpilogue/>}</main><Footer/></div></>
}
