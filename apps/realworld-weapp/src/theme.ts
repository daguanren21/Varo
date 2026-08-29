import type { ThemeDefinition } from '@varo-ui/theme'
import { createTheme } from '@varo-ui/theme'

export const realworldTheme = createTheme({
  primary: '#ff6216',
  success: '#21cf3c',
  warning: '#f59e0b',
  error: '#e73828',
  neutral: '#231815',
})

export function renderRealworldThemeCss(theme: ThemeDefinition = realworldTheme): string {
  const variables = {
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
  }

  const declarations = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')

  return `page {\n${declarations}\n}`
}
