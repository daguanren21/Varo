// @vitest-environment node

import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cp, lstat, mkdir, mkdtemp, readdir, readFile, readlink, realpath, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { it, onTestFinished } from 'vitest'
import { exportRetailStarter } from './export-retail-starter.mjs'

async function sandbox(t) {
  const directory = await mkdtemp(resolve(tmpdir(), 'varo-export-contract-'))
  t.onTestFinished(() => rm(directory, { recursive: true, force: true }))
  return directory
}

const execute = promisify(execFile)
const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url))
const playgroundRoot = fileURLToPath(new URL('../', import.meta.url))

async function sourceGraphFixture(t = { onTestFinished }, packages = []) {
  const root = await realpath(await sandbox(t))
  const repository = resolve(root, 'source')
  const app = resolve(repository, 'apps/playground-weapp')
  const destination = resolve(root, 'exported')
  async function write(path, content) {
    const target = resolve(app, path)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, typeof content === 'string' ? content : JSON.stringify(content))
  }
  await mkdir(resolve(app, 'scripts'), { recursive: true })
  await symlink(resolve(repositoryRoot, 'node_modules'), resolve(repository, 'node_modules'), 'dir')
  await symlink(resolve(playgroundRoot, 'node_modules'), resolve(app, 'node_modules'), 'dir')
  await mkdir(resolve(repository, 'packages/ui-weapp/patches'), { recursive: true })
  await symlink(resolve(repositoryRoot, 'packages/cli'), resolve(repository, 'packages/cli'), 'dir')
  const patchPath = 'packages/ui-weapp/patches/weapp-vite@7.5.0.patch'
  await cp(resolve(repositoryRoot, patchPath), resolve(repository, patchPath))
  await symlink(resolve(repositoryRoot, 'scripts'), resolve(repository, 'scripts'), 'dir')
  for (const filename of ['export-retail-starter.mjs', 'convert-retail-vue.mjs', 'css-references.mjs']) {
    await cp(resolve(playgroundRoot, 'scripts', filename), resolve(app, 'scripts', filename))
  }
  await cp(resolve(repositoryRoot, 'LICENSE'), resolve(repository, 'LICENSE'))
  // This fixture proves source graph collection and publication, not a framework install.
  // Its real pnpm lock uses no registry dependencies; package-import cases use local links.
  await write('starter/package.json', {
    name: 'css-source-graph-fixture',
    version: '0.0.0',
    private: true,
    type: 'module',
    packageManager: 'pnpm@11.24.0',
    dependencies: Object.fromEntries(packages.map(name => [name, `link:./vendor/${name}`])),
    devDependencies: {},
  })
  for (const name of packages) {
    await write(`starter/vendor/${name}/package.json`, { name, version: '1.0.0', style: 'theme.css' })
    await write(`starter/vendor/${name}/theme.css`, '.theme { color: green; }')
    await write(`starter/vendor/${name}/utilities.css`, '.utility { display: block; }')
  }
  await write('app.manifest.json', { pages: ['pages/retail-home/index'] })
  await write('src/app.vue', String.raw`<template><view /></template>
    <style>.hero { background: url("assets/inline\20 hero\(1\).svg?size=2#shape"); }</style>`)
  await write('src/pages/retail-home/index.vue', String.raw`<template><view /></template>
    <style>.page { background: url('../../assets/page\20 asset.svg'); }</style>`)
  await write('src/styles.css', String.raw`
    @import "./themes/theme\20 name.css";
    @import './themes/theme\ name.css';
    @import url(./themes/theme\20 name.css?mode=1#theme);
    @import url( "./themes/theme\ name.css" );
    @IMPORT URL('./themes/theme\20 name.css');
    @import u\72l("./themes/theme\000020name.css") screen;
    @import "themes/color.css?mode=2#theme" layer(theme) screen;
    @import 'themes/color.css';
    @import url(themes/color.css?mode=3#theme);
    @import url( "themes/color.css" );
    .bare { background: url(assets/hero.svg?size=2#shape), url("assets/hero.svg"), url('assets/hero.svg'); }
    .text { content: "url(./missing-string.svg)"; }
    /* @import "./missing-comment.css"; url(./missing-comment.svg) */
  `)
  await write('src/themes/color.css', '.local { background: url(nested.svg?size=1#shape); }')
  await write('src/themes/nested.svg', '<svg data-asset="nested" />')
  await write('src/themes/theme name.css', String.raw`
    @import "nested\20 theme.css";
    .asset { background: url(../assets/a\ b.svg); }
    .external { background: url(//example.com/a.svg), url("https\3a //example.com/a(b).svg"), url("data:image/svg+xml,<svg>(x)</svg>"), url(#shape); }
  `)
  await write('src/themes/nested theme.css', String.raw`
    .quoted { background: url('../assets/quote"icon.svg'); }
    .parentheses { background: url(../assets/icon\(a\).svg); }
  `)
  await write('src/styles/varo.css', 'page { --varo-ui-bg: white; }')
  await write('src/features/retail/http-service.ts', 'export const transport = "fixture"')
  const assets = ['inline hero(1).svg', 'a b.svg', 'quote"icon.svg', 'icon(a).svg', 'page asset.svg', 'hero.svg']
  for (const filename of assets) { await write(`src/assets/${filename}`, `<svg data-asset='${filename}' />`) }
  await write('src/assets/unreferenced.svg', '<svg />')
  await write('src/themes/unreferenced.css', '.unreferenced { color: blue; }')
  await execute('git', ['init', '--quiet', '--template=', repository])
  await execute('git', [
    '-c',
    'user.name=CSS fixture',
    '-c',
    'user.email=css-fixture@example.invalid',
    '-c',
    'commit.gpgsign=false',
    '-c',
    'core.hooksPath=/dev/null',
    'commit',
    '--quiet',
    '--allow-empty',
    '-m',
    'Fixture source revision',
  ], { cwd: repository })
  const run = () => execute(process.execPath, ['scripts/export-retail-starter.mjs', destination], { cwd: app, timeout: 60_000 })
  return { root, repository, app, destination, assets, patchPath, write, run }
}

