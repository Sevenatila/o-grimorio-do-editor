import { englishDefaults, type EnglishContent } from '../data/english.js'

export type Heading = { prelude: string; title: string }
export type VideoEntry = { id: string; title: string; url: string; category: string; description: string; poster: string; format: 'portrait' | 'landscape' }
export type FeedbackEntry = { id: string; image: string; alt: string; text: string; name: string; role: string }
export type SectionKey = 'journey' | 'portfolio' | 'arsenal' | 'feedbacks' | 'contact'
export type SiteContent = {
  version: 1
  general: { name: string; author: string; role: string; channel: string; whatsapp: string; message: string }
  navigation: Record<SectionKey, string>
  visible: Record<SectionKey, boolean>
  hero: { title: string; description: string; cta: string; tagline: string; signature: string; featuredId: string; video: VideoEntry; desktopBackdrop: string }
  journey: { heading: Heading; paragraphs: string[]; image: string; alt: string; caption: string }
  portfolio: { heading: Heading; intro: string; empty: string; videos: VideoEntry[] }
  arsenal: { heading: Heading; subtitle: string; intro: string; skills: { symbol: string; title: string; description: string }[] }
  feedbacks: { heading: Heading; intro: string; empty: string; items: FeedbackEntry[] }
  contact: { heading: Heading; text: string; cta: string; unavailable: string; image: string; desktopImage: string; alt: string; caption: string }
  footer: { description: string; tagline: string }
  appearance: { paper: string; ink: string; gold: string; accent: string; night: string; headingFont: string; bodyFont: string; texture: string }
  english: EnglishContent
}

export function youtubeId(url: string): string | undefined {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return undefined
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '')
    let id: string | null | undefined
    if (host === 'youtu.be') id = parsed.pathname.split('/')[1]
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      id = parsed.pathname === '/watch' ? parsed.searchParams.get('v') : /^\/(shorts|embed|live)\//.test(parsed.pathname) ? parsed.pathname.split('/')[2] : undefined
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : undefined
  } catch { return undefined }
}

export function isSafeUrl(value: string): boolean {
  if (!value) return true
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return true
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}

export function isVideoUrl(value: string): boolean {
  if (youtubeId(value)) return true
  if (!isSafeUrl(value) || !value) return false
  try { return /\.(mp4|webm|ogg)$/i.test(new URL(value, 'https://example.invalid').pathname) } catch { return false }
}

type Rule = { fields: Record<string, Rule> } | { items: Rule; max: number; min?: number } | { type: 'text' | 'url' | 'video' | 'color' | 'boolean' | 'version'; required?: boolean; max?: number; choices?: string[] }
const text = (required = false, max = 6000): Rule => ({ type: 'text', required, max })
const url: Rule = { type: 'url', max: 3000 }
const heading: Rule = { fields: { prelude: text(true, 160), title: text(true, 160) } }
const video: Rule = { fields: { id: text(true, 100), title: text(true, 240), url: { type: 'video', required: true, max: 3000 }, category: text(true, 100), description: text(), poster: url, format: { type: 'text', choices: ['portrait', 'landscape'] } } }
const sections = ['journey', 'portfolio', 'arsenal', 'feedbacks', 'contact'] as const
const contentRule: Rule = { fields: {
  version: { type: 'version' },
  general: { fields: { name: text(true, 120), author: text(true, 120), role: text(true, 160), channel: url, whatsapp: text(false, 32), message: text(false, 1000) } },
  navigation: { fields: Object.fromEntries(sections.map(key => [key, text(true, 80)])) },
  visible: { fields: Object.fromEntries(sections.map(key => [key, { type: 'boolean' }])) },
  hero: { fields: { title: text(true, 500), description: text(), cta: text(true, 120), tagline: text(false, 240), signature: text(false, 160), featuredId: text(false, 100), video, desktopBackdrop: url } },
  journey: { fields: { heading, paragraphs: { items: text(true), min: 1, max: 20 }, image: url, alt: text(false, 500), caption: text(false, 500) } },
  portfolio: { fields: { heading, intro: text(), empty: text(false, 500), videos: { items: video, max: 100 } } },
  arsenal: { fields: { heading, subtitle: text(false, 500), intro: text(), skills: { items: { fields: { symbol: { type: 'text', choices: ['script', 'camera', 'edit', 'color', 'sound', 'trend', 'time'] }, title: text(true, 160), description: text(true) } }, min: 7, max: 7 } } },
  feedbacks: { fields: { heading, intro: text(), empty: text(false, 500), items: { items: { fields: { id: text(true, 100), image: url, alt: text(false, 500), text: text(), name: text(false, 160), role: text(false, 160) } }, max: 200 } } },
  contact: { fields: { heading, text: text(), cta: text(true, 160), unavailable: text(false, 500), image: url, desktopImage: url, alt: text(false, 500), caption: text(false, 500) } },
  footer: { fields: { description: text(false, 500), tagline: text(false, 500) } },
  appearance: { fields: { paper: { type: 'color' }, ink: { type: 'color' }, gold: { type: 'color' }, accent: { type: 'color' }, night: { type: 'color' }, headingFont: { type: 'text', choices: ['Cinzel', 'Georgia', 'Lora'] }, bodyFont: { type: 'text', choices: ['Lora', 'Georgia', 'Cinzel'] }, texture: url } },
} }

