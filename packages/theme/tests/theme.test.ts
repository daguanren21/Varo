import { describe, expect, it } from 'vitest'
import { createThemeCssVariables, renderThemeCssVariables } from '../src/css'
import { createTheme, mergeThemeOverrides } from '../src/theme'
import { renderWeappThemeCss } from '../src/weapp'

describe('theme', () => {
  it('creates a base theme', () => {
    const theme = createTheme({
      primary: '#2563eb',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      neutral: '#0f172a',
    })

    expect(theme.semantic.primaryBase).toBe('#2563eb')
    expect(theme.components.input.heightMd).toBe('40px')
  })

  it('merges semantic and input overrides', () => {
    const theme = createTheme({
      primary: '#2563eb',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      neutral: '#0f172a',
    })

    const merged = mergeThemeOverrides(theme, {
      semantic: {
        textBase: '#111827',
      },
      components: {
        input: {
          heightMd: '44px',
        },
      },
    })

    expect(merged.semantic.textBase).toBe('#111827')
    expect(merged.components.input.heightMd).toBe('44px')
  })

  it('creates the complete CSS variable contract with overrides', () => {
    const theme = createTheme({
      primary: '#2563eb',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      neutral: '#0f172a',
    })

    const variables = createThemeCssVariables(theme, {
      '--varo-ui-radius': '20px',
    })

    expect(variables).toMatchObject({
      '--varo-ui-primary': '#2563eb',
      '--varo-ui-primary-foreground': '#ffffff',
      '--varo-ui-radius': '20px',
      '--varo-ui-ring': 'rgb(37 99 235 / 16%)',
      '--varo-ui-shadow-sm': '0 1px 2px rgb(24 36 51 / 6%)',
    })
  })

  it('renders static Weapp theme declarations on page', () => {
    const theme = createTheme({
      primary: '#7c3aed',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      neutral: '#1f1933',
    })

    const css = renderWeappThemeCss(theme)

    expect(css).toContain('page {')
    expect(css).toContain('  --varo-ui-primary: #7c3aed;')
    expect(css).toContain('  --varo-ui-ring: rgb(124 58 237 / 16%);')
  })

  it('rejects unsafe generated CSS values', () => {
    const theme = createTheme({
      primary: '#2563eb',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      neutral: '#0f172a',
    })
    const variables = createThemeCssVariables(theme, {
      '--varo-ui-primary': 'red;\npage { color: red }',
    })

    expect(() => renderThemeCssVariables('page', variables)).toThrow(
      'Invalid theme CSS variable value for --varo-ui-primary',
    )
  })
})
