import type { Server } from 'node:http'
// @vitest-environment node
import { Buffer } from 'node:buffer'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Client } from '@modelcontextprotocol/client'
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio'
import { resolveRegistryItems } from '@varo-ui/cli'
import { afterEach, describe, expect, it } from 'vitest'
import { boundedJson, readText } from '../src/filesystem.ts'
import { getSchema, listSchema, planSchema, RegistryTools, sourceSchema } from '../src/registry.ts'

const roots: string[] = []
const clients: Client[] = []
const servers: Server[] = []
afterEach(async () => {
  await Promise.all(clients.splice(0).map(client => client.close()))
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
    server.closeAllConnections()
  })))
  for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})
async function fixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'varo-tools-')))
  roots.push(root)
  const block = join(root, 'registry/blocks/sample')
  const dependency = join(root, 'registry/utils/shared')
  mkdirSync(block, { recursive: true })
  mkdirSync(dependency, { recursive: true })
  mkdirSync(join(root, 'apps/playground-h5'), { recursive: true })
  const manifest = {
    name: 'sample',
    type: 'block',
    title: 'Sample',
    description: 'A real test block',
    docs: '/blocks/sample',
    targets: ['h5'],
    registryDependencies: ['utils/shared'],
    dependencies: ['vue'],
    files: [{ target: 'h5', from: 'registry/blocks/sample/source.ts', to: 'src/blocks/sample.ts' }],
  }
  writeFileSync(join(block, 'registry.json'), JSON.stringify(manifest))
  writeFileSync(join(block, 'source.ts'), 'export const sample = true\n')
  writeFileSync(join(dependency, 'registry.json'), JSON.stringify({
    ...manifest,
    name: 'shared',
    type: 'util',
    registryDependencies: [],
    files: [{ target: 'h5', from: 'registry/utils/shared/shared.ts', to: 'src/lib/shared.ts' }],
  }))
  writeFileSync(join(dependency, 'shared.ts'), 'export const shared = true\n')
  return { root, block, manifest, tools: await RegistryTools.create(root) }
}

