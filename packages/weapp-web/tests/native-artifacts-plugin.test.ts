import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
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
      server: { host: '127.0.0.1', port: 5197, strictPort: true },
      logLevel: 'silent',
    })
    await server.listen()
    const loaded = await server.pluginContainer.load('\0virtual:varo-native-artifacts')
    const loadedCode = typeof loaded === 'string' ? loaded : loaded?.code
    expect(loadedCode).toBeTypeOf('string')
    expect(loadedCode).not.toContain('__weapp_vite_app_shell.wxss')
    const response = await fetch('http://127.0.0.1:5197/@id/__x00__virtual:varo-native-artifacts')
    const code = await response.text()
    expect(response.status).toBe(200)
    expect(code).toContain('"__weapp_vite_app_shell"')
    expect(code).not.toContain('__weapp_vite_app_shell.wxss')
    expect(code).not.toMatch(/import __nativeAsset\d+ from .*?\.wxss/)
  })
})
