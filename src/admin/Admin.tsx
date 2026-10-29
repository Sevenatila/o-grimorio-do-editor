import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { defaultContent } from '../data/content'
import { cloneContent, featuredVideo, parseContent, youtubeId, type SectionKey, type SiteContent, type VideoEntry } from '../lib/content-model'
import { readContent, saveContent, uploadImage } from '../lib/content-api'
import './admin.css'

type Tab = 'overview' | 'content' | 'videos' | 'feedbacks' | 'appearance' | 'backup'
const tabs: { id: Tab; label: string; subtitle: string }[] = [
  { id: 'overview', label: 'Visão geral', subtitle: 'Seu conteúdo, em um só lugar.' },
  { id: 'content', label: 'Textos do site', subtitle: 'Ajuste cada capítulo da sua história.' },
  { id: 'videos', label: 'Vídeos', subtitle: 'Organize o acervo e escolha o vídeo principal.' },
  { id: 'feedbacks', label: 'Feedbacks', subtitle: 'Adicione imagens e depoimentos recebidos.' },
  { id: 'appearance', label: 'Aparência', subtitle: 'Cores, imagens e detalhes da sua identidade.' },
  { id: 'backup', label: 'Backup', subtitle: 'Guarde uma cópia e recupere seu conteúdo.' },
]
const sectionNames: Record<SectionKey, string> = { journey: 'A Jornada', portfolio: 'Portfólio', arsenal: 'O Grimório', feedbacks: 'Feedbacks', contact: 'Contato' }
const draftKey = 'grimorio:admin-draft:v1'
const getPath = (object: unknown, path: string): unknown => path.split('.').reduce((value, key) => (value as Record<string, unknown>)?.[key], object)
type Editor = { draft: SiteContent; update: (path: string, value: unknown) => void; pending: (change: number) => void; notify: (message: string, error?: boolean) => void }
const EditorContext = createContext<Editor | null>(null)
const useEditor = () => useContext(EditorContext)!

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    overview: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    content: 'M5 3h14v18H5zM8 7h8M8 11h8M8 15h5',
    videos: 'M3 5h18v14H3zM10 9l6 3-6 3z',
    feedbacks: 'M3 4h18v13H9l-6 4zM7 8h10M7 12h6',
    appearance: 'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h3a5 5 0 0 0 0-10zM7 8h.01M6 13h.01M12 6h.01M17 7h.01',
    backup: 'M5 3h14v18H5zM8 3v6h8V3M8 16h8M8 19h8',
    plus: 'M12 5v14M5 12h14', save: 'M4 3h13l3 3v15H4zM8 3v7h8V3M8 16h8v5',
    up: 'M12 19V5m-6 6 6-6 6 6', down: 'M12 5v14m-6-6 6 6 6-6',
    trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7',
    eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0',
    arrow: 'M6 18 18 6M6 6h12v12', chevron: 'm9 5 7 7-7 7', upload: 'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6',
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={paths[name] || paths.content}/></svg>
}

