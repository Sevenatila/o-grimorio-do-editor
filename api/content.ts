import { parseContent } from '../src/lib/content-model.js'
import { ConflictError, readSaved, writeSaved } from '../server/content-store.js'
import { body, reply, sameOrigin, type HttpRequest, type HttpResponse } from '../server/http.js'

export default async function handler(request: HttpRequest, response: HttpResponse) {
  try {
    if (request.method === 'GET') return reply(response, 200, await readSaved())
    if (request.method !== 'PUT') { response.setHeader('Allow', 'GET, PUT'); return reply(response, 405, { error: 'Método não permitido.' }) }
    if (!sameOrigin(request)) return reply(response, 403, { error: 'Salve as alterações pelo painel deste site.' })
    const input = await body(request)
    if (input.revision !== null && typeof input.revision !== 'string') return reply(response, 400, { error: 'Recarregue o conteúdo salvo e tente novamente.' })
    let content
    try { content = parseContent(input.content) } catch (error) { return reply(response, 400, { error: (error as Error).message }) }
    return reply(response, 200, await writeSaved(content, input.revision as string | null))
  } catch (error) {
    if (error instanceof ConflictError) return reply(response, 409, { error: error.message })
    console.error('Content storage request failed:', error instanceof Error ? error.name : 'unknown error')
    return reply(response, 503, { error: 'Não foi possível acessar o armazenamento. Seu rascunho foi mantido; tente salvar novamente.' })
  }
}
