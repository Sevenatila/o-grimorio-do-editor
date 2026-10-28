import { parseContent, type SiteContent } from './content-model'

export type ContentResponse = { content: SiteContent | null; revision: string | null; updatedAt: string | null; storage: string }

export async function readContent(signal?: AbortSignal): Promise<ContentResponse> {
  const response = await fetch('/api/content', { cache: 'no-store', signal })
  if (!response.ok) throw new Error('Não foi possível carregar o conteúdo salvo. Tente novamente.')
  const result = await response.json()
  return { ...result, content: result.content ? parseContent(result.content) : null }
}

export async function saveContent(content: SiteContent, revision: string | null): Promise<ContentResponse> {
  const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: parseContent(content), revision }) })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Não foi possível salvar. As alterações continuam no seu rascunho.')
  return { ...result, content: parseContent(result.content) }
}

export async function uploadImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Escolha uma imagem JPG, PNG ou WebP.')
  if (file.size > 3_000_000) throw new Error('A imagem deve ter até 3 MB. Você também pode informar um link.')
  const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })
  const response = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data, name: file.name }) })
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.error || 'Não foi possível enviar a imagem.')
  return result.url
}
