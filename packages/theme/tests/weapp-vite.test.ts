import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createTheme } from '../src/theme'
import { createVaroWeappThemePlugin } from '../src/weapp-vite'

const theme = createTheme({
  primary: '#ff6216',
  success: '#21cf3c',
  warning: '#f59e0b',
  error: '#e73828',
  neutral: '#231815',
})

function themeTransform(appStyle: string) {
  const transform = createVaroWeappThemePlugin({ appStyle, theme }).transform
  if (typeof transform !== 'function') {
    throw new TypeError('Expected a Vite transform hook')
  }
  return transform
}

describe('createVaroWeappThemePlugin', () => {
  it('appends generated page variables to the configured app stylesheet', async () => {
    const appStyle = resolve('/project/src/app.scss')
    const transformed = await themeTransform(appStyle).call(
      {} as never,
      '@import "./base.css";',
      `${appStyle}?direct`,
      { moduleType: 'css' },
    )

    expect(transformed).toMatchObject({
      code: expect.stringContaining('page {'),
    })
    expect(transformed).toMatchObject({
      code: expect.stringContaining('--varo-ui-primary: #ff6216;'),
    })
  })

  it('leaves unrelated stylesheets unchanged', async () => {
    const appStyle = resolve('/project/src/app.scss')
    const transformed = await themeTransform(appStyle).call(
      {} as never,
      '.button { color: red; }',
      resolve('/project/src/button.scss'),
      { moduleType: 'css' },
    )

    expect(transformed).toBeUndefined()
  })

  it('leaves weapp-vite sidecar JavaScript wrappers unchanged', async () => {
    const appStyle = resolve('/project/src/app.scss')
    const transformed = await themeTransform(appStyle).call(
      {} as never,
      'export default "@import \'./styles/varo.css\';\\n\\npage {\\n  button {\\n    line-height: inherit;\\n  }\\n}"',
      `${appStyle}?raw&weapp-vite-sidecar-owner=%2Fproject%2Fsrc%2Fapp.vue&weapp-vite-sidecar=style&lang.js`,
      { moduleType: 'js' },
    )

    expect(transformed).toBeUndefined()
  })

  it('appends generated page variables to compiled app.wxss when the sidecar skipped transform', () => {
    const plugin = createVaroWeappThemePlugin({
      appStyle: resolve('/project/src/app.scss'),
      theme,
    })
    const generateBundle = plugin.generateBundle
    if (!generateBundle || typeof generateBundle === 'function' || typeof generateBundle.handler !== 'function') {
      throw new TypeError('Expected a generateBundle hook')
    }

    const appWxss = {
      type: 'asset',
      fileName: 'app.wxss',
      source: '@import "./styles.wxss";\npage { height: 100%; }',
    }
    generateBundle.handler.call({} as never, {} as never, { 'app.wxss': appWxss as never }, false)

    expect(appWxss.source).toContain('--varo-ui-primary: #ff6216;')
    expect(appWxss.source).toContain('page { height: 100%; }')
  })
})
