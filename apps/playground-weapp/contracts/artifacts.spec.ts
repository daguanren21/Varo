import { Buffer } from 'node:buffer'
import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const playgroundRoot = resolve(__dirname, '..')
const readJson = <T>(path: string): T => JSON.parse(readFileSync(resolve(playgroundRoot, path), 'utf8')) as T

interface AppRoutes {
  pages: string[]
  subPackages?: Array<{ root: string, pages: string[] }>
  subpackages?: Array<{ root: string, pages: string[] }>
}

function registeredRoutes(app: AppRoutes): string[] {
  return [
    ...app.pages,
    ...(app.subPackages ?? app.subpackages ?? []).flatMap(pkg => pkg.pages.map(page => `${pkg.root}/${page}`)),
  ]
}

function runArtifactVerifier(mutate?: (outputRoot: string) => void) {
  const fixture = mkdtempSync(resolve(tmpdir(), 'varo-native-artifacts-'))
  const appRoot = resolve(fixture, 'apps/playground-weapp')
  try {
    mkdirSync(resolve(appRoot, 'scripts'), { recursive: true })
    symlinkSync(resolve(playgroundRoot, '../../node_modules'), resolve(fixture, 'node_modules'), 'dir')
    symlinkSync(resolve(playgroundRoot, 'node_modules'), resolve(appRoot, 'node_modules'), 'dir')
    cpSync(resolve(playgroundRoot, 'scripts/verify-devtools-project.mjs'), resolve(appRoot, 'scripts/verify-devtools-project.mjs'))
    cpSync(resolve(playgroundRoot, 'devtools/build'), resolve(appRoot, 'devtools/build'), { recursive: true })
    mutate?.(resolve(appRoot, 'devtools/build/mp-weixin'))
    const result = spawnSync(process.execPath, ['scripts/verify-devtools-project.mjs'], { cwd: appRoot, encoding: 'utf8' })
    expect(result.error).toBeUndefined()
    return result
  }
  finally {
    rmSync(fixture, { recursive: true, force: true })
  }
}

function collectFiles(directory: string, extension: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) { return collectFiles(path, extension) }
    return entry.name.endsWith(extension) ? [path] : []
  })
}

