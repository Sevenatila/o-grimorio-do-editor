import type { SiteContent, VideoEntry } from '../lib/content-model'

export type Project = {
  id: string
  title: string
  category: string
  description: string
  src?: string
  poster: string
  captions?: string
  youtubeId?: string
  format?: 'portrait'
}

const selectedVideos = [
  { id: 'oF7MRtebWHs', title: 'Reunião e Cowork - Singlr' },
  { id: '9FwdP60SSpc', title: 'O Grimório do Editor - Marcos' },
  { id: 'QstQJOrkq2k', title: 'Profissão Closer Digital - Jesse' },
  { id: 'rwz_finz-Y0', title: 'Closer Digital - Jesse' },
  { id: 'fCXZFommLOA', title: 'O que está mudando no sistema tributário brasileiro - TributeBem' },
  { id: 'bnOoqp2OafA', title: 'Cronograma e Fases de Transição - TributeBem' },
]

export const projects: Project[] = selectedVideos.map(({ id, title }) => ({
  id: `youtube-${id}`,
  youtubeId: id,
  title,
  category: 'Shorts',
  description: '',
  poster: `/assets/videos/${id}-hd.jpg`,
  format: 'portrait',
}))

export const mediaLabels = {
  presentation: 'Em destaque',
  collection: 'Do acervo do editor',
  format: 'Vídeo vertical',
  landscapeFormat: 'Vídeo horizontal',
  play: 'Assistir ao vídeo',
  playHint: 'Uma história em movimento',
  source: 'Abrir no YouTube',
  backToCover: 'Voltar à capa',
  loading: 'Preparando o vídeo…',
  unavailable: 'Não foi possível conectar ao player. Você também pode abrir o vídeo no YouTube.',
  playbackBlocked: 'Seu navegador bloqueou a reprodução. Use o play do vídeo para continuar.',
}

export const artwork = {
  heroCover: '/assets/art/hero-editor.webp',
  journey: {
    src: '/assets/art/journey-city.webp',
    srcSet: '/assets/art/journey-city-mobile.webp 800w, /assets/art/journey-city.webp 1600w',
    alt: 'Gravura em sépia de um artesão anônimo contemplando uma cidade medieval, suas torres e pontes.',
  },
  epilogue: {
    src: '/assets/art/epilogue-desk.webp',
    srcSet: '/assets/art/epilogue-desk-mobile.webp 800w, /assets/art/epilogue-desk.webp 1600w',
    alt: 'Ilustração de livros antigos, pergaminho em branco, pena e vela acesa sobre uma mesa de madeira.',
  },
}

export const site = {
  name: 'O Grimório do Editor',
  author: 'Marcos',
  channel: 'https://www.youtube.com/@MarcosEditor-Storyteller/videos',
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '',
  message: 'Olá, Marcos! Vamos conversar sobre o próximo capítulo da minha marca?',
  hero: {
    title: 'Estratégia, estética e emoção em cada quadro.',
    description: 'Edição de vídeos que transformam ideias em histórias que prendem, conectam e geram resultados.',
    video: { ...projects[1], id: 'demoreel', category: 'Apresentação', poster: artwork.heroCover, src: import.meta.env.VITE_DEMOREEL_URL || '' } as Project,
  },
  journey: [
    'Toda grande história tem um começo. A minha começou lá em 2024, editando vídeos para a loja de açaí de um amigo. O que era para ser apenas uma ajuda rápida me fez descobrir o verdadeiro poder do audiovisual: eu vi, na prática, como um vídeo bem feito era capaz de trazer clientes reais para o balcão.',
    'Essa faísca virou minha profissão. De 2024 para cá, refinei meu olhar, aprofundei minhas técnicas e escalei meus projetos. Hoje, troquei as tigelas de açaí por campanhas para empresas e corporações, ajudando marcas a se posicionarem com autoridade no mercado digital. O cenário mudou, as ferramentas evoluíram, mas a essência continua a mesma: a paixão por contar uma história que prende e emociona.',
  ],
  arsenal: 'Não acredito em vídeos engessados. Acredito em estratégia aliada à estética. Para garantir um resultado cinematográfico e de alta retenção, domino todas as etapas da produção audiovisual:',
  contact: 'Se você procura um editor que apenas aperta botões, talvez eu não seja a pessoa certa. Mas se você busca um parceiro estratégico que entende de retenção, emoção e conversão, nós precisamos conversar.',
}

export const navigation = [
  { id: 'jornada', label: 'A Jornada' },
  { id: 'acervo', label: 'O Acervo' },
  { id: 'grimorio', label: 'O Grimório' },
  { id: 'feedbacks', label: 'Feedbacks' },
  { id: 'epilogo', label: 'A Sua História' },
]