function Field({ label, path, area = false, note, choices, color = false }: { label: string; path: string; area?: boolean; note?: string; choices?: string[]; color?: boolean }) {
  const { draft, update } = useEditor()
  const id = useId()
  const value = String(getPath(draft, path) ?? '')
  return <div className={'admin-field' + (area ? ' admin-field-wide' : '')}><label htmlFor={id}>{label}</label>
    {choices ? <select id={id} value={value} onChange={event => update(path, event.target.value)}>{choices.map(choice => <option key={choice} value={choice}>{choice === 'portrait' ? 'Vertical (9:16)' : choice === 'landscape' ? 'Horizontal (16:9)' : choice}</option>)}</select> : area ? <textarea id={id} rows={4} value={value} onChange={event => update(path, event.target.value)}/> : color ? <div className="admin-color"><input id={id} type="color" value={/^#[\da-f]{6}$/i.test(value) ? value : '#000000'} onChange={event => update(path, event.target.value)}/><input aria-label={label + ' hexadecimal'} value={value} onChange={event => update(path, event.target.value)}/></div> : <input id={id} value={value} onChange={event => update(path, event.target.value)}/>}
    {note && <small>{note}</small>}
  </div>
}

function ImageField({ label, path }: { label: string; path: string }) {
  const { draft, update, pending, notify } = useEditor()
  const value = String(getPath(draft, path) || '')
  return <div className="admin-image-field admin-field-wide"><Field label={label} path={path} note="Informe um link de imagem ou envie um arquivo JPG, PNG ou WebP de até 3 MB."/>
    <div className="admin-image-actions">{value && <img src={value} alt="Prévia da imagem escolhida" onError={event => { event.currentTarget.style.opacity = '.15' }} onLoad={event => { event.currentTarget.style.opacity = '1' }}/>}<label className="admin-button admin-button-light admin-upload"><Icon name="upload"/>Enviar imagem<input type="file" accept="image/png,image/jpeg,image/webp" onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = ''; if (!file) return
      pending(1)
      try { update(path, await uploadImage(file)); notify('Imagem enviada. Clique em Salvar alterações para aplicá-la ao site.') }
      catch (error) { notify((error as Error).message, true) }
      finally { pending(-1) }
    }}/></label></div>
  </div>
}

function HeadingFields({ path }: { path: string }) {
  return <div className="admin-fields"><Field label="Introdução do título" path={path + '.prelude'} note="A capitular usa a primeira letra real deste texto."/><Field label="Título da seção" path={path + '.title'}/></div>
}

function Panel({ title, children, description }: { title: string; children: ReactNode; description?: string }) {
  return <section className="admin-panel"><div className="admin-panel-heading"><h2>{title}</h2>{description && <p>{description}</p>}</div>{children}</section>
}

function Preview({ draft }: { draft: SiteContent }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const latest = useRef(draft)
  const [width, setWidth] = useState(390)
  const [available, setAvailable] = useState(390)
  latest.current = draft
  const send = () => frame.current?.contentWindow?.postMessage({ type: 'grimorio:preview', content: latest.current }, location.origin)
  useEffect(() => {
    const observer = new ResizeObserver(entries => setAvailable(Math.max(240, entries[0].contentRect.width)))
    if (box.current) observer.observe(box.current)
    const receive = (event: MessageEvent) => { if (event.origin === location.origin && event.source === frame.current?.contentWindow && event.data?.type === 'grimorio:preview-ready') send() }
    window.addEventListener('message', receive)
    return () => { observer.disconnect(); window.removeEventListener('message', receive) }
  }, [])
  useEffect(() => { const timer = setTimeout(send, 100); return () => clearTimeout(timer) }, [draft])
  const scale = Math.min(1, available / width)
  return <aside className="admin-preview" aria-label="Prévia do site"><div className="admin-preview-heading"><div><Icon name="eye"/><strong>Prévia ao vivo</strong></div><label>Tamanho<select value={width} onChange={event => setWidth(Number(event.target.value))}><option value={390}>Celular</option><option value={768}>Tablet</option><option value={1440}>Desktop</option></select></label></div>
    <p>Confira antes de salvar.</p><div ref={box} className="admin-preview-viewport" style={{ height: Math.round(900 * scale) }}><iframe ref={frame} title="Prévia personalizável do portfólio" src="/?preview=admin" onLoad={send} style={{ width, height: 900, transform: 'scale(' + scale + ')', transformOrigin: 'top left' }}/></div>
  </aside>
}

