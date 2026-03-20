import { describe, expect, it } from 'vitest'
import { createTheme, mergeThemeOverrides } from '../src/theme'

describe('theme', () => {
  it('creates a base theme', () => {
    const theme = createTheme({
      primary: '#2563eb',
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      neutral: '#0f172a'
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
      neutral: '#0f172a'
    })

    const merged = mergeThemeOverrides(theme, {
      semantic: {
        textBase: '#111827'
      },
      components: {
        input: {
          heightMd: '44px'
        }
      }
    })

    expect(merged.semantic.textBase).toBe('#111827')
    expect(merged.components.input.heightMd).toBe('44px')
  })
})