describe('playground-weapp delivery contract', () => {
  it('produces compilable retail and AI mall routes from the production build', () => {
    const outputRoot = resolve(playgroundRoot, 'devtools/build/mp-weixin')

    const app = readJson<AppRoutes & {
      plugins?: Record<string, { provider: string, version: string }>
      tabBar: { list: Array<{ iconPath: string, pagePath: string, selectedIconPath: string, text: string }> }
    }>('devtools/build/mp-weixin/app.json')
    const retailPage = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/pages/retail-home/index.json')
    const mallPage = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/pages/mall/index.json')

    const manifest = readJson<AppRoutes & { tabBar: typeof app.tabBar }>('app.manifest.json')
    const routes = registeredRoutes(app)
    const expectedRoutes = registeredRoutes(manifest)
    if (process.env.WEAPP_ROBOT_CHAT === '1') {
      expectedRoutes.push('pages/robot-chat-showcase/index', 'pages/web-preview-robot-chat/index')
    }
    expect([...routes].sort()).toEqual([...expectedRoutes].sort())
    expect(new Set(routes).size).toBe(routes.length)
    expect(routes).toContain('blocks-lab/attachments/index')
    expect(app.tabBar).toEqual(manifest.tabBar)
    app.tabBar.list.forEach(tab => expect(app.pages).toContain(tab.pagePath))
    routes.forEach((route) => {
      for (const extension of ['.js', '.json', '.wxml']) {
        expect(existsSync(resolve(outputRoot, `${route}${extension}`)), `${route}${extension}`).toBe(true)
      }
    })

    expect(app.pages[0]).toBe('pages/retail-home/index')
    expect(routes).toContain('pages/mall/index')
    const tabIcons = app.tabBar.list.flatMap(item => [item.iconPath, item.selectedIconPath])
    tabIcons.forEach((iconPath) => {
      expect(existsSync(resolve(outputRoot, iconPath)), iconPath).toBe(true)
    })
    expect(existsSync(resolve(outputRoot, 'pages/retail-home/index.js'))).toBe(true)
    expect(existsSync(resolve(outputRoot, 'pages/retail-home/index.wxml'))).toBe(true)
    if (process.env.WEAPP_ROBOT_CHAT === '1') {
      expect(app.plugins).toEqual({
        varoRobot: { provider: 'wx8c631f7e9f2465e1', version: '1.1.15' },
      })
      expect(routes).toContain('pages/robot-chat-showcase/index')
      expect(routes).toContain('pages/web-preview-robot-chat/index')
      const robotPage = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/pages/robot-chat-showcase/index.json')
      const robotChat = readJson<{ usingComponents: Record<string, string> }>('devtools/build/mp-weixin/components/ui/v-robot-chat.json')
      const robotChatWxml = readFileSync(resolve(outputRoot, 'components/ui/v-robot-chat.wxml'), 'utf8')
      expect(robotPage.usingComponents).toMatchObject({ 'v-robot-chat': '/components/ui/v-robot-chat' })
      expect(robotChat.usingComponents).toMatchObject({
        'varo-robot-operate-card': './v-robot-operate-card',
        'wechat-robot-chat': 'plugin://varoRobot/chat',
      })
      expect(robotChatWxml).toContain('generic:operate-card="varo-robot-operate-card"')
    }
    else {
      expect(app.plugins).toBeUndefined()
      expect(routes).not.toContain('pages/robot-chat-showcase/index')
      expect(routes).not.toContain('pages/web-preview-robot-chat/index')
    }
    ;[retailPage, mallPage].flatMap(page => Object.values(page.usingComponents)).filter(componentPath => componentPath.startsWith('/components/')).forEach((componentPath) => {
      expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.json`))).toBe(true)
      expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.wxml`))).toBe(true)
      expect(existsSync(resolve(outputRoot, `${componentPath.slice(1)}.js`))).toBe(true)
    })
  })

  it('accepts the compiled package graph, same-package references and subpackage-to-main references', () => {
    const result = runArtifactVerifier((outputRoot) => {
      writeFileSync(resolve(outputRoot, 'ownership-probe.js'), 'module.exports = "require(\\"./blocks-lab/retail/index.js\\")"; // require("./missing.js")\n')
      writeFileSync(resolve(outputRoot, 'blocks-lab/ownership-probe.js'), 'require("./retail/index"); require("../ownership-probe.js");\n')
    })
    expect(result.status, result.stderr).toBe(0)
    expect(result.stdout).toContain('synchronous script references')
  })

  it.each([
    ['main-to-subpackage', 'ownership-probe.js', 'require("./blocks-lab/retail/index.js");'],
    ['cross-subpackage', 'pages/mall/ownership-probe.js', 'require("../../blocks-lab/retail/index.js");'],
    ['static ESM re-export', 'ownership-probe.js', 'export { value } from "./blocks-lab/retail/index.js";'],
  ])('rejects a %s synchronous package edge', (_name, owner, code) => {
    const result = runArtifactVerifier(outputRoot => writeFileSync(resolve(outputRoot, owner), code))
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Forbidden synchronous package reference:')
    expect(result.stderr).toContain(owner)
  })

  it('rejects a main-to-subpackage component reference', () => {
    const result = runArtifactVerifier((outputRoot) => {
      const path = resolve(outputRoot, 'app.json')
      const app = JSON.parse(readFileSync(path, 'utf8'))
      app.usingComponents = { ...app.usingComponents, 'ownership-probe': '/blocks-lab/retail/index' }
      writeFileSync(path, JSON.stringify(app))
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Forbidden synchronous package reference: app.json')
  })

  it('rejects a main-to-subpackage stylesheet import', () => {
    const result = runArtifactVerifier((outputRoot) => {
      writeFileSync(resolve(outputRoot, 'blocks-lab/ownership-probe.wxss'), '')
      const path = resolve(outputRoot, 'app.wxss')
      writeFileSync(path, `${readFileSync(path, 'utf8')}\n@import "./blocks-lab/ownership-probe.wxss";\n`)
    })
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Forbidden synchronous package reference: app.wxss')
  })

  it('rejects a main package above the uncompressed 2 MiB limit', () => {
    const result = runArtifactVerifier(outputRoot => writeFileSync(resolve(outputRoot, 'budget-probe.bin'), Buffer.alloc(2 * 1024 * 1024 + 1)))
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Main package exceeds 2 MiB:')
  })

  it('rejects a missing synchronous script dependency', () => {
    const result = runArtifactVerifier(outputRoot => writeFileSync(resolve(outputRoot, 'ownership-probe.js'), 'require("./missing-dependency.js");'))
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Missing compiled script dependency:')
  })

  it('rejects a missing registered page artifact', () => {
    const result = runArtifactVerifier(outputRoot => rmSync(resolve(outputRoot, 'blocks-lab/attachments/index.wxml')))
    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('Missing compiled page artifact: blocks-lab/attachments/index.wxml')
  })

  it('emits WXML-safe bindings without unsupported native pseudo-classes', () => {
    const outputRoot = resolve(playgroundRoot, 'devtools/build/mp-weixin')

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
  })
})
