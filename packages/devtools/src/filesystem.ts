import { Buffer, isUtf8 } from 'node:buffer'
import { constants } from 'node:fs'
import { lstat, open, realpath } from 'node:fs/promises'
import { isAbsolute, relative, resolve, sep } from 'node:path'

export const maxOutputBytes = 256 * 1024

export function assertRelativePath(path: string): void {
  if (!path || isAbsolute(path) || path.includes('\\') || path.includes('\0')
    || path.split('/').some(part => part === '' || part === '.' || part === '..')) {
    throw new Error('Expected a contained relative path')
  }
}

export async function containedPath(root: string, path: string): Promise<string> {
  assertRelativePath(path)
  let current = root
  for (const part of path.split('/')) {
    current = resolve(current, part)
    if ((await lstat(current)).isSymbolicLink()) {
      throw new Error('Symbolic links are not allowed in tool paths')
    }
  }
  const canonical = await realpath(current)
  const fromRoot = relative(root, canonical)
  if (!fromRoot || fromRoot === '..' || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    throw new Error('Path is outside the allowed root')
  }
  return canonical
}

export async function readText(root: string, path: string, limit = maxOutputBytes): Promise<string> {
  const absolute = await containedPath(root, path)
  const handle = await open(absolute, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK)
  try {
    const stats = await handle.stat()
    if (!stats.isFile()) { throw new Error('Only regular files can be read') }
    if (stats.size > limit) { throw new Error(`File exceeds the ${limit}-byte limit`) }
    // Read at most limit + 1 even if another local writer grows the file after stat.
    const bytes = Buffer.alloc(Math.min(stats.size + 1, limit + 1))
    let length = 0
    while (length < bytes.length) {
      const result = await handle.read(bytes, length, bytes.length - length, null)
      if (result.bytesRead === 0) { break }
      length += result.bytesRead
    }
    if (length > stats.size || length > limit) { throw new Error('File changed or exceeded the read limit') }
    const content = bytes.subarray(0, length)
    if (!isUtf8(content)) { throw new Error('Only UTF-8 text can be read') }
    return content.toString('utf8')
  }
  finally {
    await handle.close()
  }
}

export function boundedJson(value: unknown): string {
  const text = JSON.stringify(value)
  if (Buffer.byteLength(text) > maxOutputBytes) {
    throw new Error(`Response exceeds the ${maxOutputBytes}-byte limit; request a smaller selection`)
  }
  return text
}
