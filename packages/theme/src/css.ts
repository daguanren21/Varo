import type { ThemeDefinition } from './types'

export interface ThemeCssVariables {
  '--varo-ui-white': string
  '--varo-ui-black': string
  '--varo-ui-bg': string
  '--varo-ui-surface': string
  '--varo-ui-surface-muted': string
  '--varo-ui-surface-overlay': string
  '--varo-ui-text': string
  '--varo-ui-text-regular': string
  '--varo-ui-text-muted': string
  '--varo-ui-text-placeholder': string
  '--varo-ui-text-disabled': string
  '--varo-ui-border': string
  '--varo-ui-border-strong': string
  '--varo-ui-border-dark': string
  '--varo-ui-border-light': string
  '--varo-ui-border-lighter': string
  '--varo-ui-border-extra-light': string
  '--varo-ui-fill': string
  '--varo-ui-fill-darker': string
  '--varo-ui-fill-dark': string
  '--varo-ui-fill-light': string
  '--varo-ui-fill-lighter': string
  '--varo-ui-fill-extra-light': string
  '--varo-ui-primary': string
  '--varo-ui-primary-dark': string
  '--varo-ui-primary-hover': string
  '--varo-ui-primary-soft': string
  '--varo-ui-primary-foreground': string
  '--varo-ui-primary-text': string
  '--varo-ui-success': string
  '--varo-ui-success-dark': string
  '--varo-ui-success-hover': string
  '--varo-ui-success-soft': string
  '--varo-ui-success-text': string
  '--varo-ui-warning': string
  '--varo-ui-warning-dark': string
  '--varo-ui-warning-hover': string
  '--varo-ui-warning-soft': string
  '--varo-ui-warning-text': string
  '--varo-ui-danger': string
  '--varo-ui-danger-dark': string
  '--varo-ui-danger-hover': string
  '--varo-ui-danger-soft': string
  '--varo-ui-danger-text': string
  '--varo-ui-info': string
  '--varo-ui-info-dark': string
  '--varo-ui-info-hover': string
  '--varo-ui-info-soft': string
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

function semanticTextColor(base: string, text: string): string {
  if (!/^#[\da-f]{6}$/i.test(base) || !/^#[\da-f]{6}$/i.test(text)) {
    return text
  }

  const channels = [1, 3, 5].map((offset) => {
    const baseChannel = Number.parseInt(base.slice(offset, offset + 2), 16)
    const textChannel = Number.parseInt(text.slice(offset, offset + 2), 16)
    return Math.round((baseChannel + textChannel) / 2)
      .toString(16)
      .padStart(2, '0')
  })

  return `#${channels.join('')}`
}

export function createThemeCssVariables(
  theme: ThemeDefinition,
  overrides: ThemeCssVariableOverrides = {},
): ThemeCssVariables {
  return {
    '--varo-ui-white': theme.palette.neutral.white,
    '--varo-ui-black': theme.palette.neutral.black,
    '--varo-ui-bg': theme.semantic.surfaceElevated,
    '--varo-ui-surface': theme.semantic.surfaceBase,
    '--varo-ui-surface-muted': theme.semantic.fillLight,
    '--varo-ui-surface-overlay': theme.semantic.surfaceOverlay,
    '--varo-ui-text': theme.semantic.textBase,
    '--varo-ui-text-regular': theme.semantic.textRegular,
    '--varo-ui-text-muted': theme.semantic.textMuted,
    '--varo-ui-text-placeholder': theme.semantic.textPlaceholder,
    '--varo-ui-text-disabled': theme.semantic.textDisabled,
    '--varo-ui-border': theme.semantic.borderBase,
    '--varo-ui-border-strong': theme.semantic.borderStrong,
    '--varo-ui-border-dark': theme.palette.neutral['border-dark'],
    '--varo-ui-border-light': theme.semantic.borderLight,
    '--varo-ui-border-lighter': theme.semantic.borderLighter,
    '--varo-ui-border-extra-light': theme.palette.neutral['border-extra-light'],
    '--varo-ui-fill': theme.semantic.fillBase,
    '--varo-ui-fill-darker': theme.palette.neutral['fill-darker'],
    '--varo-ui-fill-dark': theme.palette.neutral['fill-dark'],
    '--varo-ui-fill-light': theme.semantic.fillLight,
    '--varo-ui-fill-lighter': theme.semantic.fillLighter,
    '--varo-ui-fill-extra-light': theme.palette.neutral['fill-extra-light'],
    '--varo-ui-primary': theme.semantic.primaryBase,
    '--varo-ui-primary-dark': theme.semantic.primaryDark,
    '--varo-ui-primary-hover': theme.semantic.primaryHover,
    '--varo-ui-primary-soft': theme.semantic.primarySoft,
    '--varo-ui-primary-foreground': theme.palette.neutral.white,
    '--varo-ui-primary-text': semanticTextColor(theme.semantic.primaryBase, theme.semantic.textBase),
    '--varo-ui-success': theme.semantic.successBase,
    '--varo-ui-success-dark': theme.semantic.successDark,
    '--varo-ui-success-hover': theme.semantic.successHover,
    '--varo-ui-success-soft': theme.semantic.successSoft,
    '--varo-ui-success-text': semanticTextColor(theme.semantic.successBase, theme.semantic.textBase),
    '--varo-ui-warning': theme.semantic.warningBase,
    '--varo-ui-warning-dark': theme.semantic.warningDark,
    '--varo-ui-warning-hover': theme.semantic.warningHover,
    '--varo-ui-warning-soft': theme.semantic.warningSoft,
    '--varo-ui-warning-text': semanticTextColor(theme.semantic.warningBase, theme.semantic.textBase),
    '--varo-ui-danger': theme.semantic.dangerBase,
    '--varo-ui-danger-dark': theme.semantic.dangerDark,
    '--varo-ui-danger-hover': theme.semantic.dangerHover,
    '--varo-ui-danger-soft': theme.semantic.dangerSoft,
    '--varo-ui-danger-text': semanticTextColor(theme.semantic.dangerBase, theme.semantic.textBase),
    '--varo-ui-info': theme.semantic.infoBase,
    '--varo-ui-info-dark': theme.semantic.infoDark,
    '--varo-ui-info-hover': theme.semantic.infoHover,
    '--varo-ui-info-soft': theme.semantic.infoSoft,
    '--varo-ui-radius': theme.components.button.borderRadius,
    '--varo-ui-radius-sm': theme.components.input.borderRadius,
    '--varo-ui-shadow-sm': theme.seed.mode === 'dark'
      ? '0 1px 2px rgb(0 0 0 / 46%)'
      : '0 1px 2px rgb(48 49 51 / 6%)',
    '--varo-ui-shadow-md': theme.seed.mode === 'dark'
      ? '0 12px 32px 4px rgb(0 0 0 / 36%), 0 8px 20px rgb(0 0 0 / 72%)'
      : '0 12px 32px 4px rgb(0 0 0 / 4%), 0 8px 20px rgb(0 0 0 / 8%)',
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
