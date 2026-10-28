import { get, put, BlobPreconditionFailedError } from '@vercel/blob'
import { randomUUID } from 'node:crypto'
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises'
import { join } from 'node:path'
import type { SiteContent } from '../src/lib/content-model'

type Saved = { content: SiteContent; updatedAt: string }
const namespace = process.env.VERCEL_ENV || 'development'
const pathname = namespace + '/site-content.json'
const localPath = join(process.cwd(), '.tools', 'admin', 'content.json')
const contentToken = () => process.env.CONTENT_READ_WRITE_TOKEN
export class ConflictError extends Error {}
// Public downloads can return a weak HTTP ETag; writes require the strong value.
const revisionTag = (etag: string) => etag.replace(/^W\//, '')
export const storageName = () => contentToken() ? 'vercel-blob' : process.env.VERCEL ? 'unavailable' : 'local-development'

export async function readSaved() {
  if (contentToken()) {
    const result = await get(pathname, { access: 'private', token: contentToken(), useCache: false })
    if (!result?.stream) return { content: null, revision: null, updatedAt: null, storage: storageName() }
    const saved = JSON.parse(await new Response(result.stream).text()) as Saved
    return { ...saved, revision: revisionTag(result.blob.etag), storage: storageName() }
  }
  if (process.env.VERCEL) throw new Error('O armazenamento do painel ainda não está configurado.')
  try { return { ...JSON.parse(await readFile(localPath, 'utf8')), storage: storageName() } }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; return { content: null, revision: null, updatedAt: null, storage: storageName() } }
}

let localQueue: Promise<unknown> = Promise.resolve()
export async function writeSaved(content: SiteContent, revision: string | null) {
  const commit = async () => {
    const current = await readSaved()
    if (current.revision !== revision) throw new ConflictError('O site foi atualizado em outro lugar. Exporte seu rascunho e recarregue o conteúdo salvo antes de continuar.')
    const saved = { content, updatedAt: new Date().toISOString() }
    if (contentToken()) {
      try {
        const result = await put(pathname, JSON.stringify(saved), { access: 'private', token: contentToken(), contentType: 'application/json', addRandomSuffix: false, allowOverwrite: !!revision, ...(revision ? { ifMatch: revision } : {}), cacheControlMaxAge: 60 })
        return { ...saved, revision: revisionTag(result.etag), storage: storageName() }
      } catch (error) {
        if (error instanceof BlobPreconditionFailedError || String(error).includes('already exists')) throw new ConflictError('Outra alteração foi salva agora. Recarregue o conteúdo salvo para continuar.')
        throw error
      }
    }
    const result = { ...saved, revision: randomUUID(), storage: storageName() }
    await mkdir(join(process.cwd(), '.tools', 'admin'), { recursive: true })
    const temporary = localPath + '.' + randomUUID() + '.tmp'
    await writeFile(temporary, JSON.stringify(result), 'utf8')
    await rename(temporary, localPath)
    return result
  }
  if (contentToken()) return commit()
  const pending = localQueue.then(commit, commit)
  localQueue = pending.catch(() => {})
  return pending
}
