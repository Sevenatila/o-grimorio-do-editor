import { put } from '@vercel/blob'
import { mkdir, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { body, reply, sameOrigin, type HttpRequest, type HttpResponse } from '../server/http.js'

export default async function handler(request: HttpRequest, response: HttpResponse) {
  if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return reply(response, 405, { error: 'Método não permitido.' }) }
  if (!sameOrigin(request)) return reply(response, 403, { error: 'Envie a imagem pelo painel deste site.' })
  try {
    const input = await body(request, 4_100_000)
    const match = typeof input.data === 'string' && input.data.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/)
    if (!match) return reply(response, 400, { error: 'Envie uma imagem JPG, PNG ou WebP.' })
    const bytes = Buffer.from(match[2], 'base64')
    const valid = match[1] === 'png' ? bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : match[1] === 'jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP'
    if (!valid || bytes.length > 3_000_000) return reply(response, 400, { error: 'A imagem é inválida ou ultrapassa 3 MB.' })
    const filename = randomUUID() + '.' + (match[1] === 'jpeg' ? 'jpg' : match[1])
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const result = await put('media/' + filename, bytes, { access: 'public', contentType: 'image/' + match[1], addRandomSuffix: false })
      return reply(response, 200, { url: result.url })
    }
    if (process.env.VERCEL) return reply(response, 503, { error: 'O armazenamento de imagens ainda não está configurado.' })
    await mkdir(join(process.cwd(), 'public', 'uploads'), { recursive: true })
    await writeFile(join(process.cwd(), 'public', 'uploads', filename), bytes)
    return reply(response, 200, { url: '/uploads/' + filename })
  } catch { return reply(response, 503, { error: 'Não foi possível enviar a imagem. Tente novamente.' }) }
}
