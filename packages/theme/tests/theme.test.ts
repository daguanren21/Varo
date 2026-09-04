import { describe, expect, it } from 'vitest'
import { createThemeCssVariables, renderThemeCssVariables } from '../src/css'
import { createTheme, mergeThemeOverrides } from '../src/theme'
import { renderWeappThemeCss } from '../src/weapp'

function relativeLuminance(color: string): number {
  const channels = [1, 3, 5].map(offset => Number.parseInt(color.slice(offset, offset + 2), 16) / 255).map(channel => channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4)
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
}

function contrastRatio(foreground: string, background: string): number {
  const foregroundLuminance = relativeLuminance(foreground)
  const backgroundLuminance = relativeLuminance(background)
  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
}

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
    expect(theme.palette.primary.dark).toBe('#1f54c8')
    expect(theme.palette.primary.light).toBe('#5182ef')
    expect(theme.palette.primary.soft).toBe('#e9effd')
    expect(theme.semantic.textRegular).toBe('#606266')
    expect(theme.semantic.infoBase).toBe('#73767a')
  })

  it('preserves the WeChat primary and reference semantic scales', () => {
    const theme = createTheme({
      primary: '#07c160',
      success: '#13b248',
      warning: '#fa9200',
      error: '#eb3437',
      neutral: '#303133',
      info: '#73767a',
    })
    const variables = createThemeCssVariables(theme)

    expect(theme.palette.primary).toMatchObject({
      dark: '#06ad56',
      base: '#07c160',
      light: '#38cd80',
      soft: '#e6f9ef',
    })
    expect(theme.palette.success).toMatchObject({
      dark: '#10973d',
      base: '#13b248',
      light: '#42c16d',
      soft: '#e7f7ec',
    })
    expect(theme.palette.warning.soft).toBe('#fef4e5')
    expect(theme.palette.error.soft).toBe('#fdeaeb')
    expect(theme.palette.info.soft).toBe('#f1f1f2')
    expect(theme.semantic).toMatchObject({
      textBase: '#303133',
      textRegular: '#606266',
      textMuted: '#909399',
      textPlaceholder: '#a8abb2',
      textDisabled: '#c0c4cc',
      surfaceElevated: '#f2f3f5',
      borderBase: '#dcdfe6',
      fillBase: '#f0f2f5',
    })
    expect(variables).toMatchObject({
      '--varo-ui-primary-text': '#1c794a',
      '--varo-ui-success-text': '#22723e',
      '--varo-ui-warning-text': '#95621a',
      '--varo-ui-danger-text': '#8e3335',
    })
  })

  it('creates the dark neutral and semantic surface palette', () => {
    const theme = createTheme({
      primary: '#07c160',
      success: '#13b248',
      warning: '#fa9200',
      error: '#eb3437',
      neutral: '#303133',
      info: '#73767a',
      mode: 'dark',
    })
    const variables = createThemeCssVariables(theme)

    expect(theme.semantic).toMatchObject({
      textBase: '#e5eaf3',
      textRegular: '#cfd3dc',
      textMuted: '#a3a6ad',
      textPlaceholder: '#8d9095',
      textDisabled: '#6c6e72',
      surfaceBase: '#141414',
      surfaceElevated: '#0a0a0a',
      surfaceOverlay: '#1d1e1f',
      fillBase: '#303030',
      borderBase: '#4c4d4f',
      borderStrong: '#636466',
      primarySoft: '#122c1f',
      successSoft: '#142a1b',
      warningSoft: '#342611',
      dangerSoft: '#321819',
    })
    expect(variables).toMatchObject({
      '--varo-ui-bg': '#0a0a0a',
      '--varo-ui-surface': '#141414',
      '--varo-ui-text': '#e5eaf3',
      '--varo-ui-border': '#4c4d4f',
      '--varo-ui-fill': '#303030',
      '--varo-ui-shadow-sm': '0 1px 2px rgb(0 0 0 / 46%)',
      '--varo-ui-primary-text': '#76d6aa',
      '--varo-ui-success-text': '#7cce9e',
      '--varo-ui-warning-text': '#f0be7a',
      '--varo-ui-danger-text': '#e88f95',
    })
  })

  it.each(['light', 'dark'] as const)('keeps %s semantic text actions AA at rest and pressed', (mode) => {
    const variables = createThemeCssVariables(createTheme({
      primary: '#07c160',
      success: '#13b248',
      warning: '#fa9200',
      error: '#eb3437',
      neutral: '#303133',
      info: '#73767a',
      mode,
    }))
    const surface = variables['--varo-ui-surface']
    const tonePairs = [
      ['--varo-ui-primary-text', '--varo-ui-primary-soft'],
      ['--varo-ui-success-text', '--varo-ui-success-soft'],
      ['--varo-ui-warning-text', '--varo-ui-warning-soft'],
      ['--varo-ui-danger-text', '--varo-ui-danger-soft'],
    ] as const

    for (const [textToken, pressedToken] of tonePairs) {
      expect(contrastRatio(variables[textToken], surface)).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(variables[textToken], variables[pressedToken])).toBeGreaterThanOrEqual(4.5)
    }
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
      '--varo-ui-text-regular': '#606266',
      '--varo-ui-text-muted': '#909399',
      '--varo-ui-border': '#dcdfe6',
      '--varo-ui-fill': '#f0f2f5',
      '--varo-ui-info': '#73767a',
      '--varo-ui-radius': '20px',
      '--varo-ui-ring': 'rgb(37 99 235 / 16%)',
      '--varo-ui-shadow-sm': '0 1px 2px rgb(48 49 51 / 6%)',
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
