import type { IncomingMessage, ServerResponse } from 'node:http'
export type HttpRequest = IncomingMessage & { body?: unknown }
export type HttpResponse = ServerResponse

export function reply(response: HttpResponse, status: number, body: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.end(JSON.stringify(body))
}

export function sameOrigin(request: HttpRequest): boolean {
  const origin = request.headers.origin
  if (!origin) return true
  try { return new URL(origin).host === request.headers.host } catch { return false }
}

export async function body(request: HttpRequest, maxBytes = 1_000_000): Promise<Record<string, unknown>> {
  if (request.body !== undefined) {
    const raw = typeof request.body === 'string' ? request.body : JSON.stringify(request.body)
    if (Buffer.byteLength(raw) > maxBytes) throw new Error('O conteúdo ultrapassa o tamanho permitido.')
    return typeof request.body === 'string' ? JSON.parse(raw) : request.body as Record<string, unknown>
  }
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const bytes = Buffer.from(chunk)
    size += bytes.length
    if (size > maxBytes) throw new Error('O conteúdo ultrapassa o tamanho permitido.')
    chunks.push(bytes)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
