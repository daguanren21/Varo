// @vitest-environment node
import type { Server } from 'node:http'
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { afterEach, describe, expect, it } from 'vitest'
import { exportRegistryItem, installRegistryItems } from '../src/index.ts'

const execute = promisify(execFile)
const workspaceRoot = resolve(__dirname, '../../..')
const cli = resolve(__dirname, '../src/index.ts')
const roots: string[] = []
const servers: Server[] = []
const componentSource = '<script setup lang="ts">\nimport { useHelloWorld } from "./useHelloWorld"\nconst message = useHelloWorld()\nconst literal = "./useHelloWorld"\n</script>\n<template><p>{{ message }} {{ literal }}</p></template>\n'
const hookSource = 'export function useHelloWorld() { return "Hello from the relocated hook" }\n'

function temporaryRoot() {
  const root = mkdtempSync(join(tmpdir(), 'varo-standard-'))
  roots.push(root)
  return root
}

function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(value, null, 2))
}

function sourceItem(withHook = true) {
  return {
    $schema: 'https://shadcn-vue.com/schema/registry-item.json',
    name: 'hello-world',
    type: 'registry:block',
    title: 'Hello World',
    description: 'A simple hello world component.',
    files: [
      { path: 'registry/new-york/HelloWorld/HelloWorld.vue', type: 'registry:component' },
      ...(withHook ? [{ path: 'registry/new-york/HelloWorld/useHelloWorld.ts', type: 'registry:hook' }] : []),
    ],
  }
}

function writeSourceFiles(root: string, withHook = true) {
  const directory = join(root, 'registry/new-york/HelloWorld')
  mkdirSync(directory, { recursive: true })
  writeFileSync(join(directory, 'HelloWorld.vue'), withHook ? componentSource : '<template><p>Hello World</p></template>\n')
  if (withHook) { writeFileSync(join(directory, 'useHelloWorld.ts'), hookSource) }
}

async function serve(routes: Record<string, unknown>) {
  const requests: string[] = []
  const server = createServer((request, response) => {
    const path = request.url!
    requests.push(path)
    if (!(path in routes)) { response.writeHead(404).end(); return }
    const value = routes[path]
    response.end(typeof value === 'string' ? value : JSON.stringify(value))
  })
  servers.push(server)
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') { throw new Error('Missing fixture server address') }
  return { base: `http://127.0.0.1:${address.port}`, requests }
}

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve())
    server.closeAllConnections()
  })))
  for (const root of roots.splice(0)) { rmSync(root, { recursive: true, force: true }) }
})