it('occupied destination preserves existing nested files and directory identity', async (t) => {
  const root = await sandbox(t)
  const destination = resolve(root, 'retail')
  await mkdir(resolve(destination, 'customer-data'), { recursive: true })
  const sentinel = resolve(destination, 'customer-data/orders.json')
  const content = '[{"id":"existing-order","amount":1200}]\n'
  await writeFile(sentinel, content)
  const before = await lstat(destination)

  await assert.rejects(exportRetailStarter(destination), /Destination is occupied/)

  assert.equal(await readFile(sentinel, 'utf8'), content)
  assert.deepEqual(await readdir(destination), ['customer-data'])
  assert.equal((await lstat(destination)).ino, before.ino)
  assert.deepEqual(await readdir(root), ['retail'])
})

it('a hidden environment file makes an otherwise empty destination occupied', async (t) => {
  const root = await sandbox(t)
  const destination = resolve(root, 'retail')
  await mkdir(destination)
  await writeFile(resolve(destination, '.env.local'), 'LOCAL_SETTING=preserve\n')

  await assert.rejects(exportRetailStarter(destination), /Destination is occupied/)

  assert.equal(await readFile(resolve(destination, '.env.local'), 'utf8'), 'LOCAL_SETTING=preserve\n')
  assert.deepEqual(await readdir(destination), ['.env.local'])
})

it('a file destination is never replaced with a directory', async (t) => {
  const root = await sandbox(t)
  const destination = resolve(root, 'retail')
  await writeFile(destination, 'existing file\n')

  await assert.rejects(exportRetailStarter(destination), /never a file or symlink/)

  assert.equal(await readFile(destination, 'utf8'), 'existing file\n')
  assert.equal((await lstat(destination)).isFile(), true)
})

it('a symlink to an empty directory is rejected without following or replacing it', async (t) => {
  const root = await sandbox(t)
  const target = resolve(root, 'owned-directory')
  const destination = resolve(root, 'retail')
  await mkdir(target)
  await symlink(target, destination, 'dir')

  await assert.rejects(exportRetailStarter(destination), /never a file or symlink/)

  assert.equal(await readlink(destination), target)
  assert.deepEqual(await readdir(target), [])
  assert.deepEqual((await readdir(root)).sort(), ['owned-directory', 'retail'])
})

it('a dangling destination symlink is not treated as a new destination', async (t) => {
  const root = await sandbox(t)
  const target = resolve(root, 'missing-directory')
  const destination = resolve(root, 'retail')
  await symlink(target, destination, 'dir')

  await assert.rejects(exportRetailStarter(destination), /never a file or symlink/)

  assert.equal(await readlink(destination), target)
  assert.deepEqual(await readdir(root), ['retail'])
})

it('an unsupported framework never falls back to publishing a different project', async (t) => {
  const root = await sandbox(t)

  await assert.rejects(exportRetailStarter(resolve(root, 'retail'), { framework: 'flutter' }), /Unsupported framework: flutter/)

  assert.deepEqual(await readdir(root), [])
})

it('Taro selection rejects occupied and symlink destinations before creating staging files', async (t) => {
  const root = await sandbox(t)
  const occupied = resolve(root, 'occupied')
  const linked = resolve(root, 'linked')
  await mkdir(occupied)
  await writeFile(resolve(occupied, '.env.local'), 'KEEP_THIS_SETTING=1\n')
  await symlink(occupied, linked, 'dir')
  await assert.rejects(exportRetailStarter(occupied, { framework: 'taro' }), /Destination is occupied/)
  await assert.rejects(exportRetailStarter(linked, { framework: 'taro' }), /never a file or symlink/)
  assert.equal(await readFile(resolve(occupied, '.env.local'), 'utf8'), 'KEEP_THIS_SETTING=1\n')
  assert.equal(await readlink(linked), occupied)
  assert.deepEqual((await readdir(root)).sort(), ['linked', 'occupied'])
})

