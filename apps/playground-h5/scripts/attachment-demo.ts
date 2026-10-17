import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { Buffer } from 'node:buffer'
import { createHash, randomUUID } from 'node:crypto'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Readable } from 'node:stream'
import { setTimeout as delay } from 'node:timers/promises'

const route = '/__varo_attachment_demo/upload'
const maxFileBytes = 8 * 1024 * 1024
const maxBodyBytes = maxFileBytes + 64 * 1024
const maxStoredBytes = 32 * 1024 * 1024

class Rejection extends Error {
  constructor(readonly status: number, message: string) { super(message) }
}

/** Development-only real storage, never part of the product runtime. */
export function attachmentDemoPlugin(): Plugin {
  let directory: string | undefined
  let closing = false
  let storedBytes = 0
  let storedFiles = 0
  let reserved = 0
  const pending = new Set<Promise<void>>()
  const requests = new Set<IncomingMessage>()
  let cleanupPromise: Promise<void> | undefined

  function cleanup(): Promise<void> {
    if (!cleanupPromise) {
      closing = true
      for (const request of requests) { request.destroy() }
      cleanupPromise = (async () => {
        await Promise.allSettled(pending)
        if (directory) { await rm(directory, { recursive: true, force: true }) }
      })()
    }
    return cleanupPromise
  }

  return {
    name: 'varo-local-attachment-demo',
    apply: 'serve',
    async configureServer(server) {
      directory = await mkdtemp(join(tmpdir(), 'varo-attachment-demo-'))
      server.httpServer?.once('close', () => { void cleanup().catch(error => server.config.logger.error(String(error))) })

      async function handle(req: IncomingMessage, res: ServerResponse) {
        let reservedSlot = false
        let ownedFile: string | undefined
        const deadline = setTimeout(() => req.destroy(new Error('Local upload exceeded its 30-second deadline.')), 30_000)
        try {
          if (closing) { throw new Rejection(503, 'Local attachment service is closing.') }
          if (req.url !== route) { throw new Rejection(404, 'Unknown attachment service path; queries are not supported.') }
          if (req.method !== 'POST') { throw new Rejection(405, 'POST multipart/form-data only.') }
          const allowedOrigins = [...(server.resolvedUrls?.local ?? []), ...(server.resolvedUrls?.network ?? [])].map(value => new URL(value).origin)
          const host = req.headers.host
          const ownOrigin = allowedOrigins.find(value => new URL(value).host === host)
          if (!ownOrigin) { throw new Rejection(403, 'Unexpected Host.') }
          const origin = req.headers.origin
          if (origin != null && origin !== ownOrigin) { throw new Rejection(403, 'Foreign Origin rejected.') }
          // Also required for native clients without Origin. Not authentication.
          if (req.headers['x-varo-attachment-demo'] !== 'local-transfer') { throw new Rejection(403, 'Explicit local-transfer intent required.') }
          if (req.headers['sec-fetch-site'] === 'cross-site') { throw new Rejection(403, 'Cross-site requests rejected.') }
          const contentType = req.headers['content-type'] ?? ''
          if (!/^multipart\/form-data\s*;/i.test(contentType) || req.headers['content-encoding']) { throw new Rejection(415, 'Unencoded multipart/form-data required.') }
          const length = req.headers['content-length']
          if (length != null && (!/^\d+$/.test(length) || Number(length) > maxBodyBytes)) { throw new Rejection(413, 'Multipart body exceeds the byte limit.') }
          const mode = req.headers['x-varo-demo-mode'] ?? 'accept'
          if (mode !== 'accept' && mode !== 'reject') { throw new Rejection(400, 'Unknown local-service mode.') }
          const paced = req.headers['x-varo-demo-pacing'] === 'paced'
          if (req.headers['x-varo-demo-pacing'] && !paced) { throw new Rejection(400, 'Unknown pacing mode.') }
          if (reserved >= 4 || storedFiles + reserved >= 64 || storedBytes + (reserved + 1) * maxFileBytes > maxStoredBytes) {
            throw new Rejection(507, 'Local service quota reached; restart the dev server to clean its owned storage.')
          }
          reserved++
          reservedSlot = true
          let actualBytes = 0
          async function* boundedBody() {
            // destroyOnReturn:false preserves the socket long enough to send a typed HTTP rejection.
            for await (const chunk of req.iterator({ destroyOnReturn: false })) {
              const bytes: Buffer = chunk
              actualBytes += bytes.byteLength
              if (actualBytes > maxBodyBytes) { throw new Rejection(413, 'Actual streamed body exceeds the byte limit.') }
              for (let offset = 0; offset < bytes.byteLength; offset += 16 * 1024) {
                if (closing || req.aborted) { throw new Rejection(503, 'Upload interrupted.') }
                // Deliberate local-service backpressure, not synthesized client progress.
                if (paced) { await delay(40) }
                yield bytes.subarray(offset, offset + 16 * 1024)
              }
            }
          }
          const stream = Readable.toWeb(Readable.from(boundedBody())) as ReadableStream<Uint8Array>
          let form: FormData
          try { form = await new Response(stream, { headers: { 'Content-Type': contentType } }).formData() }
          catch (error) { if (error instanceof Rejection) { throw error }; throw new Rejection(400, 'Malformed multipart body.') }
          const entries = [...form.entries()]
          const file = form.get('file')
          if (entries.length !== 1 || entries[0]?.[0] !== 'file' || file == null || typeof file === 'string') {
            throw new Rejection(400, 'Exactly one file part named file is required.')
          }
          if (file.size > maxFileBytes) { throw new Rejection(413, 'File exceeds 8388608 bytes.') }
          if (!/\.(?:txt|md)$/i.test(file.name)) { throw new Rejection(415, 'Only .txt and .md local-demo documents are accepted.') }
          const bytes = Buffer.from(await file.arrayBuffer())
          try {
            const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
            if (text.includes('\0')) { throw new Error('Binary NUL') }
          }
          catch { throw new Rejection(415, 'The local text service requires valid UTF-8 without NUL bytes; extension is not proof of content.') }
          if (mode === 'reject') { throw new Rejection(503, 'Explicit local-service rejection. Choose recovery and retry a new HTTP request.') }
          if (closing || req.aborted || res.destroyed) { throw new Rejection(503, 'Upload interrupted before storage.') }
          const id = randomUUID()
          ownedFile = join(directory!, id)
          await writeFile(ownedFile, bytes, { flag: 'wx', mode: 0o600 })
          if (closing || req.aborted || res.destroyed) { throw new Rejection(503, 'Upload interrupted before acknowledgement.') }
          storedBytes += bytes.byteLength
          storedFiles++
          ownedFile = undefined
          res.writeHead(201, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
          res.end(JSON.stringify({ id, bytes: bytes.byteLength, sha256: createHash('sha256').update(bytes).digest('hex') }))
        }
        catch (error) {
          if (ownedFile) { await rm(ownedFile, { force: true }) }
          req.pause()
          if (!res.destroyed && !res.headersSent) {
            const rejection = error instanceof Rejection ? error : new Rejection(500, 'Local attachment storage failed.')
            res.writeHead(rejection.status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Connection': 'close' })
            res.end(JSON.stringify({ error: rejection.message }))
          }
        }
        finally {
          clearTimeout(deadline)
          requests.delete(req)
          if (reservedSlot) { reserved-- }
        }
      }

      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/__varo_attachment_demo')) { next(); return }
        requests.add(req)
        const operation = handle(req, res)
        pending.add(operation)
        void operation.then(() => pending.delete(operation), (error) => { pending.delete(operation); server.config.logger.error(String(error)); res.destroy() })
      })
    },
    async closeBundle() { await cleanup() },
  }
}
