import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { cp, lstat, mkdir, mkdtemp, readdir, readFile, realpath, rm, stat, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { basename, dirname, extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { fixtureItems } from '../apps/platform-smoke/scripts/project.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixtures = resolve(repoRoot, 'scripts/consumer-fixtures')
const platformFixture = resolve(repoRoot, 'apps/platform-smoke')
const publicPackages = ['cli', 'primitives-core', 'ui-h5', 'ui-weapp', 'theme', 'agent-core']
const baseItems = ['button', 'input', 'form', 'drawer']
const experimentalTargets = ['alipay', 'tt', 'xhs', 'donut-android', 'donut-ios', 'donut-ohos']
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const environment = { ...process.env, CI: 'true', npm_config_ignore_scripts: 'true' }
delete environment.NODE_PATH
delete environment.NODE_OPTIONS

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

async function write(path, content) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, content)
}

async function writeJson(path, value) {
  await write(path, `${JSON.stringify(value, null, 2)}\n`)
}

function inside(root, path) {
  const offset = relative(root, path)
  assert(offset !== '..' && !offset.startsWith(`..${sep}`) && !isAbsolute(offset), `Path escapes consumer: ${path}`)
  return path
}

function run(command, args, cwd, { capture = false, failure = false, env = {} } = {}) {
  console.log(`[consumers] ${basename(cwd)}: ${basename(command)} ${args.join(' ')}`)
  const result = spawnSync(command, args, {
    cwd,
    env: { ...environment, ...env },
    stdio: capture || failure ? 'pipe' : 'inherit',
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.error) { throw result.error }
  assert.equal(result.signal, null, `${command} terminated by ${result.signal}`)
  if (failure) {
    assert.notEqual(result.status, 0, 'Expected the packed CLI to reject this install')
    return `${result.stdout}\n${result.stderr}`
  }
  assert.equal(result.status, 0, `${command} failed (${result.status})\n${result.stdout ?? ''}\n${result.stderr ?? ''}`)
  return result.stdout
}

async function files(root) {
  const result = []
  for (const entry of (await readdir(root, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = resolve(root, entry.name)
    assert(!entry.isSymbolicLink(), `Unexpected symlink in consumer source/artifacts: ${path}`)
    if (entry.isDirectory()) { result.push(...await files(path)) }
    else if (entry.isFile()) { result.push(path) }
  }
  return result
}

async function snapshot(root) {
  const result = []
  async function visit(path) {
    const info = await lstat(path, { bigint: true })
    assert(!info.isSymbolicLink(), `Unexpected source symlink: ${path}`)
    const digest = info.isFile() ? createHash('sha256').update(await readFile(path)).digest('hex') : null
    result.push([relative(root, path), info.mode.toString(), info.mtimeNs.toString(), digest])
    if (info.isDirectory()) {
      for (const name of (await readdir(path)).sort()) { await visit(resolve(path, name)) }
    }
  }
  await visit(root)
  return result
}

async function packPackages(temporaryRoot, rootPackage) {
  // Staging preserves real manifests and workspace version rewriting, but never runs
  // pack hooks against the repository (CLI postpack removes its generated registry).
  const stage = resolve(temporaryRoot, 'pack-workspace')
  await writeJson(resolve(stage, 'package.json'), rootPackage)
  await write(resolve(stage, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n')
  await cp(resolve(repoRoot, 'LICENSE'), resolve(stage, 'LICENSE'))
  const workspace = new Map()
  for (const entry of await readdir(resolve(repoRoot, 'packages'), { withFileTypes: true })) {
    const manifest = resolve(repoRoot, 'packages', entry.name, 'package.json')
    if (entry.isDirectory() && existsSync(manifest)) {
      const metadata = await readJson(manifest)
      const target = resolve(stage, 'packages', entry.name)
      workspace.set(metadata.name, { metadata, target })
      await writeJson(resolve(target, 'package.json'), metadata)
    }
  }
  // pnpm resolves workspace: versions through installed package metadata while
  // packing. These links stay inside staging; the consumer only sees tarballs.
  for (const { metadata, target } of workspace.values()) {
    for (const [name, version] of Object.entries({
      ...metadata.dependencies,
      ...metadata.devDependencies,
      ...metadata.optionalDependencies,
      ...metadata.peerDependencies,
    })) {
      if (!version.startsWith('workspace:')) { continue }
      const dependency = workspace.get(name)
      assert(dependency, `Missing workspace metadata required by pnpm pack: ${name}`)
      const link = resolve(target, 'node_modules', name)
      await mkdir(dirname(link), { recursive: true })
      await symlink(dependency.target, link, 'junction')
    }
  }
  const records = []
  for (const directory of publicPackages) {
    const source = resolve(repoRoot, 'packages', directory)
    const target = resolve(stage, 'packages', directory)
    const manifest = await readJson(resolve(target, 'package.json'))
    assert(!manifest.private && manifest.name.startsWith('@varo-ui/'), `Not a public package: ${directory}`)
    for (const path of manifest.files) {
      if (directory === 'cli' && path === 'registry') { continue }
      assert(!/[*!?]/.test(path), `Update consumer staging for the package files glob: ${path}`)
      const destination = inside(target, resolve(target, path))
      await mkdir(dirname(destination), { recursive: true })
      await cp(inside(source, resolve(source, path)), destination, { recursive: true })
    }
    for (const entry of await readdir(source, { withFileTypes: true })) {
      if (entry.isFile() && /^(?:readme(?:\..*)?|license(?:\..*)?|\.npmignore)$/i.test(entry.name)) {
        await cp(resolve(source, entry.name), resolve(target, entry.name))
      }
    }
    records.push({ directory, manifest, target })
  }
  await cp(resolve(repoRoot, 'registry'), resolve(stage, 'registry'), { recursive: true })
  const generator = 'packages/cli/scripts/sync-registry.mjs'
  await write(resolve(stage, generator), await readFile(resolve(repoRoot, generator)))
  run(process.execPath, [resolve(stage, generator)], stage)
  for (const record of records) {
    const output = resolve(temporaryRoot, 'tarballs', record.directory)
    await mkdir(output, { recursive: true })
    run(pnpm, ['pack', '--config.ignore-scripts=true', '--pack-destination', output], record.target)
    const archives = (await readdir(output)).filter(name => name.endsWith('.tgz'))
    assert.equal(archives.length, 1, `Expected exactly one packed ${record.manifest.name} artifact`)
    record.tarball = resolve(output, archives[0])
  }
  return records
}

async function installedVersions() {
  const versions = {}
  const roots = new Map([
    [repoRoot, ['vue', 'wevu', 'vite', 'weapp-vite', 'weapp-tailwindcss', '@vitejs/plugin-vue', 'typescript', 'vue-tsc', '@types/node', 'miniprogram-api-typings']],
    [platformFixture, ['tailwindcss', '@weapp-tailwindcss/merge', 'clsx']],
    [resolve(repoRoot, 'packages/ui-h5'), ['tailwind-merge']],
  ])
  for (const [root, names] of roots) {
    for (const name of names) {
      const manifest = await readJson(resolve(root, 'node_modules', name, 'package.json'))
      assert.equal(manifest.name, name)
      versions[name] = manifest.version
    }
  }
  const viteRequire = createRequire(await realpath(resolve(repoRoot, 'node_modules/vite/package.json')))
  versions.esbuild = (await readJson(viteRequire.resolve('esbuild/package.json'))).version
  return versions
}

async function installConsumer(root, records, rootPackage) {
  const tarballs = Object.fromEntries(records.map(({ manifest, tarball }) => [manifest.name, `file:${tarball}`]))
  await writeJson(resolve(root, 'package.json'), {
    name: 'varo-packed-consumer-check',
    private: true,
    type: 'module',
    packageManager: rootPackage.packageManager,
    dependencies: { ...tarballs, ...await installedVersions() },
  })
  await write(resolve(root, 'pnpm-workspace.yaml'), [
    'packages: []',
    'autoInstallPeers: false',
    'linkWorkspacePackages: false',
    'enableGlobalVirtualStore: false',
    'minimumReleaseAge: 0',
    'overrides:',
    ...Object.entries(tarballs).map(([name, path]) => `  ${JSON.stringify(name)}: ${JSON.stringify(path)}`),
    '',
  ].join('\n'))
  // Varo packages are forced to the local tarballs above. Third-party packages
  // may use the registry when the store is cold, as in a fresh downstream install.
  run(pnpm, ['install', '--prefer-offline', '--ignore-scripts', '--no-frozen-lockfile'], root)
  for (const { manifest: original } of records) {
    const packageRoot = await realpath(resolve(root, 'node_modules', original.name))
    inside(root, packageRoot)
    const manifest = await readJson(resolve(packageRoot, 'package.json'))
    assert.equal(manifest.name, original.name)
    assert.equal(manifest.version, original.version)
    for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
      for (const [name, version] of Object.entries(manifest[field] ?? {})) {
        assert(!name.startsWith('@varo/'), `${manifest.name} declares private ${field}: ${name}`)
        assert(!/^(?:workspace|link|file):/.test(version), `${manifest.name} leaks a local ${field} reference: ${name}`)
        if (tarballs[name]) {
          assert.equal(version, records.find(record => record.manifest.name === name).manifest.version, `Unexpected public package version in ${manifest.name}`)
        }
      }
    }
    async function checkExports(value) {
      if (typeof value === 'string') {
        assert(value.startsWith('./'), `Invalid export in ${manifest.name}: ${value}`)
        const path = inside(packageRoot, resolve(packageRoot, value))
        if (value.includes('*')) {
          assert((await stat(dirname(path))).isDirectory(), `Missing exported source directory: ${value}`)
        }
        else {
          assert((await stat(path)).isFile(), `Missing declared export in ${manifest.name}: ${value}`)
        }
      }
      else if (value && typeof value === 'object') {
        for (const nested of Object.values(value)) { await checkExports(nested) }
      }
    }
    await checkExports(manifest.exports)
  }
}

async function binary(root, name, command) {
  const packageRoot = inside(root, await realpath(resolve(root, 'node_modules', name)))
  const manifest = await readJson(resolve(packageRoot, 'package.json'))
  const entry = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin[command]
  assert(entry, `Missing ${command} binary in ${name}`)
  return inside(root, await realpath(resolve(packageRoot, entry)))
}

async function project(root, name) {
  const path = resolve(root, name)
  await writeJson(resolve(path, 'package.json'), { name, private: true, type: 'module' })
  return path
}

async function checkBasePayload(root) {
  for (const file of await files(resolve(root, 'src'))) {
    assert(!/agent-ui|varo-agent|agent-chat/i.test(relative(root, file)), `Base install includes Agent payload: ${file}`)
    if (file.endsWith('.css')) {
      assert(!/--varo-agent-|\.agent-ui(?:__|[-\s.{])|\.varo-agent-/.test(await readFile(file, 'utf8')), `Base CSS includes Agent rules: ${file}`)
    }
  }
}

async function checkChatPayload(consumerRoot, cli) {
  for (const target of ['h5', 'weapp']) {
    const root = await project(consumerRoot, `chat-${target}`)
    run(process.execPath, [cli, 'add', '--target', target, 'blocks/agent-chat'], root)
    const installed = (await files(resolve(root, 'src'))).map(path => relative(root, path).split(sep).join('/'))
    for (const required of ['src/components/blocks/agent-chat.vue', 'src/components/agent-ui/presentation.ts', 'src/styles/varo-agent.css']) {
      assert(installed.includes(required), `Minimal ${target} chat is missing ${required}`)
    }
    assert(installed.includes(`src/components/agent-ui/${target === 'h5' ? 'conversation.ts' : 'AgentEventRenderer.vue'}`))
    assert(!installed.includes('src/components/agent-ui/index.ts'), 'Minimal chat must not pull in the suite barrel')
    assert.deepEqual(installed.filter(path => /advanced|workspace|(?:^|[/-])rag|AgentRag|file-?diff|fine-?tune|supplemental/i.test(path)), [], 'Minimal chat includes unrelated Agent units')
  }
}

async function checkProfiles(consumerRoot, cli) {
  const rejected = await project(consumerRoot, 'rejected-profile')
  await write(resolve(rejected, 'src/components/ui/v-button.vue'), 'consumer-owned customization\n')
  const before = await snapshot(rejected)
  const unsupported = run(process.execPath, [cli, 'add', '--force', '--target', 'unsupported', 'button'], rejected, { failure: true })
  assert.match(unsupported, /Unsupported registry target/)
  assert.deepEqual(await snapshot(rejected), before, 'Unknown profile rejection wrote consumer files')
  const unadmitted = run(process.execPath, [cli, 'add', '--force', '--target', 'alipay', 'button', 'blocks/agent-chat'], rejected, { failure: true })
  assert.match(unadmitted, /does not support target alipay/)
  assert.deepEqual(await snapshot(rejected), before, 'Admission rejection wrote files before validating the whole closure')
  for (const target of experimentalTargets) {
    const root = await project(consumerRoot, `profile-${target}`)
    const exported = JSON.parse(run(process.execPath, [cli, 'export', '--target', target, 'button'], root, { capture: true }))
    assert.equal(exported.meta.varo.target, target, 'Export must preserve the exact deployment profile')
    const registry = resolve(consumerRoot, `${target}.json`)
    await writeJson(registry, exported)
    const installed = run(process.execPath, [cli, 'add', '--registry', registry, 'button'], root, { capture: true })
    assert(installed.includes(`for ${target}\n`), `Standard Registry install lost ${target} identity: ${installed}`)
    for (const file of exported.files) {
      assert(file.target.startsWith('~/'), 'Export must use consumer-relative destinations')
      assert.equal(await readFile(inside(root, resolve(root, file.target.slice(2))), 'utf8'), file.content)
    }
    const roundTrip = JSON.parse(run(process.execPath, [cli, 'export', '--registry', registry, 'button'], root, { capture: true }))
    assert.equal(roundTrip.meta.varo.target, target)
    const installedBefore = await snapshot(root)
    const mismatch = run(process.execPath, [cli, 'add', '--force', '--registry', registry, '--target', 'weapp', 'button'], root, { failure: true })
    assert.match(mismatch, /not weapp/)
    assert.deepEqual(await snapshot(root), installedBefore, 'A target mismatch modified installed source')
  }
}

async function copyBuildConfig(root, kind) {
  await cp(resolve(fixtures, `${kind}.config.mjs`), resolve(root, 'vite.config.mjs'))
  await cp(resolve(fixtures, 'isolation.mjs'), resolve(root, 'isolation.mjs'))
}

async function verifyStyles(path, root, extension, visited = new Set()) {
  inside(root, path)
  if (visited.has(path)) { return '' }
  visited.add(path)
  const source = await readFile(path, 'utf8')
  assert(!/@(?:tailwind|theme|source)\b/.test(source), `Uncompiled style directive in ${path}`)
  let result = source
  for (const [, reference] of source.matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)) {
    assert(!reference.includes('://'), `Consumer styles must resolve locally: ${reference}`)
    assert.equal(extname(reference), extension, `Unexpected style import in ${path}`)
    result += await verifyStyles(reference.startsWith('/') ? resolve(root, `.${reference}`) : resolve(dirname(path), reference), root, extension, visited)
  }
  return result
}

function requireStyleClasses(styles, names) {
  for (const name of names) { assert(new RegExp(`\\.varo-${name}(?=[\\s.{:#\\[])`).test(styles), `Missing emitted .varo-${name} styles`) }
  assert.match(styles, /--varo-ui-primary\s*:/, 'Missing canonical theme tokens')
}

async function buildH5(consumerRoot, cli, vite, vueTsc, delivery) {
  const root = await project(consumerRoot, `h5-${delivery}`)
  await copyBuildConfig(root, 'h5')
  await cp(resolve(fixtures, 'H5App.vue'), resolve(root, 'App.vue'))
  await write(resolve(root, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Varo consumer</title></head><body><div id="app"></div><script type="module" src="/main.ts"></script></body></html>\n')
  await write(resolve(root, 'main.ts'), 'import { createApp } from \'vue\'\nimport App from \'./App.vue\'\ncreateApp(App).mount(\'#app\')\n')
  await writeJson(resolve(root, 'tsconfig.json'), {
    compilerOptions: {
      strict: true,
      skipLibCheck: true,
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      allowImportingTsExtensions: true,
      types: ['vite/client'],
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
    },
    include: ['App.vue', 'main.ts', 'varo-ui.ts'],
  })
  if (delivery === 'source') {
    run(process.execPath, [cli, 'add', '--target', 'h5', ...baseItems], root)
    await checkBasePayload(root)
    await write(resolve(root, 'varo-ui.ts'), [
      'export { VButton } from \'./src/components/ui/button\'',
      'export { VInput } from \'./src/components/ui/input\'',
      'export { VForm, VFormItem } from \'./src/components/ui/form\'',
      'export type { FormSubmitPayload } from \'./src/components/ui/form\'',
      'export { VDrawer } from \'./src/components/ui/drawer\'',
      '',
    ].join('\n'))
  }
  else {
    await write(resolve(root, 'varo-ui.ts'), 'import \'@varo-ui/h5/style.css\'\nimport \'@varo-ui/h5/source/style.css\'\nexport { VButton, VInput, VForm, VFormItem, VDrawer } from \'@varo-ui/h5\'\nexport type { FormSubmitPayload } from \'@varo-ui/h5\'\n')
    const entries = []
    for (const name of ['@varo-ui/h5', '@varo-ui/headless', '@varo-ui/ai', '@varo-ui/theme']) {
      const manifest = await readJson(resolve(consumerRoot, 'node_modules', name, 'package.json'))
      for (const subpath of Object.keys(manifest.exports)) {
        if (subpath.includes('*') || subpath.endsWith('.css') || subpath.includes('weapp')) { continue }
        entries.push(`export * as entry${entries.length} from ${JSON.stringify(name + (subpath === '.' ? '' : subpath.slice(1)))}`)
      }
    }
    await write(resolve(root, 'public-exports.ts'), `${entries.join('\n')}\n`)
  }
  run(process.execPath, [vueTsc, '--noEmit', '--project', resolve(root, 'tsconfig.json')], root)
  run(process.execPath, [vite, 'build', '--config', resolve(root, 'vite.config.mjs')], root, { env: { VARO_CONSUMER_ROOT: consumerRoot } })
  const output = resolve(root, 'dist')
  const manifest = await readJson(resolve(output, '.vite/manifest.json'))
  assert(manifest['index.html']?.isEntry, 'H5 consumer entry was not emitted')
  const styles = []
  const visited = new Set()
  async function visit(key) {
    if (visited.has(key)) { return }
    visited.add(key)
    const entry = manifest[key]
    assert(entry, `Missing H5 manifest dependency: ${key}`)
    assert((await stat(inside(output, resolve(output, entry.file)))).isFile())
    for (const file of entry.css ?? []) { styles.push(await verifyStyles(resolve(output, file), output, '.css')) }
    for (const dependency of [...(entry.imports ?? []), ...(entry.dynamicImports ?? [])]) { await visit(dependency) }
  }
  await visit('index.html')
  if (delivery === 'package') {
    assert(manifest['public-exports.ts']?.isEntry, 'Declared public export graph was not emitted')
    await visit('public-exports.ts')
  }
  requireStyleClasses(styles.join('\n'), [...baseItems, 'form-item'])
  console.log(`[consumers] Verified H5 ${delivery}: linked entry graph and component/theme CSS.`)
}

async function verifyNative(output, delivery) {
  const app = await readJson(resolve(output, 'app.json'))
  assert.deepEqual(app.pages, ['pages/index/index'])
  assert((await stat(resolve(output, 'app.js'))).isFile())
  const queue = app.pages.map(page => resolve(output, page))
  const templates = new Map()
  const visitedStyles = new Set()
  const styles = await verifyStyles(resolve(output, 'app.wxss'), output, '.wxss', visitedStyles)
  function reference(owner, value) {
    assert.equal(typeof value, 'string')
    assert(!value.includes('://'), `Native fixture cannot use remote components: ${value}`)
    return inside(output, value.startsWith('/') ? resolve(output, `.${value}`) : resolve(dirname(owner), value))
  }
  while (queue.length) {
    const base = inside(output, queue.pop())
    if (templates.has(base)) { continue }
    const config = await readJson(`${base}.json`)
    assert((await stat(`${base}.js`)).isFile(), `Missing component script: ${base}`)
    const markup = await readFile(`${base}.wxml`, 'utf8')
    templates.set(base, { markup, config })
    for (const value of Object.values({ ...app.usingComponents, ...config.usingComponents })) { queue.push(reference(base, value)) }
    for (const value of Object.values(config.componentGenerics ?? {})) {
      if (value && typeof value === 'object' && value.default) { queue.push(reference(base, value.default)) }
    }
  }
  for (const path of await files(output)) {
    if (path.endsWith('.wxss')) { await verifyStyles(path, output, '.wxss', visitedStyles) }
  }
  const expected = [...fixtureItems, 'form-item', 'icon'].map(name => [name, `v-${name}`])
  if (delivery === 'package') {
    for (const name of ['avatar', 'badge', 'empty', 'input-number', 'select', 'tag']) { expected.push([name, name]) }
  }
  for (const [item, filename] of expected) {
    const components = [...templates].filter(([path]) => basename(path) === filename)
    assert.equal(components.length, 1, `Entry must reach exactly one native ${item} implementation`)
    const [, { markup, config }] = components[0]
    assert.equal(config.component, true, `${item} was not compiled as a native component`)
    if (item === 'input' || item === 'input-otp') { assert.match(markup, /<input\b[^>]+\b(?:bind|catch):?input\s*=/, `Missing native input binding: ${item}`) }
    if (item === 'form') { assert.match(markup, /<form\b[^>]+\b(?:bind|catch):?submit\s*=/, 'Missing native form submission') }
    if (item === 'drawer') { assert.match(markup, /\bwx:if\s*=/, 'Drawer lost native visibility control') }
  }
  requireStyleClasses(styles, expected.map(([name]) => name))
  assert.match(styles, /\.flex\s*\{[^}]*display\s*:\s*flex/, 'Common fixture Tailwind utilities were not compiled')
  console.log(`[consumers] Verified native component graph: ${templates.size} reachable components/pages and local WXSS imports.`)
}

async function buildNative(consumerRoot, cli, compiler, delivery) {
  const root = await project(consumerRoot, `native-${delivery}`)
  await cp(resolve(platformFixture, 'src'), resolve(root, 'src'), { recursive: true })
  await copyBuildConfig(root, 'native')
  await writeJson(resolve(root, 'tsconfig.json'), {
    extends: './.weapp-vite/tsconfig.shared.json',
    compilerOptions: { strict: true, skipLibCheck: true },
    include: ['src/**/*.ts', 'src/**/*.vue'],
  })
  await writeJson(resolve(root, 'config/weapp/project.config.json'), {
    projectname: `varo-packed-${delivery}`,
    compileType: 'miniprogram',
    miniprogramRoot: 'dist',
    setting: { es6: true },
  })
  if (delivery === 'source') {
    run(process.execPath, [cli, 'add', '--target', 'weapp', ...fixtureItems], root)
    await checkBasePayload(root)
    const nativePackage = await readJson(resolve(consumerRoot, 'node_modules/@varo-ui/weapp/package.json'))
    const resolverPath = nativePackage.exports['./resolver'].import
    const { VaroResolver } = await import(pathToFileURL(resolve(consumerRoot, 'node_modules/@varo-ui/weapp', resolverPath)).href)
    const resolver = VaroResolver({ root })
    for (const item of baseItems) {
      const result = resolver.resolve(`v-${item}`)
      assert.equal(result.from, `/components/ui/v-${item}`)
      assert.equal(await realpath(result.resolvedId), await realpath(resolve(root, 'src/components/ui', `v-${item}.vue`)))
    }
  }
  else {
    await write(resolve(root, 'src/package.css'), '@import "@varo-ui/weapp/style.css";\n')
    const showcase = resolve(root, 'src/components/PlatformShowcase.vue')
    let replacements = 0
    const source = (await readFile(showcase, 'utf8')).replace(/^import (\w+) from '\.\/ui\/(v-[^']+\.vue)'$/gm, (_, name, file) => {
      replacements += 1
      return name === 'VButton' || name === 'VForm'
        ? `import { ${name} } from '@varo-ui/weapp'`
        : `import ${name} from '@varo-ui/weapp/components/${file}'`
    })
    assert.equal(replacements, fixtureItems.length + 1, 'Update the package-consumer import projection when the common fixture changes')
    await write(showcase, source)
    await cp(resolve(fixtures, 'NativePackageExports.vue'), resolve(root, 'src/components/NativePackageExports.vue'))
    const pagePath = resolve(root, 'src/pages/index/index.vue')
    const page = await readFile(pagePath, 'utf8')
    assert(page.includes('<PlatformShowcase />'), 'Common native page no longer renders PlatformShowcase')
    await write(pagePath, page
      .replace('<script setup lang="ts">', `<script setup lang="ts">\nimport NativePackageExports from '../../components/NativePackageExports.vue'`)
      .replace('<PlatformShowcase />', '<view><PlatformShowcase /><NativePackageExports /></view>'))
  }
  run(process.execPath, [compiler, 'build', root, '--config', resolve(root, 'vite.config.mjs'), '--platform', 'weapp'], root, {
    env: { VARO_CONSUMER_ROOT: consumerRoot, VARO_CONSUMER_DELIVERY: delivery },
  })
  const ideRoot = resolve(root, 'dist/weapp')
  const projectConfig = await readJson(resolve(ideRoot, 'project.config.json'))
  const output = inside(ideRoot, resolve(ideRoot, projectConfig.miniprogramRoot))
  assert.equal(output, resolve(ideRoot, 'dist'), 'Native artifacts must match the selected IDE project')
  assert(!projectConfig.appid, 'Credential-free compilation must not acquire an AppID')
  await verifyNative(output, delivery)
  console.log(`[consumers] Verified Weapp ${delivery} with the installed compiler/runtime; no IDE/device/signing claim.`)
}

if (process.argv.length !== 2) { throw new Error('Usage: pnpm check:consumers (build and synchronize packages first)') }
const temporaryRoot = await realpath(await mkdtemp(resolve(tmpdir(), 'varo-consumers-')))
try {
  const rootPackage = await readJson(resolve(repoRoot, 'package.json'))
  const expectedPnpm = rootPackage.packageManager.split('@')[1].split('+')[0]
  assert.equal(run(pnpm, ['--version'], repoRoot, { capture: true }).trim(), expectedPnpm)
  const records = await packPackages(temporaryRoot, rootPackage)
  const consumerRoot = resolve(temporaryRoot, 'consumer')
  await installConsumer(consumerRoot, records, rootPackage)
  const cli = await binary(consumerRoot, '@varo-ui/cli', 'varo')
  const vite = await binary(consumerRoot, 'vite', 'vite')
  const vueTsc = await binary(consumerRoot, 'vue-tsc', 'vue-tsc')
  const compiler = await binary(consumerRoot, 'weapp-vite', 'weapp-vite')
  await checkChatPayload(consumerRoot, cli)
  await checkProfiles(consumerRoot, cli)
  for (const delivery of ['source', 'package']) { await buildH5(consumerRoot, cli, vite, vueTsc, delivery) }
  for (const delivery of ['source', 'package']) { await buildNative(consumerRoot, cli, compiler, delivery) }
  console.log('[consumers] Six tarballs, fresh H5/native source and package builds, exact profiles, atomic rejection and minimal Agent payloads verified.')
}
finally {
  await rm(temporaryRoot, { recursive: true, force: true })
}