it('exports exact CSS dependencies and canonical compiler patch bytes with provenance', async (t) => {
  const { repository, app, destination, assets, patchPath, run } = await sourceGraphFixture(t)
  await run()
  const manifest = JSON.parse(await readFile(resolve(destination, 'starter-manifest.json'), 'utf8'))
  const paths = new Set(manifest.files.map(file => file.path))
  for (const path of [...assets.map(filename => `src/assets/${filename}`), 'src/styles.css', 'src/themes/color.css', 'src/themes/nested.svg', 'src/themes/theme name.css', 'src/themes/nested theme.css']) {
    assert.ok(paths.has(path), `Missing collected CSS dependency: ${path}`)
    assert.deepEqual(await readFile(resolve(destination, path)), await readFile(resolve(app, path)))
  }
  assert.ok((await readFile(resolve(destination, 'src/app.vue'), 'utf8')).includes(await readFile(resolve(app, 'src/app.vue'), 'utf8')))
  const patch = await readFile(resolve(repository, patchPath))
  const patchDigest = createHash('sha256').update(patch).digest('hex')
  assert.deepEqual(await readFile(resolve(destination, 'patches/weapp-vite@7.5.0.patch')), patch)
  assert.equal(manifest.files.find(file => file.path === 'patches/weapp-vite@7.5.0.patch')?.sha256, patchDigest)
  assert.equal(manifest.sourceFiles.find(file => file.path === patchPath)?.sha256, patchDigest)
  await assert.rejects(lstat(resolve(app, 'starter/patches')), { code: 'ENOENT' })
  assert.equal(paths.has('src/assets/unreferenced.svg'), false)
  assert.equal(paths.has('src/themes/unreferenced.css'), false)
  assert.ok((await readFile(resolve(destination, 'pnpm-lock.yaml'), 'utf8')).includes('lockfileVersion:'))
  await assert.rejects(lstat(resolve(destination, 'node_modules')), { code: 'ENOENT' })
}, 60_000)

it.each([
  ['import', String.raw`@import url("./missing\20 theme.css");`, 'missing theme.css'],
  ['asset', String.raw`.asset { background: url(../assets/missing\20 icon.svg); }`, 'missing icon.svg'],
])('rejects a missing escaped CSS %s before publishing any source or lockfile', async (_kind, css, missing) => {
  const { root, destination, write, run } = await sourceGraphFixture()
  await write('src/themes/nested theme.css', css)
  await assert.rejects(run(), (error) => {
    assert.ok(error.stderr.includes('Unresolved source reference'))
    assert.ok(error.stderr.includes(missing))
    return true
  })
  await assert.rejects(lstat(destination), { code: 'ENOENT' })
  assert.deepEqual(await readdir(root), ['source'])
}, 60_000)

it('preserves declared unscoped and scoped package imports while collecting declaration URLs locally', async (t) => {
  const { app, destination, write, run } = await sourceGraphFixture(t, ['tailwindcss', '@fixture/styles'])
  const css = `@import "tailwindcss/theme.css" layer(theme);
    @import url(tailwindcss/utilities.css);
    @import '@fixture/styles';
    @import "@fixture/styles/theme.css?mode=1#theme" screen;
    @import url('@fixture/styles/utilities.css');
    .asset { background: url(tailwindcss/icon.svg?mode=2#shape); }`
  await write('src/styles.css', css)
  await write('src/tailwindcss/icon.svg', '<svg data-asset="local-package-name" />')
  await run()
  assert.equal(await readFile(resolve(destination, 'src/styles.css'), 'utf8'), css)
  assert.deepEqual(await readFile(resolve(destination, 'src/tailwindcss/icon.svg')), await readFile(resolve(app, 'src/tailwindcss/icon.svg')))
  const lock = await readFile(resolve(destination, 'pnpm-lock.yaml'), 'utf8')
  assert.ok(lock.includes('link:vendor/tailwindcss'))
  assert.ok(lock.includes('link:vendor/@fixture/styles'))
  await assert.rejects(lstat(resolve(destination, 'node_modules')), { code: 'ENOENT' })
}, 60_000)

