import type {
  ComponentTokens,
  SemanticTokens,
  ThemeDefinition,
  ThemeOverrides,
  ThemePalette,
  ThemeSeed
} from './types'

export function createPalette(seed: ThemeSeed): ThemePalette {
  return {
    primary: {
      '50': '#eff6ff',
      '500': seed.primary,
      '600': seed.primary
    },
    neutral: {
      '0': '#ffffff',
      '50': '#f8fafc',
      '200': '#e2e8f0',
      '500': '#64748b',
      '900': '#0f172a',
      '1000': seed.neutral
    },
    success: {
      '500': seed.success
    },
    warning: {
      '500': seed.warning
    },
    error: {
      '500': seed.error
    }
  }
}

export function createSemanticTokens(palette: ThemePalette): SemanticTokens {
  return {
    textBase: palette.neutral['1000'],
    textMuted: palette.neutral['500'],
    surfaceBase: palette.neutral['0'],
    surfaceElevated: palette.neutral['50'],
    borderBase: palette.neutral['200'],
    borderStrong: palette.neutral['900'],
    primaryBase: palette.primary['500'],
    primaryHover: palette.primary['600'],
    dangerBase: palette.error['500']
  }
}

export function createComponentTokens(semantic: SemanticTokens): ComponentTokens {
  return {
    button: {
      borderRadius: '12px',
      heightSm: '32px',
      heightMd: '40px',
      heightLg: '48px'
    },
    dialog: {
      borderRadius: '16px',
      overlayColor: semantic.borderStrong
    },
    input: {
      borderRadius: '12px',
      heightSm: '32px',
      heightMd: '40px',
      heightLg: '48px'
    }
  }
}

export function createTheme(seed: ThemeSeed): ThemeDefinition {
  const palette = createPalette(seed)
  const semantic = createSemanticTokens(palette)
  const components = createComponentTokens(semantic)

  return {
    seed,
    palette,
    semantic,
    components
  }
}

export function mergeThemeOverrides(theme: ThemeDefinition, overrides: ThemeOverrides = {}): ThemeDefinition {
  return {
    ...theme,
    semantic: {
      ...theme.semantic,
      ...overrides.semantic
    },
    components: {
      button: {
        ...theme.components.button,
        ...overrides.components?.button
      },
      dialog: {
        ...theme.components.dialog,
        ...overrides.components?.dialog
      },
      input: {
        ...theme.components.input,
        ...overrides.components?.input
      }
    }
  }
}
