import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const playgroundRoot = resolve(__dirname, '..')

describe('playground-weapp smoke baseline', () => {
  it('keeps a real weapp-vite app shell and page entry', () => {
    const pkg = readFileSync(resolve(playgroundRoot, 'package.json'), 'utf8')
    const app = readFileSync(resolve(playgroundRoot, 'src/app.vue'), 'utf8')
    const page = readFileSync(resolve(playgroundRoot, 'src/pages/index/index.vue'), 'utf8')
    const project = readFileSync(resolve(playgroundRoot, 'project.config.json'), 'utf8')

    expect(pkg).toContain('"dev": "weapp-vite"')
    expect(pkg).toContain('"build": "weapp-vite build"')
    expect(project).toContain('miniprogramRoot')
    expect(app).toContain('"pages": ["pages/index/index"]')
    expect(page).toContain('VButton')
    expect(page).toContain('VInput')
    expect(page).toContain('VSwitch')
  })

  it('produces a weapp build artifact with the index page when dist exists', () => {
    const appJson = resolve(playgroundRoot, 'dist/build/mp-weixin/app.json')
    const indexJs = resolve(playgroundRoot, 'dist/build/mp-weixin/pages/index/index.js')

    if (!existsSync(appJson)) {
      expect(existsSync(resolve(playgroundRoot, 'src/pages/index/index.vue'))).toBe(true)
      return
    }

    const json = readFileSync(appJson, 'utf8')
    expect(json).toContain('pages/index/index')
    expect(existsSync(indexJs)).toBe(true)
  })
})
