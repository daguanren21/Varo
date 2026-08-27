import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const playgroundRoot = resolve(__dirname, '..')
const readJson = <T>(path: string): T => JSON.parse(readFileSync(resolve(playgroundRoot, path), 'utf8')) as T

function collectFiles(directory: string, extension: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return collectFiles(path, extension)
    return entry.name.endsWith(extension) ? [path] : []
  })
}

describe('playground-weapp delivery contract', () => {
  it('declares deterministic build, AI dev, typecheck, and runtime smoke commands', () => {
    const pkg = readJson<{ scripts: Record<string, string> }>('package.json')
    const project = readJson<{ appid: string; compileType: string; miniprogramRoot: string }>('project.config.json')

    expect(pkg.scripts.build).toBe('weapp-vite build && node scripts/prepare-devtools-project.mjs && node scripts/verify-devtools-project.mjs')
    expect(pkg.scripts.dev).toBe('node scripts/prepare-devtools-project.mjs && weapp-vite')
    expect(pkg.scripts['dev:ai']).toBe('node scripts/prepare-devtools-project.mjs && weapp-vite --open')
    expect(pkg.scripts.typecheck).toBe('vue-tsc -p tsconfig.json --noEmit')
    expect(pkg.scripts['smoke:runtime']).toBe('node e2e/runtime-smoke.mjs')
    expect(project).toMatchObject({
      appid: '',
      compileType: 'miniprogram',
      miniprogramRoot: 'devtools/build/mp-weixin/'
    })
  })

  it('uses Wevu as the mini-program runtime and limits Vue aliasing to tests', () => {
    const sfcFiles = collectFiles(resolve(playgroundRoot, 'src/components'), '.vue')
    const pageFiles = collectFiles(resolve(playgroundRoot, 'src/pages'), '.vue')
    const featureFiles = collectFiles(resolve(playgroundRoot, 'src/features'), '.ts')
    const viteConfig = readFileSync(resolve(playgroundRoot, 'vite.config.ts'), 'utf8')

    ;[...sfcFiles, ...pageFiles, ...featureFiles].forEach((path) => {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/from ['\"]vue['\"]/)
    })
    expect(viteConfig).toContain("wevu: 'vue'")
    expect(viteConfig).not.toContain("vue: 'wevu'")
  })

  it('produces a compilable AI mall route when build output exists', () => {
    const outputRoot = resolve(playgroundRoot, 'devtools/build/mp-weixin')
    const appJsonPath = resolve(outputRoot, 'app.json')
    if (!existsSync(appJsonPath)) {
      expect(existsSync(resolve(playgroundRoot, 'src/pages/mall/index.vue'))).toBe(true)
      return
    }

    const app = readJson<{ pages: string[] }>('devtools/build/mp-weixin/app.json')
    const page = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/pages/mall/index.json')

    expect(app.pages[0]).toBe('pages/mall/index')
    expect(existsSync(resolve(outputRoot, 'pages/mall/index.js'))).toBe(true)
    expect(existsSync(resolve(outputRoot, 'pages/mall/index.wxml'))).toBe(true)
    expect(page.usingComponents).toMatchObject({
      'mall-agent-panel': '/components/mall/MallAgentPanel',
      'mall-header': '/components/mall/MallHeader',
      'mall-product-grid': '/components/mall/MallProductGrid'
    })
    expect(Object.keys(page.usingComponents).every((name) => name === name.toLowerCase())).toBe(true)
    Object.values(page.usingComponents)
      .filter((componentPath) => componentPath.startsWith('/components/'))
      .forEach((componentPath) => {
        expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.json`))).toBe(true)
        expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.wxml`))).toBe(true)
        expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.js`))).toBe(true)
      })
  })

  it('emits WXML-safe bindings and native pressed states when build output exists', () => {
    const outputRoot = resolve(playgroundRoot, 'devtools/build/mp-weixin')
    if (!existsSync(resolve(outputRoot, 'app.json'))) return

    const attributeTernary = /=\"\{\{[^\"}]*\?[^\"}]*:[^\"}]*\}\}\"/
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
  })
})