export const skills = [
  { symbol: 'script', title: 'Roteirização e Storytelling', description: 'Antes do REC, existe a ideia. Crio roteiros estruturados para prender a atenção nos primeiros segundos e conduzir o espectador até a conversão.' },
  { symbol: 'camera', title: 'Captação de Imagem', description: 'Um olhar direcionado para extrair os melhores ângulos, luzes e movimentos que a sua marca precisa.' },
  { symbol: 'edit', title: 'Montagem', description: 'Agilidade e precisão. Utilizo o CapCut Pro em seu potencial máximo para criar montagens dinâmicas, com efeitos de alta retenção e cortes no ritmo exato da atenção humana.' },
  { symbol: 'color', title: 'Color Grading', description: 'Correção e colorização estratégica para criar a atmosfera perfeita e transmitir o "mood" exato da sua marca.' },
  { symbol: 'sound', title: 'Tratamento de Áudio', description: 'Um áudio ruim destrói um bom vídeo. Garanto vozes nítidas, sound design imersivo e trilhas sonoras que ditam o ritmo da emoção.' },
  { symbol: 'trend', title: 'Trend Hunting', description: 'Estou sempre mapeando o mercado. Trago para a sua marca o que está em alta, adaptando tendências virais para o seu nicho com originalidade.' },
  { symbol: 'time', title: 'Gestão de Projetos', description: 'Criatividade não é desculpa para desorganização. Trabalho com cronogramas claros, processos definidos e entregas rigorosamente no prazo.' },
]

export type Testimonial = { id: string; image: string; alt: string }
const testimonialFiles = [
  'WhatsApp Image 2026-10-27 at 21.33.41.jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.42.jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.42 (1).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.42 (2).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.42 (3).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.42 (4).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.42 (5).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.43.jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.43 (1).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.43 (2).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.43 (3).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.43 (4).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.43 (5).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.43 (6).jpeg',
  'WhatsApp Image 2026-10-27 at 21.33.44.jpeg',
]

export const testimonials: Testimonial[] = testimonialFiles.map((file, index) => ({
  id: `feedback-${index + 1}`,
  image: `/assets/testimonials/${encodeURIComponent(file)}`,
  alt: `Captura original de conversa com cliente, registro ${index + 1} de ${testimonialFiles.length}.`,
}))

const videoEntry = (project: Project): VideoEntry => ({ id: project.id, title: project.title, url: project.src || `https://www.youtube.com/shorts/${project.youtubeId}`, category: project.category, description: project.description, poster: project.poster, format: project.format || 'landscape' })

export const defaultContent: SiteContent = {
  version: 1,
  general: { name: site.name, author: site.author, role: 'Editor & Storyteller', channel: site.channel, whatsapp: site.whatsapp, message: site.message },
  navigation: { journey: 'A Jornada', portfolio: 'O Acervo', arsenal: 'O Grimório', feedbacks: 'Feedbacks', contact: 'A Sua História' },
  visible: { journey: true, portfolio: true, arsenal: true, feedbacks: true, contact: true },
  hero: { title: site.hero.title, description: site.hero.description, cta: 'Assista ao demoreel', tagline: 'A mesma essência, novos horizontes.', signature: 'Audiovisual com propósito', featuredId: projects[1].id, video: videoEntry(site.hero.video) },
  journey: { heading: { prelude: 'De onde vim e onde cheguei:', title: 'A Jornada' }, paragraphs: site.journey, image: artwork.journey.src, alt: artwork.journey.alt, caption: 'O cenário muda. A essência permanece.' },
  portfolio: { heading: { prelude: 'Acervo de contos', title: 'Portfólio' }, intro: 'Conheça alguns dos projetos que ganharam vida através da edição.', empty: 'Novas histórias serão adicionadas em breve.', videos: projects.map(videoEntry) },
  arsenal: { heading: { prelude: 'O meu arsenal', title: 'O Grimório' }, subtitle: 'Como eu construo o seu vídeo.', intro: site.arsenal, skills },
  feedbacks: { heading: { prelude: 'Feedbacks', title: 'Dos Clientes' }, intro: 'Histórias reais de quem já confiou no meu trabalho.', empty: 'Novos feedbacks serão adicionados em breve.', items: testimonials.map(item => ({ ...item, text: '', name: '', role: '' })) },
  contact: { heading: { prelude: 'Vamos contar', title: 'A Sua História?' }, text: site.contact, cta: 'Escreva o Seu Próximo Capítulo', unavailable: 'O contato por WhatsApp será disponibilizado em breve.', image: artwork.epilogue.src, alt: artwork.epilogue.alt, caption: 'Todo grande projeto começa\ncom uma boa conversa.' },
  footer: { description: 'Marcos · Edição de vídeo & Storytelling', tagline: 'Histórias feitas para permanecer.' },
  appearance: { paper: '#e8d7b3', ink: '#39291e', gold: '#a3874f', accent: '#722c32', night: '#120c09', headingFont: 'Cinzel', bodyFont: 'Lora', texture: '/assets/art/parchment.webp' },
}
