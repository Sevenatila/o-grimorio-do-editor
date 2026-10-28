import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { defaultContent } from '../data/content'
import { parseContent, type SiteContent } from '../lib/content-model'
import { readContent } from '../lib/content-api'

export const ContentContext = createContext<SiteContent>(defaultContent)
export const useContent = () => useContext(ContentContext)
const cacheKey = 'grimorio:published:v1'

export function PublishedContentProvider({ children }: { children: ReactNode }) {
  const preview = new URLSearchParams(location.search).get('preview') === 'admin' && window.parent !== window
  const [content, setContent] = useState(() => {
    if (preview) return defaultContent
    try { const saved = localStorage.getItem(cacheKey); return saved ? parseContent(JSON.parse(saved)) : defaultContent } catch { return defaultContent }
  })
  useEffect(() => {
    if (preview) {
      const receive = (event: MessageEvent) => {
        if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'grimorio:preview') return
        try { setContent(parseContent(event.data.content, true)) } catch { /* Wait for a valid draft while a field is being edited. */ }
      }
      window.addEventListener('message', receive)
      window.parent.postMessage({ type: 'grimorio:preview-ready' }, location.origin)
      return () => window.removeEventListener('message', receive)
    }
    const controller = new AbortController()
    const refresh = () => { void readContent(controller.signal).then(result => {
      const next = result.content || defaultContent
      setContent(next)
      try { localStorage.setItem(cacheKey, JSON.stringify(next)) } catch { /* Rendering still works if browser storage is full. */ }
    }).catch(() => {}) }
    refresh()
    const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('grimorio:content') : null
    if (channel) channel.onmessage = refresh
    window.addEventListener('focus', refresh)
    return () => { controller.abort(); channel?.close(); window.removeEventListener('focus', refresh) }
  }, [preview])
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}