const englishRule: Rule = { fields: {
  general: { fields: { name: text(true, 120), role: text(true, 160), message: text(false, 1000) } },
  navigation: { fields: Object.fromEntries(sections.map(key => [key, text(true, 80)])) },
  hero: { fields: { title: text(true, 500), description: text(), cta: text(true, 120), tagline: text(false, 240), signature: text(false, 160), videoTitle: text(true, 240), videoCategory: text(false, 100), videoDescription: text() } },
  journey: { fields: { heading, paragraphs: { items: text(true), min: 1, max: 20 }, alt: text(false, 500), caption: text(false, 500) } },
  portfolio: { fields: { heading, intro: text(), empty: text(false, 500), videos: { items: { fields: { id: text(true, 100), title: text(false, 240), category: text(false, 100), description: text() } }, max: 100 } } },
  arsenal: { fields: { heading, subtitle: text(false, 500), intro: text(), skills: { items: { fields: { title: text(true, 160), description: text(true) } }, min: 7, max: 7 } } },
  feedbacks: { fields: { heading, intro: text(), empty: text(false, 500), originalNote: text(false, 500), items: { items: { fields: { id: text(true, 100), alt: text(false, 500), text: text(), role: text(false, 160) } }, max: 200 } } },
  contact: { fields: { heading, text: text(), cta: text(true, 160), unavailable: text(false, 500), alt: text(false, 500), caption: text(false, 500) } },
  footer: { fields: { description: text(false, 500), tagline: text(false, 500) } },
} }

function fieldName(path: string): string {
  const labels: Record<string, string> = { site: 'conteúdo', general: 'Identidade', name: 'nome', author: 'profissional', role: 'identificação', channel: 'canal', message: 'mensagem', navigation: 'Menu', visible: 'Seções', hero: 'Abertura', title: 'título', description: 'descrição', cta: 'botão', tagline: 'frase', signature: 'assinatura', featuredId: 'vídeo em destaque', video: 'Vídeo principal', journey: 'Jornada', paragraphs: 'parágrafos', image: 'imagem', alt: 'descrição da imagem', caption: 'legenda', heading: 'Cabeçalho', prelude: 'introdução do título', portfolio: 'Portfólio', intro: 'introdução', empty: 'mensagem de lista vazia', videos: 'Vídeos', id: 'identificação do item', url: 'link', category: 'categoria', poster: 'capa', format: 'formato', arsenal: 'Arsenal', subtitle: 'subtítulo', skills: 'Habilidades', symbol: 'símbolo', feedbacks: 'Feedbacks', items: 'Itens', text: 'texto', contact: 'Contato', unavailable: 'mensagem de indisponibilidade', footer: 'Rodapé', appearance: 'Aparência', paper: 'pergaminho', ink: 'texto', gold: 'dourado', accent: 'bordô', night: 'fundo escuro', headingFont: 'fonte dos títulos', bodyFont: 'fonte dos textos', texture: 'textura' }
  labels.desktopBackdrop = 'cenário da abertura no computador'
  labels.desktopImage = 'imagem no computador'
  labels.english = 'Versão em inglês'
  return path.replace(/^site\./, '').split(/[.\[\]]+/).filter(Boolean).map(part => labels[part] || part).join(' › ')
}

