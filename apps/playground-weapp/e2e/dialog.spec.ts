import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const playgroundRoot = resolve(__dirname, '..')
const readJson = <T>(path: string): T => JSON.parse(readFileSync(resolve(playgroundRoot, path), 'utf8')) as T

function collectFiles(directory: string, extension: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) { return collectFiles(path, extension) }
    return entry.name.endsWith(extension) ? [path] : []
  })
}

describe('playground-weapp delivery contract', () => {
  it('declares deterministic build, AI dev, typecheck, and runtime smoke commands', () => {
    const pkg = readJson<{ scripts: Record<string, string> }>('package.json')
    const project = readJson<{ appid: string, compileType: string, miniprogramRoot: string }>('project.config.json')

    expect(pkg.scripts.build).toBe('weapp-vite build && node scripts/prepare-devtools-project.mjs && node scripts/verify-devtools-project.mjs')
    expect(pkg.scripts.dev).toBe('node scripts/prepare-devtools-project.mjs && weapp-vite')
    expect(pkg.scripts['dev:ai']).toBe('node scripts/prepare-devtools-project.mjs && weapp-vite --open')
    expect(pkg.scripts.open).toBe('node scripts/prepare-devtools-project.mjs && weapp-vite open devtools/build')
    expect(pkg.scripts.typecheck).toBe('vue-tsc -p tsconfig.json --noEmit')
    expect(pkg.scripts['smoke:runtime']).toBe('node e2e/runtime-smoke.mjs')
    expect(project).toMatchObject({
      appid: '',
      compileType: 'miniprogram',
      miniprogramRoot: 'devtools/build/mp-weixin/',
    })
  })

  it('uses Wevu as the mini-program runtime and limits Vue aliasing to tests', () => {
    const sfcFiles = collectFiles(resolve(playgroundRoot, 'src/components'), '.vue')
    const pageFiles = collectFiles(resolve(playgroundRoot, 'src/pages'), '.vue')
    const featureFiles = collectFiles(resolve(playgroundRoot, 'src/features'), '.ts')
    const viteConfig = readFileSync(resolve(playgroundRoot, 'vite.config.ts'), 'utf8')
    const wevuTestAdapter = readFileSync(resolve(playgroundRoot, 'test/wevu.ts'), 'utf8')

    ;[...sfcFiles, ...pageFiles, ...featureFiles].forEach((path) => {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/from ['"]vue['"]/)
    })
    expect(viteConfig).toContain('wevu: resolve(root, \'test/wevu.ts\')')
    expect(wevuTestAdapter).toContain('export * from \'vue\'')
    expect(viteConfig).toContain('autoImportComponents: false')
    expect(viteConfig).not.toContain('vue: \'wevu\'')
  })

  it('produces compilable retail and AI mall routes when build output exists', () => {
    const outputRoot = resolve(playgroundRoot, 'devtools/build/mp-weixin')
    const appJsonPath = resolve(outputRoot, 'app.json')
    if (!existsSync(appJsonPath)) {
      expect(existsSync(resolve(playgroundRoot, 'src/pages/retail-home/index.vue'))).toBe(true)
      expect(existsSync(resolve(playgroundRoot, 'src/pages/mall/index.vue'))).toBe(true)
      expect(existsSync(resolve(playgroundRoot, 'src/pages/robot-chat-showcase/index.vue'))).toBe(true)
      return
    }

    const app = readJson<{
      pages: string[]
      plugins: Record<string, { provider: string, version: string }>
      tabBar: { list: Array<{ iconPath: string, pagePath: string, selectedIconPath: string, text: string }> }
    }>('devtools/build/mp-weixin/app.json')
    const retailPage = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/pages/retail-home/index.json')
    const mallPage = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/pages/mall/index.json')
    const robotPage = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/pages/robot-chat-showcase/index.json')
    const robotChat = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/components/ui/v-robot-chat.json')
    const robotChatWxml = readFileSync(resolve(outputRoot, 'components/ui/v-robot-chat.wxml'), 'utf8')

    expect(app.pages[0]).toBe('pages/retail-home/index')
    expect(app.pages).toContain('pages/mall/index')
    expect(app.pages).toContain('pages/robot-chat-showcase/index')
    expect(app.plugins.varoRobot).toEqual({
      provider: 'wx8c631f7e9f2465e1',
      version: '1.1.15',
    })
    expect(app.tabBar.list).toHaveLength(4)
    const tabIcons = app.tabBar.list.flatMap(item => [item.iconPath, item.selectedIconPath])
    expect(tabIcons).toHaveLength(8)
    tabIcons.forEach((iconPath) => {
      expect(existsSync(resolve(outputRoot, iconPath)), iconPath).toBe(true)
    })
    expect(existsSync(resolve(outputRoot, 'pages/retail-home/index.js'))).toBe(true)
    expect(existsSync(resolve(outputRoot, 'pages/retail-home/index.wxml'))).toBe(true)
    expect(retailPage.usingComponents).toMatchObject({
      'retail-product-card': '/components/retail/RetailProductCard',
      'v-button': '/components/ui/v-button',
      'v-card': '/components/ui/v-card',
      'v-input': '/components/ui/v-input',
    })
    expect(mallPage.usingComponents).toMatchObject({
      'mall-agent-panel': '/components/mall/MallAgentPanel',
      'mall-header': '/components/mall/MallHeader',
      'mall-product-grid': '/components/mall/MallProductGrid',
    })
    expect(robotPage.usingComponents).toMatchObject({
      'v-robot-chat': '/components/ui/v-robot-chat',
    })
    expect(robotChat.usingComponents).toMatchObject({
      'varo-robot-operate-card': './v-robot-operate-card',
      'wechat-robot-chat': 'plugin://varoRobot/chat',
    })
    expect(robotChatWxml).toContain('generic:operateCard="varo-robot-operate-card"')
    expect(Object.keys(retailPage.usingComponents).every(name => name === name.toLowerCase())).toBe(true)
    ;[retailPage, mallPage].flatMap(page => Object.values(page.usingComponents)).filter(componentPath => componentPath.startsWith('/components/')).forEach((componentPath) => {
      expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.json`))).toBe(true)
      expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.wxml`))).toBe(true)
      expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.js`))).toBe(true)
    })
  })

  it('emits WXML-safe bindings and native pressed states when build output exists', () => {
    const outputRoot = resolve(playgroundRoot, 'devtools/build/mp-weixin')
    if (!existsSync(resolve(outputRoot, 'app.json'))) { return }

    const attributeTernary = /="\{\{[^"?}]*\?[^":}]*:[^"}]*\}\}"/
    collectFiles(outputRoot, '.wxml').forEach((path) => {
      const content = readFileSync(path, 'utf8')
      expect(content, path).not.toContain('?.')
      expect(content, path).not.toContain('??')
      expect(content, path).not.toMatch(attributeTernary)
    })

    collectFiles(outputRoot, '.wxss').forEach((path) => {
      expect(readFileSync(path, 'utf8'), path).not.toContain(':active')
    })

    const buttonWxml = readFileSync(resolve(outputRoot, 'components/ui/v-button.wxml'), 'utf8')
    const appWxss = readFileSync(resolve(outputRoot, 'app.wxss'), 'utf8')
    expect(buttonWxml).toContain('hover-class=\"{{hoverClass}}\"')
    expect(appWxss).toContain('.varo-button--pressed')
    expect(appWxss).toContain('.retail-page-enter')
    expect(appWxss).toContain('@keyframes retail-page-in')
    expect(appWxss).toContain('prefers-reduced-motion')
  })
})
