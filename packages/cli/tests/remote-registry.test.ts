import type { Server } from 'node:http'
// @vitest-environment node
import type { RegistryItem } from '../src/index.ts'
import { Buffer } from 'node:buffer'
import { execFile } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'
import { exportRegistryItem, installRegistryItems, resolveRegistryItems } from '../src/index.ts'

const execute = promisify(execFile)
const cli = resolve(__dirname, '../src/index.ts')
const roots: string[] = []
const servers: Server[] = []

function temporaryProject() {
  const root = mkdtempSync(join(tmpdir(), 'varo-third-party-'))
  roots.push(root)
  return root
}

function item(name: string, overrides: Partial<RegistryItem> = {}): RegistryItem {
  return {
    name,
    type: 'component',
    title: name,
    description: `${name} from a third party`,
    docs: `/components/${name}`,
    targets: ['h5', 'weapp'],
    registryDependencies: [],
    files: ['h5', 'weapp'].map(target => ({
      target: target as 'h5' | 'weapp',
      from: `registry/components/${name}/${target}.ts`,
      to: `src/components/${name}.ts`,
    })),
    ...overrides,
  }
}

async function serve(routes: Record<string, string | { status: number, location?: string }>) {
  const requests: string[] = []
  const server = createServer((request, response) => {
    const path = request.url!
    requests.push(path)
    const route = routes[path]
    if (route === undefined) { response.writeHead(404).end(); return }
    if (typeof route === 'string') { response.end(route); return }
    response.writeHead(route.status, route.location ? { location: route.location } : {}).end()
  })
  servers.push(server)
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') { throw new Error('No HTTP fixture address') }
  return { requests, url: `http://127.0.0.1:${address.port}` }
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
    server.closeAllConnections()
  })))
  for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})

