import { cp, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const source = resolve(packageRoot, '../../registry')
const target = resolve(packageRoot, 'registry')

await rm(target, { recursive: true, force: true })
await cp(source, target, { recursive: true })