describe('standard shadcn Registry inputs', () => {
  it('installs the supplied catalog schema without Varo-specific fields', async () => {
    const sourceRoot = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(sourceRoot, 'registry.json')
    writeSourceFiles(sourceRoot, false)
    writeJson(registryRoot, {
      $schema: 'https://shadcn-vue.com/schema/registry.json',
      name: 'shadcn',
      homepage: 'https://shadcn-vue.com',
      items: [sourceItem(false)],
    })
    const { stdout } = await execute(process.execPath, [cli, 'add', '--registry', registryRoot, 'hello-world'], { cwd: projectRoot })
    expect(stdout).toContain('for h5')
    expect(readFileSync(join(projectRoot, 'src/components/HelloWorld/HelloWorld.vue'), 'utf8'))
      .toBe('<template><p>Hello World</p></template>\n')
  })

  it('installs the supplied item schema and leaves a compilable Vue/hook consumer', async () => {
    const sourceRoot = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(sourceRoot, 'hello-world.json')
    writeSourceFiles(sourceRoot)
    writeJson(registryRoot, sourceItem())
    await installRegistryItems(['hello-world'], { registryRoot, projectRoot })

    expect(readFileSync(join(projectRoot, 'src/composables/HelloWorld/useHelloWorld.ts'), 'utf8')).toBe(hookSource)
    const installedComponent = readFileSync(join(projectRoot, 'src/components/HelloWorld/HelloWorld.vue'), 'utf8')
    expect(installedComponent).toContain('const literal = "./useHelloWorld"')
    writeJson(join(projectRoot, 'package.json'), { type: 'module' })
    writeJson(join(projectRoot, 'tsconfig.json'), {
      compilerOptions: { target: 'ES2022', module: 'ESNext', moduleResolution: 'Bundler', strict: true, noEmit: true, skipLibCheck: true, types: [] },
      include: ['src/**/*.ts', 'src/**/*.vue'],
    })
    symlinkSync(join(workspaceRoot, 'node_modules'), join(projectRoot, 'node_modules'), 'dir')
    await execute(process.execPath, [join(workspaceRoot, 'node_modules/vue-tsc/bin/vue-tsc.js'), '--noEmit', '-p', join(projectRoot, 'tsconfig.json')], { cwd: projectRoot })

    const exported = await exportRegistryItem('hello-world', { registryRoot, target: 'h5', projectRoot })
    expect(exported.files.map(file => file.target)).toEqual([
      '~/src/components/HelloWorld/HelloWorld.vue',
      '~/src/composables/HelloWorld/useHelloWorld.ts',
    ])
    expect(exported.files[0]!.content).toBe(installedComponent)
  })

  it('honors consumer aliases resolved from a referenced JSONC app tsconfig', async () => {
    const sourceRoot = temporaryRoot()
    const projectRoot = temporaryRoot()
    writeSourceFiles(sourceRoot)
    writeFileSync(join(sourceRoot, 'registry/new-york/HelloWorld/HelloWorld.vue'), componentSource.replace('from "./useHelloWorld"', 'from "@/composables/HelloWorld/useHelloWorld"'))
    writeJson(join(sourceRoot, 'registry.json'), { name: 'custom', homepage: 'https://example.com', items: [sourceItem()] })
    writeJson(join(projectRoot, 'components.json'), { aliases: { components: '@/widgets', composables: '@/domain', ui: '@/widgets/ui', lib: '@/lib', utils: '@/lib/utils' } })
    writeJson(join(projectRoot, 'tsconfig.json'), { files: [], references: [{ path: './tsconfig.app.json' }] })
    writeFileSync(join(projectRoot, 'tsconfig.app.json'), '{\n // Consumer-owned alias configuration\n "compilerOptions": { "target": "ES2022", "module": "ESNext", "moduleResolution": "Bundler", "strict": true, "noEmit": true, "skipLibCheck": true, "types": [], "paths": { "@/*": ["./src/*"], }, },\n "include": ["src/**/*.ts", "src/**/*.vue"],\n}\n')
    await installRegistryItems(['hello-world'], { registryRoot: sourceRoot, projectRoot })
    expect(existsSync(join(projectRoot, 'src/widgets/HelloWorld/HelloWorld.vue'))).toBe(true)
    expect(readFileSync(join(projectRoot, 'src/domain/HelloWorld/useHelloWorld.ts'), 'utf8')).toBe(hookSource)
    expect(existsSync(join(projectRoot, 'src/components'))).toBe(false)
    symlinkSync(join(workspaceRoot, 'node_modules'), join(projectRoot, 'node_modules'), 'dir')
    await execute(process.execPath, [join(workspaceRoot, 'node_modules/vue-tsc/bin/vue-tsc.js'), '--noEmit', '-p', join(projectRoot, 'tsconfig.app.json')], { cwd: projectRoot })
  })

  it('installs inline published files including empty content and explicit Weapp metadata', async () => {
    const sourceRoot = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(sourceRoot, 'published.json')
    writeJson(registryRoot, {
      name: 'published',
      type: 'registry:file',
      meta: { varo: { target: 'weapp' } },
      files: [{ path: 'not-present.ts', type: 'registry:file', target: '~/src/lib/empty.ts', content: '' }],
    })
    const plan = await installRegistryItems(['published'], { registryRoot, projectRoot })
    expect(plan.target).toBe('weapp')
    expect(readFileSync(join(projectRoot, 'src/lib/empty.ts'), 'utf8')).toBe('')
    await expect(installRegistryItems(['published'], { registryRoot, projectRoot, target: 'h5', force: true })).rejects.toThrow(/target|h5/i)
  })

  it('reads HTTP catalogs and encodes literal source path delimiters', async () => {
    const projectRoot = temporaryRoot()
    const filePath = 'registry/new-york/HelloWorld/Hello #世界.vue'
    const source = '<template><p>Remote source</p></template>\n'
    const { base, requests } = await serve({
      '/r/registry.json': { name: 'remote', homepage: 'https://example.com', items: [{ ...sourceItem(false), files: [{ path: filePath, type: 'registry:component' }] }] },
      '/r/registry/new-york/HelloWorld/Hello%20%23%E4%B8%96%E7%95%8C.vue': source,
    })
    await installRegistryItems(['hello-world'], { registryRoot: `${base}/r/registry.json`, projectRoot })
    expect(readFileSync(join(projectRoot, 'src/components/HelloWorld/Hello #世界.vue'), 'utf8')).toBe(source)
    expect(requests).toContain('/r/registry/new-york/HelloWorld/Hello%20%23%E4%B8%96%E7%95%8C.vue')
  })

  it('keeps equal dependency names from distinct URL origins separate', async () => {
    const sourceRoot = temporaryRoot()
    const projectRoot = temporaryRoot()
    const { base } = await serve({
      '/a/shared.json': { name: 'shared', type: 'registry:file', files: [{ path: 'shared.ts', type: 'registry:file', target: '~/src/lib/a.ts', content: 'export const a = 1\n' }] },
      '/b/shared.json': { name: 'shared', type: 'registry:file', files: [{ path: 'shared.ts', type: 'registry:file', target: '~/src/lib/b.ts', content: 'export const b = 2\n' }] },
    })
    const registryRoot = join(sourceRoot, 'root.json')
    writeJson(registryRoot, { name: 'root', type: 'registry:block', registryDependencies: [`${base}/a/shared.json`, `${base}/b/shared.json`], files: [{ path: 'root.ts', type: 'registry:file', target: '~/src/lib/root.ts', content: 'export const root = true\n' }] })
    await installRegistryItems(['root'], { registryRoot, projectRoot })
    expect(readFileSync(join(projectRoot, 'src/lib/a.ts'), 'utf8')).toBe('export const a = 1\n')
    expect(readFileSync(join(projectRoot, 'src/lib/b.ts'), 'utf8')).toBe('export const b = 2\n')
  })

  it('rejects cyclic catalog dependencies before creating consumer files', async () => {
    const sourceRoot = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(sourceRoot, 'registry.json')
    writeJson(registryRoot, { name: 'cycles', homepage: 'https://example.com', items: [
      { name: 'alpha', type: 'registry:block', registryDependencies: ['beta'], files: [{ path: 'alpha.ts', type: 'registry:file', target: '~/src/alpha.ts', content: 'alpha' }] },
      { name: 'beta', type: 'registry:block', registryDependencies: ['alpha'], files: [{ path: 'beta.ts', type: 'registry:file', target: '~/src/beta.ts', content: 'beta' }] },
    ] })
    await expect(installRegistryItems(['alpha'], { registryRoot, projectRoot })).rejects.toThrow(/cycl/i)
    expect(existsSync(join(projectRoot, 'src'))).toBe(false)
  })

  it('rejects source symlinks outside the selected standard Registry root', async () => {
    const root = temporaryRoot()
    const sourceRoot = join(root, 'registry-project')
    const projectRoot = temporaryRoot()
    writeSourceFiles(sourceRoot, false)
    const sourcePath = join(sourceRoot, 'registry/new-york/HelloWorld/HelloWorld.vue')
    const outside = join(root, 'outside.vue')
    writeFileSync(outside, '<template>Private source</template>')
    rmSync(sourcePath)
    symlinkSync(outside, sourcePath)
    const registryRoot = join(sourceRoot, 'hello-world.json')
    writeJson(registryRoot, sourceItem(false))
    await expect(installRegistryItems(['hello-world'], { registryRoot, projectRoot })).rejects.toThrow(/outside|within|escape/i)
    expect(existsSync(join(projectRoot, 'src'))).toBe(false)
  })

  it('refuses standard targets outside src even with force', async () => {
    const root = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(root, 'escape.json')
    writeJson(join(projectRoot, 'package.json'), { name: 'consumer' })
    const original = readFileSync(join(projectRoot, 'package.json'), 'utf8')
    writeJson(registryRoot, { name: 'escape', type: 'registry:file', files: [{ path: 'package.json', type: 'registry:file', target: '~/package.json', content: '{"name":"overwrite"}' }] })
    await expect(installRegistryItems(['escape'], { registryRoot, projectRoot, force: true })).rejects.toThrow(/src|target/i)
    expect(readFileSync(join(projectRoot, 'package.json'), 'utf8')).toBe(original)
  })

  it('accepts empty optional standard metadata without rejecting valid files', async () => {
    const root = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(root, 'blank.json')
    writeJson(registryRoot, {
      name: 'blank',
      type: 'registry:block',
      author: '',
      title: '',
      description: '',
      docs: '',
      files: [{ path: 'value.ts', type: 'registry:file', target: '~/src/lib/value.ts', content: 'export const value = 42\n' }],
    })
    await installRegistryItems(['blank'], { registryRoot, projectRoot })
    expect(readFileSync(join(projectRoot, 'src/lib/value.ts'), 'utf8')).toBe('export const value = 42\n')
  })

  it('does not follow sibling dependency manifests outside their source root', async () => {
    const root = temporaryRoot()
    const sourceRoot = join(root, 'registry-project')
    const projectRoot = temporaryRoot()
    const registryRoot = join(sourceRoot, 'root.json')
    writeJson(registryRoot, {
      name: 'root',
      type: 'registry:block',
      registryDependencies: ['shared'],
      files: [{ path: 'root.ts', type: 'registry:file', target: '~/src/lib/root.ts', content: 'export const root = true\n' }],
    })
    const outside = join(root, 'outside.json')
    writeJson(outside, {
      name: 'shared',
      type: 'registry:file',
      files: [{ path: 'secret.ts', type: 'registry:file', target: '~/src/lib/secret.ts', content: 'secret' }],
    })
    symlinkSync(outside, join(sourceRoot, 'shared.json'))
    await expect(installRegistryItems(['root'], { registryRoot, projectRoot })).rejects.toThrow(/outside|source root/i)
    expect(existsSync(join(projectRoot, 'src'))).toBe(false)
  })

  it.each([{ content: '' }, { standard: { path: 'untrusted.ts' } }])('preserves native source authority despite reserved extension fields %j', async (extension) => {
    const root = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(root, 'registry')
    const itemDirectory = join(registryRoot, 'utils/native')
    writeJson(join(itemDirectory, 'registry.json'), {
      name: 'native',
      type: 'util',
      title: 'Native',
      description: 'Native source authority',
      targets: ['h5'],
      dependencies: [],
      registryDependencies: [],
      docs: '/native',
      files: [{ target: 'h5', from: 'registry/utils/native/value.ts', to: 'src/lib/value.ts', ...extension }],
    })
    writeFileSync(join(itemDirectory, 'value.ts'), 'export const value = "authored native source"\n')
    await installRegistryItems(['utils/native'], { registryRoot, projectRoot, target: 'h5' })
    expect(readFileSync(join(projectRoot, 'src/lib/value.ts'), 'utf8')).toBe('export const value = "authored native source"\n')
  })

  it('rejects unsupported style inheritance before writing consumer files', async () => {
    const sourceRoot = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(sourceRoot, 'style.json')
    writeJson(registryRoot, {
      name: 'style',
      type: 'registry:style',
      extends: 'new-york',
      files: [{ path: 'theme.css', type: 'registry:file', target: '~/src/theme.css', content: ':root { color: red }\n' }],
    })
    await expect(installRegistryItems(['style'], { registryRoot, projectRoot })).rejects.toThrow(/extends|inherit/i)
    expect(existsSync(join(projectRoot, 'src'))).toBe(false)
  })

  it('keeps no-substitution dynamic imports executable after relocation', async () => {
    const sourceRoot = temporaryRoot()
    const projectRoot = temporaryRoot()
    const registryRoot = join(sourceRoot, 'hello-world.json')
    const item = sourceItem()
    item.files[0]!.path = 'registry/new-york/HelloWorld/load.ts'
    writeSourceFiles(sourceRoot)
    // Exercise the consumer's lazy module-loading boundary; a static import would miss this regression.
    writeFileSync(join(sourceRoot, item.files[0]!.path), 'export const load = () => import(`./useHelloWorld.ts`)\n')
    writeJson(registryRoot, item)
    writeJson(join(projectRoot, 'package.json'), { type: 'module' })
    await installRegistryItems(['hello-world'], { registryRoot, projectRoot })
    const { stdout } = await execute(process.execPath, ['--input-type=module', '-e', 'const { load } = await import("./src/components/HelloWorld/load.ts"); console.log((await load()).useHelloWorld())'], { cwd: projectRoot })
    expect(stdout.trim()).toBe('Hello from the relocated hook')
  })
})
