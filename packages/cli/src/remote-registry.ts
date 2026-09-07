import { Buffer } from 'node:buffer'

const maximumResponseBytes = 10 * 1024 * 1024

export function getRemoteRegistryRoot(root: string): URL | undefined {
  // A drive-letter path is local; other explicit schemes must be HTTP(S).
  if (!/^[a-z][a-z\d+.-]*:/i.test(root) || /^[a-z]:[\\/]/i.test(root)) { return }
  const url = new URL(root)
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Remote registry must use HTTP or HTTPS')
  }
  if (url.username || url.password || url.search || url.hash) {
    throw new Error('Registry URL must not contain credentials, query parameters, or a fragment')
  }
  if (!url.pathname.endsWith('/')) { url.pathname += '/' }
  return url
}

export function registryUrl(root: URL, path: string): string {
  // Manifest paths are validated before use. Encode literal URL delimiters in file names.
  return new URL(path.split('/').map(encodeURIComponent).join('/'), root).href
}

export async function fetchRegistryFile(url: string): Promise<Buffer> {
  const response = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok || !response.body) {
    await response.body?.cancel()
    throw new Error(`Failed to fetch registry file ${url}: HTTP ${response.status}; redirects are not followed`)
  }

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) { break }
      length += value.byteLength
      if (length > maximumResponseBytes) {
        throw new Error(`Registry response exceeds 10 MiB: ${url}`)
      }
      chunks.push(value)
    }
  }
  finally {
    await reader.cancel()
    reader.releaseLock()
  }
  return Buffer.concat(chunks, length)
}