describe('Registry tool filesystem boundary', () => {
  it('derives catalog, profile filters, dependency sources and CLI conflicts from real files', async () => {
    const { root, tools } = await fixture()
    const catalog = await tools.list(listSchema.parse({ limit: 1 }))
    expect(catalog.blocks.map(block => block.id)).toEqual(['blocks/sample'])
    expect(catalog.nextOffset).toBeNull()
    expect((await tools.list(listSchema.parse({ target: 'weapp' }))).total).toBe(0)
    expect((await tools.get('blocks/sample')).registryDependencies).toEqual(['utils/shared'])
    const source = await tools.source({ name: 'blocks/sample', target: 'h5', file: 'registry/utils/shared/shared.ts' })
    expect(source.content).toBe('export const shared = true\n')
    const project = join(root, 'apps/playground-h5')
    expect((await tools.plan({ names: ['blocks/sample'], target: 'h5', project: 'h5' })).conflicts).toEqual([])
    expect(readdirSync(project)).toEqual([])
    mkdirSync(join(project, 'src/blocks'), { recursive: true })
    writeFileSync(join(project, 'src/blocks/sample.ts'), 'local customization')
    const plan = await tools.plan({ names: ['blocks/sample'], target: 'h5', project: 'h5' })
    expect(plan.conflicts).toEqual(['src/blocks/sample.ts'])
    expect(plan.files.map(file => file.to)).toEqual(['src/lib/shared.ts', 'src/blocks/sample.ts'])
    expect(readFileSync(join(project, 'src/blocks/sample.ts'), 'utf8')).toBe('local customization')
    expect(JSON.stringify(plan)).not.toContain(root)
  })

  it.each([
    { document: 'item', indirect: false },
    { document: 'catalog', indirect: false },
    { document: 'item', indirect: true },
    { document: 'catalog', indirect: true },
  ])('keeps default readonly MCP canonical with shadow $document (indirect=$indirect)', async ({ document, indirect }) => {
    const { root, tools } = await fixture()
    const requests: string[] = []
    const server = createServer((request, response) => {
      requests.push(request.url!)
      response.setHeader('Content-Type', 'application/json')
      response.end(JSON.stringify({ name: 'isolated-dependency', type: 'registry:file', files: [] }))
    })
    servers.push(server)
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') { throw new Error('Missing isolated server address') }
    const dependency = `http://127.0.0.1:${address.port}/isolated-dependency.json`
    const shadow = {
      name: 'blocks/sample',
      type: 'registry:block',
      registryDependencies: [indirect ? 'middle' : dependency],
      files: [{ path: 'shadow.ts', type: 'registry:file', target: '~/src/shadow.ts', content: 'export const shadow = true\n' }],
    }
    const middle = { name: 'middle', type: 'registry:file', registryDependencies: ['leaf'], files: [] }
    const leaf = { name: 'leaf', type: 'registry:file', registryDependencies: [dependency], files: [] }
    writeFileSync(join(root, 'registry/registry.json'), JSON.stringify(document === 'item'
      ? shadow
      : {
          name: 'shadow',
          homepage: 'https://example.invalid',
          items: [shadow, middle, leaf],
        }))
    if (document === 'item' && indirect) {
      writeFileSync(join(root, 'registry/middle.json'), JSON.stringify(middle))
      writeFileSync(join(root, 'registry/leaf.json'), JSON.stringify(leaf))
    }

    const entry = join(root, 'server.mjs')
    const implementation = new URL('../src/index.ts', import.meta.url).href
    writeFileSync(entry, `import { startVaroMcp } from ${JSON.stringify(implementation)};\nawait startVaroMcp({ workspaceRoot: ${JSON.stringify(root)} });\n`)
    const client = new Client({ name: 'varo-readonly-boundary-test', version: '1.0.0' })
    clients.push(client)
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [entry], cwd: root, stderr: 'pipe' }))
    const sourceInput = { name: 'blocks/sample', target: 'h5' as const, file: 'registry/utils/shared/shared.ts' }
    const planInput = { names: ['blocks/sample'], target: 'h5' as const, project: 'h5' as const }
    const source = await tools.source(sourceInput)
    expect(source.content).toBe('export const shared = true\n')
    expect(requests).toEqual([])
    const sourceResponse = await client.callTool({ name: 'varo_blocks_source', arguments: sourceInput })
    expect(sourceResponse.isError).not.toBe(true)
    expect(JSON.parse(sourceResponse.content.map(part => part.type === 'text' ? part.text : '').join('\n'))).toEqual(source)
    expect(requests).toEqual([])
    const plan = await tools.plan(planInput)
    expect(plan.items.map(item => item.name)).toEqual(['shared', 'sample'])
    expect(plan.files.map(file => file.to)).toEqual(['src/lib/shared.ts', 'src/blocks/sample.ts'])
    expect(requests).toEqual([])
    const planResponse = await client.callTool({ name: 'varo_install_plan', arguments: planInput })
    expect(planResponse.isError).not.toBe(true)
    expect(JSON.parse(planResponse.content.map(part => part.type === 'text' ? part.text : '').join('\n'))).toEqual(plan)
    expect(requests).toEqual([])
    expect(readdirSync(join(root, 'apps/playground-h5'))).toEqual([])

    // Positive control: the shadow is valid and the ordinary CLI still supports
    // its remote dependency. Only the readonly MCP boundary forbids that path.
    const auto = await resolveRegistryItems(['blocks/sample'], { registryRoot: join(root, 'registry'), target: 'h5' })
    expect(auto.items.map(item => item.name)).toContain('isolated-dependency')
    expect(auto.files.map(file => file.to)).toEqual(['src/shadow.ts'])
    expect(requests).toEqual(['/isolated-dependency.json'])
  }, 20_000)

  it.each(['../secret', '/etc/passwd', 'registry/../secret', 'registry\\secret', 'https://example.com/source.ts', 'registry/blocks/sample/unlisted.ts'])('rejects unselected source %s', async (file) => {
    const { tools } = await fixture()
    await expect(tools.source({ name: 'blocks/sample', target: 'h5', file })).rejects.toThrow()
  })

  it('rejects source and manifest symlinks even when the linked file is inside the workspace', async () => {
    const { root, block, tools } = await fixture()
    const source = join(block, 'source.ts')
    unlinkSync(source)
    symlinkSync(join(root, 'registry/utils/shared/shared.ts'), source)
    await expect(tools.source({ name: 'blocks/sample', target: 'h5', file: 'registry/blocks/sample/source.ts' })).rejects.toThrow(/Symbolic/)
    const manifest = join(block, 'registry.json')
    const copy = readFileSync(manifest)
    unlinkSync(manifest)
    writeFileSync(join(root, 'outside.json'), copy)
    symlinkSync(join(root, 'outside.json'), manifest)
    await expect(tools.get('blocks/sample')).rejects.toThrow(/Symbolic/)
    await expect(tools.list(listSchema.parse({}))).rejects.toThrow(/Symbolic/)
  })

  it('rejects project-root and target symlinks without touching external data', async () => {
    const { root, tools } = await fixture()
    const project = join(root, 'apps/playground-h5')
    const outside = join(root, 'outside')
    mkdirSync(outside)
    symlinkSync(outside, join(project, 'src'))
    await expect(tools.plan({ names: ['blocks/sample'], target: 'h5', project: 'h5' })).rejects.toThrow(/symbolic link/)
    expect(readdirSync(outside)).toEqual([])
    rmSync(project, { recursive: true })
    symlinkSync(outside, project)
    await expect(tools.plan({ names: ['blocks/sample'], target: 'h5', project: 'h5' })).rejects.toThrow(/Symbolic/)
  })

  it('rejects malformed and mismatched manifests, non-UTF8, oversized and nonregular files', async () => {
    const { root, block, manifest, tools } = await fixture()
    writeFileSync(join(block, 'registry.json'), '{broken')
    await expect(tools.get('blocks/sample')).rejects.toThrow()
    writeFileSync(join(block, 'registry.json'), JSON.stringify({ ...manifest, name: 'another' }))
    await expect(tools.get('blocks/sample')).rejects.toThrow(/does not match/)
    writeFileSync(join(block, 'registry.json'), JSON.stringify(manifest))
    writeFileSync(join(block, 'source.ts'), Buffer.from([0xFF, 0xFE]))
    await expect(readText(root, 'registry/blocks/sample/source.ts')).rejects.toThrow(/UTF-8/)
    writeFileSync(join(block, 'source.ts'), 'x'.repeat(128 * 1024 + 1))
    await expect(tools.source({ name: 'blocks/sample', target: 'h5', file: 'registry/blocks/sample/source.ts' })).rejects.toThrow(/limit/)
    await expect(readText(root, 'registry/blocks/sample')).rejects.toThrow(/regular/)
    execFileSync('mkfifo', [join(block, 'pipe')])
    await expect(readText(root, 'registry/blocks/sample/pipe')).rejects.toThrow(/regular/)
    expect(() => boundedJson({ content: 'x'.repeat(256 * 1024) })).toThrow(/limit/)
  })

  it('rejects unknown schema fields and dangerous selectors, rather than stripping them', () => {
    expect(() => listSchema.parse({ approved: true })).toThrow()
    expect(() => getSchema.parse({ name: 'blocks/../../secret' })).toThrow()
    expect(() => sourceSchema.parse({ name: 'blocks/sample', target: 'h5', file: 'source.ts', registryRoot: '/tmp' })).toThrow()
    expect(() => planSchema.parse({ names: ['blocks/sample'], target: 'h5', project: 'h5', force: true })).toThrow()
    expect(() => planSchema.parse({ names: ['blocks/sample'], target: 'constructor', project: 'h5' })).toThrow()
    expect(() => listSchema.parse({ limit: 51 })).toThrow()
  })
})
