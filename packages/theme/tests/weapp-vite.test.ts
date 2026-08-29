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
})
