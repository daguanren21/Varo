import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { createServer } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import { nativeArtifactsPlugin } from '../src/plugin/index.ts'

async function writeMiniProgram(root: string) {
  await mkdir(join(root, 'pages/index'), { recursive: true })
  await writeFile(join(root, 'app.json'), JSON.stringify({ pages: ['pages/index/index'] }))
  await writeFile(join(root, 'app.js'), 'App({})')
  await writeFile(join(root, 'app.wxss'), 'page { color: red; }')
  await writeFile(join(root, 'pages/index/index.json'), JSON.stringify({
    usingComponents: { 'weapp-app-shell': '/__weapp_vite_app_shell' },
  }))
  await writeFile(join(root, 'pages/index/index.wxml'), '<weapp-app-shell><view>ready</view></weapp-app-shell>')
  await writeFile(join(root, 'pages/index/index.js'), 'Page({})')
  await writeFile(join(root, '__weapp_vite_app_shell.json'), JSON.stringify({
    component: true,
    styleIsolation: 'apply-shared',
  }))
  await writeFile(join(root, '__weapp_vite_app_shell.wxml'), '<view class="app-root"><slot /></view>')
  await writeFile(join(root, '__weapp_vite_app_shell.js'), 'Component({})')
}

describe('native artifact plugin', () => {
  let nativeRoot = ''
  let server: Awaited<ReturnType<typeof createServer>> | undefined

  afterEach(async () => {
    await server?.close()
    server = undefined
    if (nativeRoot) { await rm(nativeRoot, { recursive: true, force: true }) }
  })

  it('does not emit Vite URL imports for components without WXSS', async () => {
    nativeRoot = await mkdtemp(join(tmpdir(), 'varo-weapp-web-'))
    await writeMiniProgram(nativeRoot)
    server = await createServer({
      configFile: false,
      root: nativeRoot,
      plugins: [
        vue(),
        nativeArtifactsPlugin({
          nativeBuildRoot: nativeRoot,
          pages: { sandbox: 'pages/index/index' },
        }),
      ],
      server: { host: '127.0.0.1', port: 0, strictPort: true },
      logLevel: 'silent',
    })
    await server.listen()
    const loaded = await server.pluginContainer.load('\0virtual:varo-native-artifacts')
    const loadedCode = typeof loaded === 'string' ? loaded : loaded?.code
    expect(loadedCode).toBeTypeOf('string')
    expect(loadedCode).not.toContain('__weapp_vite_app_shell.wxss')
    const response = await fetch(new URL('/@id/__x00__virtual:varo-native-artifacts', server.resolvedUrls!.local[0]!))
    const code = await response.text()
    expect(response.status).toBe(200)
    expect(code).toContain('"__weapp_vite_app_shell"')
    expect(code).not.toContain('__weapp_vite_app_shell.wxss')
    expect(code).not.toMatch(/import __nativeAsset\d+ from .*?\.wxss/)
  })

  it('preserves filename data while bundling existing JavaScript asset candidates', async () => {
    nativeRoot = await mkdtemp(join(tmpdir(), 'varo-weapp-web-'))
    await writeMiniProgram(nativeRoot)
    await mkdir(join(nativeRoot, 'assets'))
    await writeFile(join(nativeRoot, 'assets/cover.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>')
    await writeFile(join(nativeRoot, 'pages/index/index.js'), 'Page({ data: { names: ["audio.mp3", "photo.png"], image: "/assets/cover.svg?size=2#preview" } })')
    server = await createServer({
      configFile: false,
      root: nativeRoot,
      plugins: [nativeArtifactsPlugin({ nativeBuildRoot: nativeRoot, pages: { sandbox: 'pages/index/index' } })],
      server: { host: '127.0.0.1', port: 0, strictPort: true },
      logLevel: 'silent',
    })
    const { default: bundle } = await server.ssrLoadModule('virtual:varo-native-artifacts')
    expect(bundle.assets['/assets/cover.svg?size=2#preview']).toBe(`${bundle.assets['/assets/cover.svg']}?size=2#preview`)
    expect(Object.keys(bundle.assets)).toEqual(['/assets/cover.svg', '/assets/cover.svg?size=2#preview', 'assets/cover.svg'])
    let data: unknown
    bundle.modules['pages/index/index.js'](undefined, {}, {}, { Page: (options: { data: unknown }) => { data = options.data } })
    expect(data).toEqual({ names: ['audio.mp3', 'photo.png'], image: '/assets/cover.svg?size=2#preview' })
  })

  it.each(['wxml', 'wxss'])('rejects missing explicitly referenced %s assets', async (extension) => {
    nativeRoot = await mkdtemp(join(tmpdir(), 'varo-weapp-web-'))
    await writeMiniProgram(nativeRoot)
    await writeFile(join(nativeRoot, `pages/index/index.${extension}`), extension === 'wxml'
      ? '<image src="missing.png" />'
      : '.picture { background-image: url("missing.png"); }')
    server = await createServer({
      configFile: false,
      root: nativeRoot,
      plugins: [nativeArtifactsPlugin({ nativeBuildRoot: nativeRoot, pages: { sandbox: 'pages/index/index' } })],
      server: { host: '127.0.0.1', port: 0, strictPort: true },
      logLevel: 'silent',
    })
    await expect(server.ssrLoadModule('virtual:varo-native-artifacts')).rejects.toThrow('Missing native artifact pages/index/missing.png')
  })

  it.each(['traversal', 'symlink'])('rejects JavaScript asset candidates that escape through %s', async (kind) => {
    nativeRoot = await mkdtemp(join(tmpdir(), 'varo-weapp-web-'))
    const buildRoot = join(nativeRoot, 'build')
    await writeMiniProgram(buildRoot)
    await writeFile(join(nativeRoot, 'outside.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>')
    if (kind === 'symlink') { await symlink(join(nativeRoot, 'outside.svg'), join(buildRoot, 'outside.svg')) }
    const asset = kind === 'symlink' ? '/outside.svg' : '../../../outside.svg'
    await writeFile(join(buildRoot, 'pages/index/index.js'), `Page({ data: { image: ${JSON.stringify(asset)} } })`)
    server = await createServer({
      configFile: false,
      root: nativeRoot,
      plugins: [nativeArtifactsPlugin({ nativeBuildRoot: buildRoot, pages: { sandbox: 'pages/index/index' } })],
      server: { host: '127.0.0.1', port: 0, strictPort: true },
      logLevel: 'silent',
    })
    await expect(server.ssrLoadModule('virtual:varo-native-artifacts')).rejects.toThrow(/escapes the native build root|resolves outside the build root/)
  })
})
