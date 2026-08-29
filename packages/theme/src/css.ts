import type { ThemeDefinition } from './types'

export interface ThemeCssVariables {
  '--varo-ui-bg': string
  '--varo-ui-surface': string
  '--varo-ui-surface-muted': string
  '--varo-ui-text': string
  '--varo-ui-text-muted': string
  '--varo-ui-border': string
  '--varo-ui-border-strong': string
  '--varo-ui-primary': string
  '--varo-ui-primary-foreground': string
  '--varo-ui-success': string
  '--varo-ui-warning': string
  '--varo-ui-danger': string
  '--varo-ui-radius': string
  '--varo-ui-radius-sm': string
  '--varo-ui-shadow-sm': string
  '--varo-ui-shadow-md': string
  '--varo-ui-ring': string
  [name: `--${string}`]: string
}

export type ThemeCssVariableOverrides = Partial<ThemeCssVariables>

function colorWithAlpha(color: string, alpha: number): string {
  const value = color.slice(1)
  const normalized = value.length === 3
    ? value.split('').map(part => `${part}${part}`).join('')
    : value

  if (!color.startsWith('#') || !/^[\da-f]{6}$/i.test(normalized)) {
    return color
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgb(${red} ${green} ${blue} / ${alpha}%)`
}

export function createThemeCssVariables(
  theme: ThemeDefinition,
  overrides: ThemeCssVariableOverrides = {},
): ThemeCssVariables {
  return {
    '--varo-ui-bg': theme.semantic.surfaceElevated,
    '--varo-ui-surface': theme.semantic.surfaceBase,
    '--varo-ui-surface-muted': theme.palette.neutral['50'],
    '--varo-ui-text': theme.semantic.textBase,
    '--varo-ui-text-muted': theme.semantic.textMuted,
    '--varo-ui-border': theme.semantic.borderBase,
    '--varo-ui-border-strong': theme.semantic.borderStrong,
    '--varo-ui-primary': theme.semantic.primaryBase,
    '--varo-ui-primary-foreground': theme.palette.neutral['0'],
    '--varo-ui-success': theme.seed.success,
    '--varo-ui-warning': theme.seed.warning,
    '--varo-ui-danger': theme.semantic.dangerBase,
    '--varo-ui-radius': theme.components.button.borderRadius,
    '--varo-ui-radius-sm': theme.components.input.borderRadius,
    '--varo-ui-shadow-sm': '0 1px 2px rgb(24 36 51 / 6%)',
    '--varo-ui-shadow-md': '0 14px 34px rgb(24 36 51 / 12%)',
    '--varo-ui-ring': colorWithAlpha(theme.semantic.primaryBase, 16),
    ...overrides,
  }
}

export function renderThemeCssVariables(selector: string, variables: ThemeCssVariables): string {
  const normalizedSelector = selector.trim()
  if (!normalizedSelector || /[{}]/.test(normalizedSelector)) {
    throw new Error(`Invalid theme CSS selector: ${selector}`)
  }

  const declarations = Object.entries(variables).map(([name, value]) => {
    if (/[;{}\r\n]/.test(value)) {
      throw new Error(`Invalid theme CSS variable value for ${name}`)
    }
    return `  ${name}: ${value};`
  })

  return `${normalizedSelector} {\n${declarations.join('\n')}\n}`
}
