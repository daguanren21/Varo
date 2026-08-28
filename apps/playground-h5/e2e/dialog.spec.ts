import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const playgroundRoot = resolve(__dirname, '..')

describe('playground-h5 smoke baseline', () => {
  it('keeps a real Vite app entry and interactive demo shell', () => {
    const pkg = readFileSync(resolve(playgroundRoot, 'package.json'), 'utf8')
    const app = readFileSync(resolve(playgroundRoot, 'src/App.vue'), 'utf8')
    const main = readFileSync(resolve(playgroundRoot, 'src/main.ts'), 'utf8')
    const html = readFileSync(resolve(playgroundRoot, 'index.html'), 'utf8')

    expect(pkg).toContain('"dev": "vite"')
    expect(pkg).toContain('"build": "vite build"')
    expect(html).toContain('/src/main.ts')
    expect(main).toContain('from \'@varo-ui/theme\'')
    expect(main).toContain('from \'./App.vue\'')
    expect(app).toContain('VButton')
    expect(app).toContain('VInput')
    expect(app).toContain('VDialogRoot')
    expect(app).toContain('VSwitch')
  })
})
