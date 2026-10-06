import assert from 'node:assert/strict'
import { existsSync, realpathSync } from 'node:fs'
import { isAbsolute, relative, sep } from 'node:path'

// Both compilers must resolve real files inside the fresh consumer, including npm SFCs.
export function consumerIsolation() {
  const root = realpathSync(process.env.VARO_CONSUMER_ROOT)
  return {
    name: 'varo-consumer-isolation',
    enforce: 'pre',
    load(id) {
      const path = id.split('?')[0]
      if (!isAbsolute(path) || !existsSync(path)) { return null }
      const offset = relative(root, realpathSync(path))
      assert(offset !== '..' && !offset.startsWith(`..${sep}`) && !isAbsolute(offset), `Consumer module escapes its isolated install: ${id}`)
      return null
    },
  }
}
