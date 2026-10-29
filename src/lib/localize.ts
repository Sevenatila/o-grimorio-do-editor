import type { SiteContent } from './content-model'

export type Locale = 'pt' | 'en'
export const localeFromPath = (pathname: string): Locale => /^\/en(?:\/|$)/.test(pathname) ? 'en' : 'pt'

export function localizeContent(content: SiteContent, locale: Locale): SiteContent {
  if (locale === 'pt') return content
  const en = content.english
  const videos = new Map(en.portfolio.videos.map(item => [item.id, item]))
  const feedbacks = new Map(en.feedbacks.items.map(item => [item.id, item]))
  return {
    ...content,
    general: { ...content.general, ...en.general },
    navigation: en.navigation,
    hero: { ...content.hero, ...en.hero, video: { ...content.hero.video, title: en.hero.videoTitle, category: en.hero.videoCategory, description: en.hero.videoDescription } },
    journey: { ...content.journey, ...en.journey },
    portfolio: { ...content.portfolio, ...en.portfolio, videos: content.portfolio.videos.map(video => {
      const translated = videos.get(video.id)
      return { ...video, title: translated?.title || video.title, category: translated?.category || video.category, description: translated?.description || video.description }
    }) },
    arsenal: { ...content.arsenal, ...en.arsenal, skills: content.arsenal.skills.map((skill, index) => ({ ...skill, ...en.arsenal.skills[index] })) },
    feedbacks: { ...content.feedbacks, ...en.feedbacks, items: content.feedbacks.items.map((item, index) => {
      const translated = feedbacks.get(item.id)
      return { ...item, alt: translated?.alt || `Original client conversation, screenshot ${index + 1} of ${content.feedbacks.items.length}.`, text: translated?.text || item.text, role: translated?.role || item.role }
    }) },
    contact: { ...content.contact, ...en.contact },
    footer: en.footer,
  }
}