function validate(value: unknown, rule: Rule, rawPath: string, draft = false): unknown {
  const path = fieldName(rawPath)
  if ('fields' in rule) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`Conteúdo inválido em ${path}.`)
    return Object.fromEntries(Object.entries(rule.fields).map(([key, field]) => [key, validate((value as Record<string, unknown>)[key], field, `${rawPath}.${key}`, draft)]))
  }
  if ('items' in rule) {
    if (!Array.isArray(value) || value.length > rule.max || value.length < (rule.min || 0)) throw new Error(`Quantidade de itens inválida em ${path}.`)
    return value.map((item, index) => validate(item, rule.items, `${rawPath}[${index + 1}]`, draft))
  }
  if (rule.type === 'version') { if (value !== 1) throw new Error('Versão de conteúdo não suportada.'); return 1 }
  if (rule.type === 'boolean') { if (typeof value !== 'boolean') throw new Error(`Opção inválida em ${path}.`); return value }
  if (typeof value !== 'string' || value.length > (rule.max || 6000) || (!draft && rule.required && !value.trim())) throw new Error(`Preencha corretamente o campo ${path}.`)
  if (rule.choices && !rule.choices.includes(value)) throw new Error(`Opção inválida em ${path}.`)
  if (rule.type === 'color' && !/^#[\da-f]{6}$/i.test(value)) throw new Error(`Cor inválida em ${path}.`)
  if (rule.type === 'url' && !isSafeUrl(value)) throw new Error(`Use um endereço HTTP/HTTPS ou um arquivo do site em ${path}.`)
  if (rule.type === 'video' && !draft && !isVideoUrl(value)) throw new Error(`Use um link do YouTube ou um arquivo MP4/WebM em ${path}.`)
  return value
}

export function parseContent(value: unknown, draft = false): SiteContent {
  // Add desktop artwork to older saved content and backups without replacing edits.
  let input = value
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const previous = value as { hero?: Record<string, unknown>; contact?: Record<string, unknown> }
    input = { ...value, hero: { ...previous.hero, desktopBackdrop: previous.hero?.desktopBackdrop ?? '/assets/art/hero-editor-desktop.webp' }, contact: { ...previous.contact, desktopImage: previous.contact?.desktopImage ?? (previous.contact?.image === '/assets/art/epilogue-desk.webp' ? '/assets/art/epilogue-desk-desktop.webp' : '') } }
  }
  const content = validate(input, contentRule, 'site', draft) as SiteContent
  const translation = value && typeof value === 'object' ? (value as { english?: unknown }).english : undefined
  content.english = translation === undefined ? JSON.parse(JSON.stringify(englishDefaults)) : validate(translation, englishRule, 'english', draft) as EnglishContent
  for (const collection of [content.english.portfolio.videos, content.english.feedbacks.items]) {
    if (new Set(collection.map(item => item.id)).size !== collection.length) throw new Error('Há identificadores repetidos nas traduções em inglês.')
  }
  syncEnglishCollections(content)
  for (const collection of [content.portfolio.videos, content.feedbacks.items]) {
    if (new Set(collection.map(item => item.id)).size !== collection.length) throw new Error('Há identificadores repetidos na lista. Importe um arquivo de backup válido.')
  }
  if (!draft) {
    content.feedbacks.items.forEach((item, index) => { if (!item.image && !item.text.trim()) throw new Error(`Adicione uma imagem ou um texto ao feedback ${index + 1}.`) })
    if (content.general.whatsapp && !/^\+?[\d\s()-]{8,32}$/.test(content.general.whatsapp)) throw new Error('Confira o WhatsApp e inclua o DDI e DDD.')
  }
  return content
}

export function syncEnglishCollections(content: SiteContent): SiteContent {
  const videos = new Map(content.english.portfolio.videos.map(item => [item.id, item]))
  content.english.portfolio.videos = content.portfolio.videos.map(video => videos.get(video.id) || { id: video.id, title: '', category: '', description: '' })
  const feedbacks = new Map(content.english.feedbacks.items.map(item => [item.id, item]))
  content.english.feedbacks.items = content.feedbacks.items.map(item => feedbacks.get(item.id) || { id: item.id, alt: '', text: '', role: '' })
  return content
}

export function toProject(entry: VideoEntry) {
  const id = youtubeId(entry.url)
  return { id: entry.id, title: entry.title, category: entry.category, description: entry.description, poster: entry.poster || (id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '/assets/editor-scene.svg'), youtubeId: id, src: id || !isVideoUrl(entry.url) ? '' : entry.url, format: entry.format === 'portrait' ? 'portrait' as const : undefined }
}

export function featuredVideo(content: SiteContent): VideoEntry {
  const selected = content.portfolio.videos.find(video => video.id === content.hero.featuredId)
  return selected ? { ...selected, poster: content.hero.video.poster || selected.poster } : content.hero.video
}

export const cloneContent = (content: SiteContent): SiteContent => JSON.parse(JSON.stringify(content))