export default function Admin() {
  const [draft, setDraft] = useState(() => cloneContent(defaultContent))
  const [baseline, setBaseline] = useState(() => JSON.stringify(defaultContent))
  const [revision, setRevision] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploads, setUploads] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [preview, setPreview] = useState(() => matchMedia('(min-width: 1250px)').matches)
  const [openVideo, setOpenVideo] = useState(defaultContent.portfolio.videos[0]?.id || '')
  const [openFeedback, setOpenFeedback] = useState('')
  const [search, setSearch] = useState('')
  const loadSequence = useRef(0)
  const busy = loading || saving || uploads > 0
  const dirty = JSON.stringify(draft) !== baseline
  const notify = (message: string, problem = false) => { setNotice(message); setError(problem) }

  const load = async (restoreDraft = true) => {
    const sequence = ++loadSequence.current
    setLoading(true); setLoadError(false)
    try {
      const result = await readContent()
      if (sequence !== loadSequence.current) return
      const published = result.content || cloneContent(defaultContent)
      let next = published
      let nextRevision = result.revision
      if (restoreDraft) {
        try {
          const previous = JSON.parse(localStorage.getItem(draftKey) || 'null')
          if (previous?.content) { next = parseContent(previous.content, true); nextRevision = previous.revision ?? null; notify('Seu rascunho foi recuperado. Confira a prévia antes de salvar.') }
        } catch { notify('O rascunho antigo não pôde ser recuperado. O conteúdo salvo foi carregado.') }
      }
      setDraft(cloneContent(next)); setBaseline(JSON.stringify(published)); setRevision(nextRevision); setUpdatedAt(result.updatedAt)
    } catch (problem) { if (sequence === loadSequence.current) { setLoadError(true); notify((problem as Error).message, true) } }
    finally { if (sequence === loadSequence.current) setLoading(false) }
  }
  useEffect(() => { document.title = 'Painel de administração — O Grimório do Editor'; void load(); return () => { loadSequence.current++ } }, [])
  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => { try { if (dirty) localStorage.setItem(draftKey, JSON.stringify({ content: draft, revision })); else localStorage.removeItem(draftKey) } catch { if (dirty) notify('O navegador não conseguiu guardar o rascunho. Exporte uma cópia na aba Backup.', true) } }, 300)
    return () => clearTimeout(timer)
  }, [draft, revision, dirty, loading])
  useEffect(() => {
    const beforeLeave = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', beforeLeave)
    return () => window.removeEventListener('beforeunload', beforeLeave)
  }, [dirty])

  const update = (path: string, value: unknown) => setDraft(current => {
    const next = cloneContent(current)
    const keys = path.split('.')
    let target = next as unknown as Record<string, unknown>
    for (const key of keys.slice(0, -1)) target = target[key] as Record<string, unknown>
    target[keys[keys.length - 1]] = value
    return next
  })
  const save = async () => {
    setSaving(true); setNotice('')
    try {
      const result = await saveContent(parseContent(draft), revision)
      setDraft(cloneContent(result.content!)); setBaseline(JSON.stringify(result.content)); setRevision(result.revision); setUpdatedAt(result.updatedAt)
      try { localStorage.removeItem(draftKey) } catch { /* The server save succeeded even if browser storage is unavailable. */ }
      const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('grimorio:content') : null
      channel?.postMessage({ type: 'saved' }); channel?.close()
      notify('Alterações salvas. O site já está atualizado.')
    } catch (problem) { notify((problem as Error).message, true) }
    finally { setSaving(false) }
  }
  const addVideo = () => {
    const id = crypto.randomUUID()
    update('portfolio.videos', [...draft.portfolio.videos, { id, title: '', url: '', category: 'Vídeos', description: '', poster: '', format: 'portrait' }])
    setOpenVideo(id); setSearch('')
    requestAnimationFrame(() => document.querySelector<HTMLInputElement>('[data-record="' + id + '"] input')?.focus())
  }
  const addFeedback = () => {
    const id = crypto.randomUUID()
    update('feedbacks.items', [...draft.feedbacks.items, { id, image: '', alt: 'Imagem de feedback', text: '', name: '', role: '' }])
    setOpenFeedback(id)
  }
  const move = (path: 'portfolio.videos' | 'feedbacks.items', index: number, direction: number) => {
    const items = [...(getPath(draft, path) as (VideoEntry | SiteContent['feedbacks']['items'][number])[])]
    const target = index + direction
    if (target < 0 || target >= items.length) return
    ;[items[index], items[target]] = [items[target], items[index]]
    update(path, items)
  }
  const removeVideo = (id: string) => setDraft(current => {
    const next = cloneContent(current)
    if (next.hero.featuredId === id) { next.hero.video = featuredVideo(next); next.hero.featuredId = '' }
    next.portfolio.videos = next.portfolio.videos.filter(item => item.id !== id)
    return next
  })
  const exportBackup = () => {
    const file = new Blob([JSON.stringify({ format: 'grimorio-site-content', version: 1, content: draft }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a'); link.href = url; link.download = 'grimorio-backup-' + new Date().toISOString().slice(0, 10) + '.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const activeTab = tabs.find(item => item.id === tab)!

  return <EditorContext.Provider value={{ draft, update, pending: change => setUploads(current => current + change), notify }}><div className={'admin-shell' + (preview ? ' has-preview' : '')}>
    <aside className="admin-sidebar"><a className="admin-brand" href="/admin"><span className="admin-monogram">G</span><span>O Grimório<span>Painel do editor</span></span></a><div className="admin-sidebar-label">Seu espaço de criação</div><nav aria-label="Seções do painel">{tabs.map(item => <button key={item.id} type="button" aria-label={item.label} className={tab === item.id ? 'active' : ''} aria-current={tab === item.id ? 'page' : undefined} onClick={() => { setTab(item.id); setSearch('') }}><Icon name={item.id}/>{item.label}{item.id === 'videos' && <small>{draft.portfolio.videos.length}</small>}{item.id === 'feedbacks' && <small>{draft.feedbacks.items.length}</small>}</button>)}</nav><div className="admin-demo"><span className="admin-status-dot"/>Versão de demonstração<small>Acesso ao painel sem senha.</small></div><a className="admin-site-link" href="/" target="_blank" rel="noreferrer">Abrir meu site<Icon name="arrow"/></a></aside>
    <div className="admin-workspace"><header className="admin-topbar"><div><span className={'admin-save-status' + (dirty ? ' is-dirty' : '')}><span/>{loading ? 'Carregando conteúdo…' : saving ? 'Salvando…' : uploads ? 'Enviando imagem…' : dirty ? 'Alterações não salvas' : 'Conteúdo salvo'}</span>{updatedAt && <small>Último salvamento: {new Date(updatedAt).toLocaleString('pt-BR')}</small>}</div><div className="admin-topbar-actions"><button className="admin-button admin-button-light" type="button" aria-pressed={preview} onClick={() => setPreview(!preview)}><Icon name="eye"/>{preview ? 'Ocultar prévia' : 'Ver prévia'}</button><button className="admin-button admin-button-primary" type="submit" form="admin-editor" disabled={busy || loadError || !dirty}><Icon name="save"/>{saving ? 'Salvando…' : 'Salvar alterações'}</button></div></header>
      <main className="admin-main"><div className="admin-page-heading"><span className="admin-overline">ADMINISTRAÇÃO DO SITE</span><h1>{activeTab.label}</h1><p>{activeTab.subtitle}</p></div>
        {notice && <div className={'admin-notice' + (error ? ' is-error' : '')} role={error ? 'alert' : 'status'}>{notice}{loadError && <button type="button" className="admin-inline-button" onClick={() => void load()}>Tentar novamente</button>}</div>}
        <div className="admin-editor-layout"><form id="admin-editor" noValidate onSubmit={event => { event.preventDefault(); if (!busy && !loadError) void save() }}><fieldset className="admin-form-fieldset" disabled={busy}>
        {tab === 'overview' && <>
          <div className="admin-welcome"><span>Um novo capítulo começa aqui.</span><h2>Seu site, do seu jeito.</h2><p>Edite o conteúdo, veja o resultado na prévia e salve quando estiver pronto.</p><button type="button" className="admin-button admin-button-primary" onClick={() => setTab('videos')}><Icon name="plus"/>Gerenciar meus vídeos</button></div>
          <div className="admin-stats">{[['videos', draft.portfolio.videos.length, 'Vídeos no acervo'], ['feedbacks', draft.feedbacks.items.length, 'Feedbacks'], ['content', draft.arsenal.skills.length, 'Habilidades']] .map(([id, count, label]) => <button type="button" key={id} onClick={() => setTab(id as Tab)}><Icon name={String(id)}/><strong>{count}</strong><span>{label}</span></button>)}</div>
          <Panel title="Como editar"><ol className="admin-steps"><li><strong>Escolha o que deseja mudar</strong><span>Textos, vídeos, feedbacks ou aparência.</span></li><li><strong>Confira na prévia</strong><span>As alterações ficam no rascunho enquanto você edita.</span></li><li><strong>Salve para atualizar o site</strong><span>O botão Salvar alterações publica o conteúdo para os visitantes.</span></li></ol></Panel>
        </>}
        {tab === 'content' && <>
          <Panel title="Identidade e contato"><div className="admin-fields"><Field label="Nome do site" path="general.name"/><Field label="Nome do profissional" path="general.author"/><Field label="Especialidade" path="general.role"/><Field label="Link do canal" path="general.channel"/><Field label="WhatsApp com DDI e DDD" path="general.whatsapp" note="Deixe em branco para manter o aviso de contato em breve."/><Field label="Mensagem inicial do WhatsApp" path="general.message" area/></div></Panel>
          <Panel title="Abertura do site"><div className="admin-fields"><Field label="Título principal" path="hero.title" area/><Field label="Descrição da abertura" path="hero.description" area/><Field label="Texto do botão principal" path="hero.cta"/><Field label="Frase abaixo da abertura" path="hero.tagline"/><Field label="Assinatura da abertura" path="hero.signature"/></div></Panel>
          <Panel title="A Jornada"><HeadingFields path="journey.heading"/>{draft.journey.paragraphs.map((_, index) => <div className="admin-paragraph" key={index}><Field label={'Parágrafo ' + (index + 1)} path={'journey.paragraphs.' + index} area/>{draft.journey.paragraphs.length > 1 && <button type="button" className="admin-inline-button danger" onClick={() => update('journey.paragraphs', draft.journey.paragraphs.filter((_, position) => position !== index))}>Remover parágrafo</button>}</div>)}<button type="button" className="admin-button admin-button-light" disabled={draft.journey.paragraphs.length >= 20} onClick={() => update('journey.paragraphs', [...draft.journey.paragraphs, ''])}><Icon name="plus"/>Adicionar parágrafo</button><Field label="Legenda da Jornada" path="journey.caption"/></Panel>
          <Panel title="Apresentação do portfólio"><HeadingFields path="portfolio.heading"/><Field label="Introdução do portfólio" path="portfolio.intro" area/><Field label="Mensagem quando não houver vídeos" path="portfolio.empty"/></Panel>
          <Panel title="Habilidades e arsenal"><HeadingFields path="arsenal.heading"/><Field label="Subtítulo do arsenal" path="arsenal.subtitle"/><Field label="Introdução do arsenal" path="arsenal.intro" area/>{draft.arsenal.skills.map((_, index) => <details className="admin-skill" key={index}><summary>Habilidade {index + 1} — {draft.arsenal.skills[index].title}</summary><div className="admin-fields"><Field label="Nome da habilidade" path={'arsenal.skills.' + index + '.title'}/><Field label="Descrição da habilidade" path={'arsenal.skills.' + index + '.description'} area/></div></details>)}</Panel>
          <Panel title="Apresentação dos feedbacks"><HeadingFields path="feedbacks.heading"/><Field label="Introdução dos feedbacks" path="feedbacks.intro" area/><Field label="Mensagem quando não houver feedbacks" path="feedbacks.empty"/></Panel>
          <Panel title="Contato e encerramento"><HeadingFields path="contact.heading"/><Field label="Texto de contato" path="contact.text" area/><div className="admin-fields"><Field label="Texto do botão de contato" path="contact.cta"/><Field label="Aviso de contato indisponível" path="contact.unavailable"/><Field label="Legenda da imagem final" path="contact.caption" area/><Field label="Descrição do rodapé" path="footer.description"/><Field label="Frase do rodapé" path="footer.tagline"/></div></Panel>
        </>}
        {tab === 'videos' && <>
          <Panel title="Vídeo principal" description="Escolha um vídeo do acervo ou use um link independente."><div className="admin-field"><label htmlFor="featured-video">Vídeo em destaque</label><select id="featured-video" value={draft.portfolio.videos.some(video => video.id === draft.hero.featuredId) ? draft.hero.featuredId : ''} onChange={event => update('hero.featuredId', event.target.value)}><option value="">Usar um link personalizado</option>{draft.portfolio.videos.map((video, index) => <option key={video.id} value={video.id}>{video.title || 'Vídeo ' + (index + 1)}</option>)}</select></div>{!draft.hero.featuredId && <div className="admin-fields"><Field label="Link do vídeo principal" path="hero.video.url"/><Field label="Título do vídeo principal" path="hero.video.title"/><Field label="Formato principal" path="hero.video.format" choices={['portrait', 'landscape']}/></div>}<ImageField label="Capa do vídeo principal" path="hero.video.poster"/></Panel>
          <div className="admin-list-toolbar"><div><h2>Vídeos do portfólio</h2><p>{draft.portfolio.videos.length} vídeos cadastrados</p></div><button type="button" className="admin-button admin-button-primary" disabled={draft.portfolio.videos.length >= 100} onClick={addVideo}><Icon name="plus"/>Adicionar vídeo</button></div>
          <div className="admin-field"><label htmlFor="video-search">Buscar vídeos</label><input id="video-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pelo título ou categoria"/></div>
          {draft.portfolio.videos.map((video, index) => ({ video, index })).filter(({ video }) => (video.title + ' ' + video.category).toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))).map(({ video, index }) => <section key={video.id} data-record={video.id} className="admin-record"><div className="admin-record-heading"><button type="button" className="admin-record-toggle" aria-expanded={openVideo === video.id} onClick={() => setOpenVideo(openVideo === video.id ? '' : video.id)}>{video.poster || youtubeId(video.url) ? <img src={video.poster || 'https://i.ytimg.com/vi/' + youtubeId(video.url) + '/hqdefault.jpg'} alt=""/> : <span className="admin-record-icon"><Icon name="videos"/></span>}<span><small>VÍDEO {index + 1}{draft.hero.featuredId === video.id ? ' · PRINCIPAL' : ''}</small><strong>{video.title || 'Novo vídeo'}</strong><span>{video.category}</span></span><Icon name="chevron"/></button><div className="admin-record-actions"><button type="button" aria-label={'Mover vídeo ' + (index + 1) + ' para cima'} disabled={index === 0} onClick={() => move('portfolio.videos', index, -1)}><Icon name="up"/></button><button type="button" aria-label={'Mover vídeo ' + (index + 1) + ' para baixo'} disabled={index === draft.portfolio.videos.length - 1} onClick={() => move('portfolio.videos', index, 1)}><Icon name="down"/></button><button type="button" className="danger" aria-label={'Remover vídeo ' + (index + 1)} onClick={() => removeVideo(video.id)}><Icon name="trash"/></button></div></div>
            {openVideo === video.id && <fieldset className="admin-record-body"><legend>Vídeo {index + 1}</legend><div className="admin-fields"><Field label="Link do vídeo" path={'portfolio.videos.' + index + '.url'} note="YouTube, Shorts, youtu.be ou link direto de um arquivo MP4/WebM."/><Field label="Título do vídeo" path={'portfolio.videos.' + index + '.title'}/><Field label="Categoria" path={'portfolio.videos.' + index + '.category'}/><Field label="Formato" path={'portfolio.videos.' + index + '.format'} choices={['portrait', 'landscape']}/><Field label="Descrição do vídeo" path={'portfolio.videos.' + index + '.description'} area/><ImageField label="Capa do vídeo" path={'portfolio.videos.' + index + '.poster'}/></div><button type="button" className="admin-inline-button" onClick={() => update('hero.featuredId', video.id)}>Usar como vídeo principal</button></fieldset>}
          </section>)}
          {!draft.portfolio.videos.length && <div className="admin-empty"><Icon name="videos"/><h3>Seu acervo está pronto para começar.</h3><p>Clique em Adicionar vídeo e cole o primeiro link.</p></div>}
          {draft.portfolio.videos.length > 0 && <button type="button" className="admin-add-more" disabled={draft.portfolio.videos.length >= 100} onClick={addVideo}><Icon name="plus"/>Adicionar outro vídeo</button>}
        </>}
        {tab === 'feedbacks' && <>
          <div className="admin-list-toolbar"><div><h2>Feedbacks recebidos</h2><p>{draft.feedbacks.items.length} feedbacks cadastrados</p></div><button type="button" className="admin-button admin-button-primary" disabled={draft.feedbacks.items.length >= 200} onClick={addFeedback}><Icon name="plus"/>Adicionar feedback</button></div>
          <p className="admin-helper">Use uma captura de conversa, um depoimento escrito ou os dois. Nome e identificação são opcionais.</p>
          {draft.feedbacks.items.map((item, index) => <section key={item.id} className="admin-record"><div className="admin-record-heading"><button type="button" className="admin-record-toggle" aria-expanded={openFeedback === item.id} onClick={() => setOpenFeedback(openFeedback === item.id ? '' : item.id)}>{item.image ? <img src={item.image} alt=""/> : <span className="admin-record-icon"><Icon name="feedbacks"/></span>}<span><small>FEEDBACK {index + 1}</small><strong>{item.name || item.alt || 'Novo feedback'}</strong><span>{item.text ? item.text.slice(0, 65) : 'Imagem de feedback'}</span></span><Icon name="chevron"/></button><div className="admin-record-actions"><button type="button" aria-label={'Mover feedback ' + (index + 1) + ' para cima'} disabled={index === 0} onClick={() => move('feedbacks.items', index, -1)}><Icon name="up"/></button><button type="button" aria-label={'Mover feedback ' + (index + 1) + ' para baixo'} disabled={index === draft.feedbacks.items.length - 1} onClick={() => move('feedbacks.items', index, 1)}><Icon name="down"/></button><button type="button" className="danger" aria-label={'Remover feedback ' + (index + 1)} onClick={() => update('feedbacks.items', draft.feedbacks.items.filter(entry => entry.id !== item.id))}><Icon name="trash"/></button></div></div>{openFeedback === item.id && <fieldset className="admin-record-body"><legend>Feedback {index + 1}</legend><div className="admin-fields"><ImageField label="Imagem do feedback" path={'feedbacks.items.' + index + '.image'}/><Field label="Descrição da imagem" path={'feedbacks.items.' + index + '.alt'}/><Field label="Depoimento escrito" path={'feedbacks.items.' + index + '.text'} area note="Preencha este texto se não usar uma imagem."/><Field label="Nome (opcional)" path={'feedbacks.items.' + index + '.name'}/><Field label="Identificação (opcional)" path={'feedbacks.items.' + index + '.role'}/></div></fieldset>}</section>)}
          {!draft.feedbacks.items.length && <div className="admin-empty"><Icon name="feedbacks"/><h3>Espaço para novas histórias.</h3><p>Adicione seu primeiro feedback pelo botão acima.</p></div>}
          {draft.feedbacks.items.length > 0 && <button type="button" className="admin-add-more" disabled={draft.feedbacks.items.length >= 200} onClick={addFeedback}><Icon name="plus"/>Adicionar outro feedback</button>}
        </>}
        {tab === 'appearance' && <>
          <Panel title="Paleta do site"><div className="admin-fields"><Field label="Pergaminho" path="appearance.paper" color/><Field label="Cor do texto" path="appearance.ink" color/><Field label="Dourado" path="appearance.gold" color/><Field label="Bordô e botões" path="appearance.accent" color/><Field label="Fundo escuro" path="appearance.night" color/><Field label="Fonte dos títulos" path="appearance.headingFont" choices={['Cinzel', 'Georgia', 'Lora']}/><Field label="Fonte dos textos" path="appearance.bodyFont" choices={['Lora', 'Georgia', 'Cinzel']}/></div></Panel>
          <Panel title="Imagens e textura"><ImageField label="Cenário da abertura no computador" path="hero.desktopBackdrop"/><ImageField label="Imagem da Jornada" path="journey.image"/><Field label="Descrição da imagem da Jornada" path="journey.alt"/><ImageField label="Imagem do encerramento no celular" path="contact.image"/><ImageField label="Imagem do encerramento no computador" path="contact.desktopImage"/><Field label="Descrição da imagem do encerramento" path="contact.alt"/><ImageField label="Textura do pergaminho" path="appearance.texture"/></Panel>
          <Panel title="Seções e navegação" description="Escolha as seções exibidas e os nomes que aparecem no menu.">{(Object.keys(sectionNames) as SectionKey[]).map(key => <div className="admin-section-setting" key={key}><label className="admin-switch"><input type="checkbox" checked={draft.visible[key]} onChange={event => update('visible.' + key, event.target.checked)}/><span/><strong>Exibir {sectionNames[key]}</strong></label><Field label={'Nome no menu: ' + sectionNames[key]} path={'navigation.' + key}/></div>)}</Panel>
        </>}
        {tab === 'backup' && <>
          <Panel title="Exportar meu conteúdo" description="Baixe uma cópia dos textos, links, feedbacks e configurações atuais."><button type="button" className="admin-button admin-button-primary" onClick={exportBackup}><Icon name="backup"/>Exportar backup</button></Panel>
          <Panel title="Importar um backup" description="A importação abre o conteúdo no rascunho. Use Salvar alterações para aplicar ao site."><label className="admin-button admin-button-light admin-upload"><Icon name="upload"/>Selecionar arquivo JSON<input type="file" accept="application/json,.json" onChange={async event => { const file = event.target.files?.[0]; event.target.value = ''; if (!file) return; try { if (file.size > 1_000_000) throw new Error('O arquivo de backup deve ter até 1 MB.'); const data = JSON.parse(await file.text()); setDraft(parseContent(data.content || data, true)); notify('Backup importado no rascunho. Confira a prévia e salve para aplicar.') } catch (problem) { notify('Não foi possível importar o backup. ' + (problem as Error).message, true) } }}/></label></Panel>
          <Panel title="Descartar o rascunho" description="Carregue novamente a última versão salva no site."><button type="button" className="admin-button admin-button-light" onClick={() => { if (!dirty || window.confirm('Descartar as alterações não salvas e recarregar o conteúdo do site?')) { localStorage.removeItem(draftKey); void load(false); notify('Conteúdo salvo recarregado.') } }}>Recarregar conteúdo salvo</button></Panel>
        </>}
        </fieldset></form>{preview && <Preview draft={draft}/>}</div>
      </main><footer className="admin-footer">O Grimório do Editor · Administração de conteúdo</footer>
    </div>
  </div></EditorContext.Provider>
}
