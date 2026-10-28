import { useEffect, useRef, useState } from 'react'
import type { Project } from '../data/content'
import { FrameCorners } from './Ornaments'

export function VideoCard({ project, hero = false }: { project: Project; hero?: boolean }) {
  const [localSource, setLocalSource] = useState('')
  const [error, setError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const source = localSource || project.src
  useEffect(() => () => { if (localSource) URL.revokeObjectURL(localSource) }, [localSource])
  return <div className={`video-card ${hero ? 'hero-video' : ''}`}>
    <div className="video-frame">
      <video id={hero ? 'demoreel-player' : undefined} ref={videoRef} controls playsInline preload="none" poster={project.poster} src={source || undefined} aria-label={project.title} onError={() => setError(true)} onPlay={() => { document.querySelectorAll('video').forEach(video => { if (video !== videoRef.current) video.pause() }) }}>
        {project.captions && <track kind="captions" src={project.captions} srcLang="pt-BR" label="Português" default/>}
      </video>
      {(!source || error) && <div className="video-placeholder"><span className="play-mark" aria-hidden="true">▷</span><span>{error ? 'Não foi possível carregar este vídeo' : hero ? 'Seu próximo olhar começa aqui' : 'Um novo conto está por vir'}</span><small>{error ? 'Tente outro arquivo local.' : 'Vídeo pendente · prévia do player'}</small><label className="file-picker">Selecionar vídeo local<input type="file" accept="video/*" onChange={event => { const file = event.target.files?.[0]; if (file) { setError(false); setLocalSource(URL.createObjectURL(file)) } }}/></label></div>}
      <FrameCorners/>
    </div>
    {localSource && <p className="media-note">Prévia local · arquivo apenas neste navegador.</p>}
    {!hero && <div className="video-caption"><span className="eyebrow">{project.category} · demonstração</span><h3>{project.title}</h3><p>{project.description}</p></div>}
  </div>
}