it.each([
  ['bare asset', '.asset { background: url(assets/missing.svg); }', 'src/assets/missing.svg.ts'],
  ['bare import', '@import "themes/missing.css";', 'src/themes/missing.css.ts'],
  ['extensionless import', '@import "themes/fallback";', 'src/themes/fallback.ts'],
  ['extensionless asset', '.asset { background: url(assets/fallback); }', 'src/assets/fallback.ts'],
  ['JavaScript extension import', '@import url(themes/fallback.js);', 'src/themes/fallback.ts'],
  ['directory import', '@import "themes/fallback";', 'src/themes/fallback/index.ts'],
  ['declared package asset', '.asset { background: url(tailwindcss/missing.svg); }', 'src/tailwindcss/missing.svg.ts'],
  ['undeclared scoped import', '@import "@fixture/unknown/theme.css";', 'src/unrelated.ts'],
])('requires an exact local file for a %s without module resolution fallbacks', async (_kind, css, otherFile) => {
  const { root, destination, write, run } = await sourceGraphFixture(undefined, ['tailwindcss'])
  await write('src/styles.css', css)
  await write(otherFile, 'export const unrelated = true')
  await assert.rejects(run(), error => error.stderr.includes('Unresolved source reference'))
  await assert.rejects(lstat(destination), { code: 'ENOENT' })
  assert.deepEqual(await readdir(root), ['source'])
}, 60_000)

it.each([
  ['tailwindcss', 'tailwindcss/theme.css'],
  ['@fixture/styles', '@fixture/styles/theme.css'],
  ['@fixture/styles', '@fixture/styles'],
])('rejects ambiguous %s import %s until the local file is explicitly relative', async (name, specifier) => {
  const { root, destination, write, run } = await sourceGraphFixture(undefined, [name])
  await write(`src/${specifier}`, '.local { color: red; }')
  await write('src/styles.css', `@import "${specifier}?mode=1#theme";`)
  await assert.rejects(run(), (error) => {
    assert.ok(error.stderr.includes('Ambiguous stylesheet import'))
    assert.ok(error.stderr.includes(`Use ./${specifier}`))
    return true
  })
  await assert.rejects(lstat(destination), { code: 'ENOENT' })
  assert.deepEqual(await readdir(root), ['source'])
  const css = `@import "./${specifier}?mode=1#theme";`
  await write('src/styles.css', css)
  await run()
  assert.equal(await readFile(resolve(destination, 'src/styles.css'), 'utf8'), css)
  assert.equal(await readFile(resolve(destination, `src/${specifier}`), 'utf8'), '.local { color: red; }')
}, 60_000)

it.each([
  ['import', '@import "linked.css";'],
  ['asset', '.asset { background: url(linked.css); }'],
  ['directory import', '@import "linked/theme.css";'],
  ['directory asset', '.asset { background: url(linked/theme.css); }'],
])('rejects a symlink CSS %s before changing an empty destination', async (_kind, css) => {
  const { root, app, destination, write, run } = await sourceGraphFixture()
  await write('src/styles.css', css)
  await write('src/real/theme.css', '.real { color: green; }')
  await symlink(resolve(app, 'src/real/theme.css'), resolve(app, 'src/linked.css'))
  await symlink(resolve(app, 'src/real'), resolve(app, 'src/linked'), 'dir')
  await mkdir(destination)
  const before = await lstat(destination)
  await assert.rejects(run(), error => /symlink/.test(error.stderr))
  assert.deepEqual(await readdir(destination), [])
  assert.equal((await lstat(destination)).ino, before.ino)
  assert.deepEqual((await readdir(root)).sort(), ['exported', 'source'])
}, 60_000)

it.each([
  ['import', '@import "../../../outside.css?mode=1#theme";'],
  ['asset', '.asset { background: url(../../../outside.css?mode=1#shape); }'],
])('rejects a CSS %s escaping the approved source closure before publication', async (_kind, css) => {
  const { root, repository, destination, write, run } = await sourceGraphFixture()
  await writeFile(resolve(repository, 'outside.css'), '.outside { color: red; }')
  await write('src/styles.css', css)
  await assert.rejects(run(), error => error.stderr.includes('Import leaves the approved native/pure-helper source closure'))
  await assert.rejects(lstat(destination), { code: 'ENOENT' })
  assert.deepEqual(await readdir(root), ['source'])
}, 60_000)

it.each(['missing', 'symlink'])('rejects a %s canonical compiler patch before publication', async (kind) => {
  const { root, repository, destination, patchPath, run } = await sourceGraphFixture()
  await rm(resolve(repository, patchPath))
  if (kind === 'symlink') { await symlink(resolve(repositoryRoot, patchPath), resolve(repository, patchPath)) }
  await assert.rejects(run(), (error) => {
    assert.ok(error.stderr.includes('weapp-vite@7.5.0.patch'))
    assert.ok(error.stderr.includes(kind === 'missing' ? 'ENOENT' : 'non-symlink'))
    return true
  })
  await assert.rejects(lstat(destination), { code: 'ENOENT' })
  assert.deepEqual(await readdir(root), ['source'])
}, 60_000)
