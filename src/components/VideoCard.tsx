import { useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { mediaLabels, type Project } from '../data/content'
import { loadYouTubeAPI, type YouTubePlayer } from '../lib/youtube'
import { Flourish, FrameCorners } from './Ornaments'
import './video-card.css'

const playbackEvent = 'grimorio:media-play'

export function VideoCard({ project, hero = false }: { project: Project; hero?: boolean }) {
  const [localSource, setLocalSource] = useState('')
  const [error, setError] = useState(false)
  const [youtubeActive, setYoutubeActive] = useState(false)
  const [youtubeReady, setYoutubeReady] = useState(false)
  const [youtubeError, setYoutubeError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YouTubePlayer | null>(null)
  const readyRef = useRef(false)
  const apiFailed = useRef(false)
  const playRequested = useRef(false)
  const launchRef = useRef<HTMLButtonElement>(null)
  const instanceId = useId()
  const source = localSource || project.src
  const isYouTube = Boolean(project.youtubeId && !source)
  const youtubeUrl = `https://www.youtube.com/shorts/${project.youtubeId}`
  useEffect(() => () => { if (localSource) URL.revokeObjectURL(localSource) }, [localSource])
  useEffect(() => {
    const stopPlayback = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== instanceId) {
        playRequested.current = false
        if (readyRef.current) playerRef.current?.stopVideo()
        setYoutubeActive(false)
        videoRef.current?.pause()
      }
    }
    document.addEventListener(playbackEvent, stopPlayback)
    return () => document.removeEventListener(playbackEvent, stopPlayback)
  }, [instanceId])
  useEffect(() => {
    const host = hostRef.current
    if (!isYouTube || !host || !project.youtubeId) return
    let disposed = false
    let player: YouTubePlayer | undefined
    readyRef.current = false
    apiFailed.current = false
    playRequested.current = false
    setYoutubeReady(false)
    setYoutubeError('')

    // The host owns the iframe so the API can safely destroy it, including in StrictMode.
    const iframe = document.createElement('iframe')
    const parameters = new URLSearchParams({ enablejsapi: '1', origin: location.origin, autoplay: '0', playsinline: '1', rel: '0', hl: 'pt-BR' })
    iframe.src = `https://www.youtube-nocookie.com/embed/${project.youtubeId}?${parameters}`
    iframe.title = `YouTube — ${project.title}`
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'
    iframe.allowFullscreen = true
    iframe.loading = hero ? 'eager' : 'lazy'
    host.append(iframe)
    iframeRef.current = iframe

    void loadYouTubeAPI().then(api => {
      if (disposed) return
      player = new api.Player(iframe, {
        events: {
          onReady: event => {
            if (disposed) return
            readyRef.current = true
            setYoutubeReady(true)
            if (playRequested.current) event.target.playVideo()
          },
          onStateChange: event => {
            if (disposed || event.data !== 1) return
            if (!playRequested.current) { event.target.stopVideo(); return }
            setYoutubeError('')
            announcePlayback()
            const frame = iframeRef.current
            if (frame && document.activeElement === frame.closest('.video-frame')) frame.focus({ preventScroll: true })
          },
          onError: () => { if (!disposed) setYoutubeError(mediaLabels.unavailable) },
          onAutoplayBlocked: () => { if (!disposed) setYoutubeError(mediaLabels.playbackBlocked) },
        },
      })
      playerRef.current = player
    }).catch(() => {
      if (!disposed) { apiFailed.current = true; setYoutubeError(mediaLabels.unavailable) }
    })

    return () => {
      disposed = true
      readyRef.current = false
      playRequested.current = false
      playerRef.current = null
      iframeRef.current = null
      player?.destroy()
      host.replaceChildren()
    }
  }, [isYouTube, project.youtubeId, project.title, hero])
  useEffect(() => {
    if (!youtubeActive) return
    const frame = requestAnimationFrame(() => {
      const iframe = iframeRef.current
      iframe?.focus({ preventScroll: true })
      if (iframe && document.activeElement !== iframe) iframe.closest<HTMLElement>('.video-frame')?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [youtubeActive])

  const announcePlayback = () => document.dispatchEvent(new CustomEvent(playbackEvent, { detail: instanceId }))
  const startYouTube = () => {
    announcePlayback()
    playRequested.current = true
    setYoutubeError(apiFailed.current ? mediaLabels.unavailable : '')
    // Reveal the prepared player and issue playVideo during the same user gesture.
    flushSync(() => setYoutubeActive(true))
    if (readyRef.current) playerRef.current?.playVideo()
  }
  const backToCover = () => {
    playRequested.current = false
    if (readyRef.current) playerRef.current?.stopVideo()
    setYoutubeActive(false)
    requestAnimationFrame(() => launchRef.current?.focus({ preventScroll: true }))
  }

  return <div className={`video-card ${hero ? 'hero-video' : ''} ${isYouTube ? 'youtube-card' : ''} ${project.format === 'portrait' ? 'portrait-video' : ''} ${youtubeActive ? 'is-playing' : ''}`}>
    {isYouTube && <div className="video-heading"><span>{hero ? mediaLabels.presentation : mediaLabels.collection}</span><span className="video-format">{mediaLabels.format}</span></div>}
    <div id={hero ? 'demoreel-player' : undefined} className="video-frame" role="group" aria-label={project.title} tabIndex={-1}>
      {isYouTube ? <div className="youtube-player">
        <div ref={hostRef} className="youtube-host" aria-hidden={!youtubeActive}/>
        {!youtubeActive && <button ref={launchRef} className="youtube-launch" aria-label={`Reproduzir ${project.title}`} onClick={startYouTube}>
          <img src={project.poster} alt="" loading={hero ? 'eager' : 'lazy'} />
          <span className="youtube-play-label">
            <span className="play-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M12 7.5 25 16 12 24.5Z" fill="currentColor"/></svg></span>
            <span className="youtube-play-copy"><span>{mediaLabels.play}</span><span>{mediaLabels.playHint}</span></span>
          </span>
        </button>}
      </div> : <>
        <video ref={videoRef} controls playsInline preload="none" poster={project.poster} src={source || undefined} aria-label={project.title} onError={() => setError(true)} onPlay={announcePlayback}>
          {project.captions && <track kind="captions" src={project.captions} srcLang="pt-BR" label="Português" default/>}
        </video>
        {(!source || error) && <div className="video-placeholder"><span className="play-mark" aria-hidden="true">▷</span><span>{error ? 'Não foi possível carregar este vídeo' : hero ? 'Seu próximo olhar começa aqui' : 'Um novo conto está por vir'}</span><small>{error ? 'Tente outro arquivo local.' : 'Vídeo pendente · prévia do player'}</small><label className="file-picker">Selecionar vídeo local<input type="file" accept="video/*" onChange={event => { const file = event.target.files?.[0]; if (file) { setError(false); setLocalSource(URL.createObjectURL(file)) } }}/></label></div>}
      </>}
      <FrameCorners/>
    </div>
    {isYouTube && youtubeActive && (youtubeError || !youtubeReady) && <p className="media-note youtube-status" role="status">{youtubeError || mediaLabels.loading}</p>}
    {localSource && <p className="media-note">Prévia local · arquivo apenas neste navegador.</p>}
    {(!hero || isYouTube) && <div className="video-caption">
      {!hero && <><Flourish className="video-flourish"/><span className="eyebrow">{project.category}</span><h3>{project.title}</h3>{project.description && <p>{project.description}</p>}</>}
      {isYouTube && <div className="video-actions">
        {youtubeActive && <button className="video-reset" onClick={backToCover}><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m11 5-5 5 5 5M6 10h10" stroke="currentColor" strokeWidth="1.2"/></svg>{mediaLabels.backToCover}</button>}
        <a className="video-source-link" href={youtubeUrl} target="_blank" rel="noreferrer">{mediaLabels.source}<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.2"/></svg></a>
      </div>}
    </div>}
  </div>
}
