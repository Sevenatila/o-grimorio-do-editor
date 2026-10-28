import { useEffect, useId, useRef, useState } from 'react'
import type { Project } from '../data/content'
import { FrameCorners } from './Ornaments'

const playbackEvent = 'grimorio:media-play'

export function VideoCard({ project, hero = false }: { project: Project; hero?: boolean }) {
  const [localSource, setLocalSource] = useState('')
  const [error, setError] = useState(false)
  const [youtubeActive, setYoutubeActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const instanceId = useId()
  const source = localSource || project.src
  const isYouTube = Boolean(project.youtubeId && !source)
  const youtubeUrl = `https://www.youtube.com/shorts/${project.youtubeId}`
  useEffect(() => () => { if (localSource) URL.revokeObjectURL(localSource) }, [localSource])
  useEffect(() => {
    const stopPlayback = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== instanceId) {
        setYoutubeActive(false)
        videoRef.current?.pause()
      }
    }
    document.addEventListener(playbackEvent, stopPlayback)
    return () => document.removeEventListener(playbackEvent, stopPlayback)
  }, [instanceId])
  useEffect(() => {
    if (youtubeActive) iframeRef.current?.focus({ preventScroll: true })
  }, [youtubeActive])

  const announcePlayback = () => document.dispatchEvent(new CustomEvent(playbackEvent, { detail: instanceId }))

  return <div className={`video-card ${hero ? 'hero-video' : ''} ${isYouTube ? 'youtube-card' : ''} ${!hero && project.format === 'portrait' ? 'portrait-video' : ''}`}>
    <div id={hero ? 'demoreel-player' : undefined} className="video-frame" tabIndex={-1}>
      {isYouTube ? <div className="youtube-player">
        {youtubeActive ? <iframe
          ref={iframeRef}
          src={`https://www.youtube-nocookie.com/embed/${project.youtubeId}?autoplay=1&playsinline=1&rel=0&hl=pt-BR`}
          title={`YouTube — ${project.title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        /> : <button className="youtube-launch" aria-label={`Reproduzir ${project.title}`} onClick={() => { announcePlayback(); setYoutubeActive(true) }}>
          <img src={project.poster} alt="" loading={hero ? 'eager' : 'lazy'} />
          <span className="youtube-play-label"><span className="play-mark" aria-hidden="true">▷</span><span>Assistir ao vídeo</span></span>
        </button>}
      </div> : <>
        <video ref={videoRef} controls playsInline preload="none" poster={project.poster} src={source || undefined} aria-label={project.title} onError={() => setError(true)} onPlay={announcePlayback}>
          {project.captions && <track kind="captions" src={project.captions} srcLang="pt-BR" label="Português" default/>}
        </video>
        {(!source || error) && <div className="video-placeholder"><span className="play-mark" aria-hidden="true">▷</span><span>{error ? 'Não foi possível carregar este vídeo' : hero ? 'Seu próximo olhar começa aqui' : 'Um novo conto está por vir'}</span><small>{error ? 'Tente outro arquivo local.' : 'Vídeo pendente · prévia do player'}</small><label className="file-picker">Selecionar vídeo local<input type="file" accept="video/*" onChange={event => { const file = event.target.files?.[0]; if (file) { setError(false); setLocalSource(URL.createObjectURL(file)) } }}/></label></div>}
      </>}
      <FrameCorners/>
    </div>
    {localSource && <p className="media-note">Prévia local · arquivo apenas neste navegador.</p>}
    {!hero && <div className="video-caption"><span className="eyebrow">{project.category}</span><h3>{project.title}</h3>{project.description && <p>{project.description}</p>}</div>}
    {isYouTube && <a className="text-link" href={youtubeUrl} target="_blank" rel="noreferrer">Abrir no YouTube <span aria-hidden="true">↗</span></a>}
  </div>
}