describe('third-party registries', () => {
  it('installs from the selected HTTP root, scopes dependencies there, and encodes source paths', async () => {
    const custom = item('custom', {
      registryDependencies: ['helper'],
      files: [{ target: 'h5', from: 'registry/components/custom/组件 +@[demo].ts', to: 'src/components/custom.ts' }],
      targets: ['h5'],
      targetDependencies: { h5: ['vue'], weapp: ['wevu'] },
      targetDevDependencies: { h5: ['typescript'] },
    })
    const { url, requests } = await serve({
      '/nested/registry/components/custom/registry.json': JSON.stringify(custom),
      '/nested/registry/components/helper/registry.json': JSON.stringify(item('helper')),
      '/nested/registry/components/helper/h5.ts': 'export const helper = 42\n',
      '/nested/registry/components/custom/%E7%BB%84%E4%BB%B6%20%2B%40%5Bdemo%5D.ts': 'export { helper } from "./helper"\n',
    })
    const projectRoot = temporaryProject()
    const { stdout } = await execute(process.execPath, [
      cli,
      'add',
      '--registry',
      `${url}/nested/registry`,
      '--target=h5',
      'custom',
      'helper',
    ], { cwd: projectRoot })
    expect(readFileSync(join(projectRoot, 'src/components/custom.ts'), 'utf8')).toBe('export { helper } from "./helper"\n')
    expect(readFileSync(join(projectRoot, 'src/components/helper.ts'), 'utf8')).toBe('export const helper = 42\n')
    expect(stdout).toContain('Dependencies: vue')
    expect(stdout).toContain('Dev dependencies: typescript')
    expect(stdout).not.toContain('wevu')
    expect(requests.filter(path => path.endsWith('/helper/registry.json'))).toHaveLength(1)
    expect(readdirSync(projectRoot)).toEqual(['src'])
  })

  it('rejects remote cycles before fetching source or writing consumer files', async () => {
    const { url, requests } = await serve({
      '/components/alpha/registry.json': JSON.stringify(item('alpha', { registryDependencies: ['beta'] })),
      '/components/beta/registry.json': JSON.stringify(item('beta', { registryDependencies: ['alpha'] })),
    })
    const projectRoot = temporaryProject()
    await expect(installRegistryItems(['alpha'], { registryRoot: url, projectRoot })).rejects.toThrow(/Cyclic registry dependency/)
    expect(requests).toHaveLength(2)
    expect(readdirSync(projectRoot)).toEqual([])
  })

  it('does not replace existing files when any remote source fails to download', async () => {
    const { url } = await serve({
      '/components/alpha/registry.json': JSON.stringify(item('alpha', { registryDependencies: ['beta'] })),
      '/components/beta/registry.json': JSON.stringify(item('beta')),
      '/components/beta/h5.ts': 'replacement\n',
      '/components/alpha/h5.ts': { status: 503 },
    })
    const projectRoot = temporaryProject()
    const existing = join(projectRoot, 'src/components/beta.ts')
    mkdirSync(dirname(existing), { recursive: true })
    writeFileSync(existing, 'consumer customization\n')
    await expect(installRegistryItems(['alpha'], {
      registryRoot: url,
      projectRoot,
      target: 'h5',
      force: true,
    })).rejects.toThrow(/HTTP 503/)
    expect(readFileSync(existing, 'utf8')).toBe('consumer customization\n')
    expect(readdirSync(dirname(existing))).toEqual(['beta.ts'])
  })

  it('rejects remote traversal before fetching an escaped source', async () => {
    const { url, requests } = await serve({
      '/components/escape/registry.json': JSON.stringify(item('escape', {
        targets: ['h5'],
        files: [{ target: 'h5', from: 'registry/../secret.ts', to: 'src/escape.ts' }],
      })),
    })
    const projectRoot = temporaryProject()
    await expect(installRegistryItems(['escape'], { registryRoot: url, projectRoot, target: 'h5' })).rejects.toThrow(/file.from must stay within/)
    expect(requests).toEqual(['/components/escape/registry.json'])
    expect(readdirSync(projectRoot)).toEqual([])
  })

  it('refuses redirects instead of following a registry outside its selected root', async () => {
    const { url, requests } = await serve({
      '/components/redirect/registry.json': { status: 302, location: '/outside.json' },
      '/outside.json': JSON.stringify(item('redirect')),
    })
    await expect(resolveRegistryItems(['redirect'], { registryRoot: url })).rejects.toThrow(/HTTP 302/)
    expect(requests).toEqual(['/components/redirect/registry.json'])
  })

  it('rejects oversized remote payloads before creating consumer files', async () => {
    const { url } = await serve({
      '/components/large/registry.json': JSON.stringify(item('large')),
      '/components/large/weapp.ts': 'x'.repeat(10 * 1024 * 1024 + 1),
    })
    const projectRoot = temporaryProject()
    await expect(installRegistryItems(['large'], { registryRoot: url, projectRoot })).rejects.toThrow(/exceeds 10 MiB/)
    expect(readdirSync(projectRoot)).toEqual([])
  })

  it('exports self-contained target-specific shadcn payloads through the executable', async () => {
    const root = temporaryProject()
    const registryRoot = join(root, 'registry')
    const custom = item('custom', { targetRegistryDependencies: { h5: ['helper'] } })
    for (const manifest of [custom, item('helper', { dependencies: ['vue'] })]) {
      const directory = join(registryRoot, 'components', manifest.name)
      mkdirSync(directory, { recursive: true })
      writeFileSync(join(directory, 'registry.json'), JSON.stringify(manifest))
      for (const target of ['h5', 'weapp']) {
        writeFileSync(join(directory, `${target}.ts`), `export const ${manifest.name} = '${target}'\n`)
      }
    }
    const { stdout } = await execute(process.execPath, [cli, 'export', `--registry=${registryRoot}`, '--target', 'h5', 'custom'])
    const exported = JSON.parse(stdout)
    expect(exported.registryDependencies).toEqual([])
    expect(exported.dependencies).toEqual(['vue'])
    expect(exported.files.map((file: { target: string, content: string }) => [file.target, file.content])).toEqual([
      ['~/src/components/helper.ts', 'export const helper = \'h5\'\n'],
      ['~/src/components/custom.ts', 'export const custom = \'h5\'\n'],
    ])
    const weapp = await exportRegistryItem('custom', { registryRoot, target: 'weapp' })
    expect(weapp.files.map(file => file.content)).toEqual(['export const custom = \'weapp\'\n'])
    expect(weapp.dependencies).toEqual([])
    const consumer = temporaryProject()
    await execute(process.execPath, [cli, 'add', '--registry', registryRoot, '--target', 'weapp', 'custom'], { cwd: consumer })
    expect(readFileSync(join(consumer, 'src/components/custom.ts'), 'utf8')).toBe('export const custom = \'weapp\'\n')
  })

  it('rejects export collisions rather than leaving overwrites to external installers', async () => {
    const file = { target: 'h5' as const, from: 'registry/shared.ts', to: 'src/shared.ts' }
    const { url } = await serve({
      '/components/alpha/registry.json': JSON.stringify(item('alpha', { targets: ['h5'], files: [file], registryDependencies: ['beta'] })),
      '/components/beta/registry.json': JSON.stringify(item('beta', { targets: ['h5'], files: [{ ...file, to: 'src/SHARED.ts' }] })),
    })
    await expect(exportRegistryItem('alpha', { registryRoot: url, target: 'h5' })).rejects.toThrow(/target the same file/)
  })

  it('rejects non-UTF8 exports without changing byte-preserving installs', async () => {
    const root = temporaryProject()
    const registryRoot = join(root, 'registry')
    const directory = join(registryRoot, 'components/binary')
    const bytes = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    mkdirSync(directory, { recursive: true })
    writeFileSync(join(directory, 'asset.png'), bytes)
    writeFileSync(join(directory, 'registry.json'), JSON.stringify(item('binary', {
      targets: ['h5'],
      files: [{ target: 'h5', from: 'registry/components/binary/asset.png', to: 'src/assets/asset.png' }],
    })))
    const consumer = temporaryProject()

    await installRegistryItems(['binary'], { registryRoot, projectRoot: consumer, target: 'h5' })
    expect(readFileSync(join(consumer, 'src/assets/asset.png'))).toEqual(bytes)
    await expect(exportRegistryItem('binary', { registryRoot, target: 'h5' })).rejects.toThrow(/UTF-8/)
  })

  it('preserves Unicode, BOM, line endings, and empty UTF8 files in exports', async () => {
    const root = temporaryProject()
    const registryRoot = join(root, 'registry')
    const directory = join(registryRoot, 'components/text')
    const bytes = Buffer.from('\uFEFFexport const 标题 = "你好";\r\n')
    mkdirSync(directory, { recursive: true })
    writeFileSync(join(directory, 'text.ts'), bytes)
    writeFileSync(join(directory, 'empty.ts'), '')
    writeFileSync(join(directory, 'registry.json'), JSON.stringify(item('text', {
      targets: ['h5'],
      files: ['text', 'empty'].map(name => ({
        target: 'h5',
        from: `registry/components/text/${name}.ts`,
        to: `src/lib/${name}.ts`,
      })),
    })))

    const exported = await exportRegistryItem('text', { registryRoot, target: 'h5' })
    expect(Buffer.from(exported.files[0]!.content)).toEqual(bytes)
    expect(exported.files[1]!.content).toBe('')
  })

  it.each([false, true])('rejects file/directory conflicts regardless of order (reversed: %s)', async (reverse) => {
    const root = temporaryProject()
    const registryRoot = join(root, 'registry')
    const directory = join(registryRoot, 'components/tree')
    const files = ['src/Shared.ts', 'src/shared.ts/child.ts'].map((to, index) => ({
      target: 'h5' as const,
      from: `registry/components/tree/file-${index}.ts`,
      to,
    }))
    mkdirSync(directory, { recursive: true })
    files.forEach(file => writeFileSync(join(root, file.from), 'export const value = true\n'))
    if (reverse) { files.reverse() }
    writeFileSync(join(directory, 'registry.json'), JSON.stringify(item('tree', { targets: ['h5'], files })))
    const consumer = temporaryProject()

    await expect(exportRegistryItem('tree', { registryRoot, target: 'h5' })).rejects.toThrow(/file and its descendant/)
    await expect(installRegistryItems(['tree'], {
      registryRoot,
      projectRoot: consumer,
      target: 'h5',
    })).rejects.toThrow(/file and its descendant/)
    expect(readdirSync(consumer)).toEqual([])
  })
})
