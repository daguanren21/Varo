import type {
  ComponentTokens,
  SemanticTokens,
  ThemeDefinition,
  ThemeOverrides,
  ThemePalette,
  ThemeSeed,
} from './types'

interface ColorScale {
  dark: string
  base: string
  light: string
  soft: string
}

const REFERENCE_SCALES: Record<string, Omit<ColorScale, 'base'>> = {
  '#07c160': { dark: '#06ad56', light: '#38cd80', soft: '#e6f9ef' },
  '#007dff': { dark: '#006ad9', light: '#3397ff', soft: '#e5f2ff' },
  '#13b248': { dark: '#10973d', light: '#42c16d', soft: '#e7f7ec' },
  '#fa9200': { dark: '#d57c00', light: '#fba833', soft: '#fef4e5' },
  '#eb3437': { dark: '#c82c2f', light: '#ef5d5f', soft: '#fdeaeb' },
  '#73767a': { dark: '#5c5e62', light: '#8f9195', soft: '#f1f1f2' },
}

const DARK_SOFT_COLORS: Record<string, string> = {
  '#07c160': '#122c1f',
  '#007dff': '#112335',
  '#13b248': '#142a1b',
  '#fa9200': '#342611',
  '#eb3437': '#321819',
  '#73767a': '#212222',
}

function mixHex(base: string, target: string, targetWeight: number): string {
  const normalizedBase = base.toLowerCase()
  if (!/^#[\da-f]{6}$/.test(normalizedBase) || !/^#[\da-f]{6}$/.test(target)) {
    return base
  }

  const channels = [1, 3, 5].map((offset) => {
    const baseChannel = Number.parseInt(normalizedBase.slice(offset, offset + 2), 16)
    const targetChannel = Number.parseInt(target.slice(offset, offset + 2), 16)
    return Math.round(baseChannel * (1 - targetWeight) + targetChannel * targetWeight)
      .toString(16)
      .padStart(2, '0')
  })

  return `#${channels.join('')}`
}

function createColorScale(base: string, mode: 'light' | 'dark'): Record<string, string> {
  const normalized = base.toLowerCase()
  const reference = REFERENCE_SCALES[normalized]
  const lightScale: ColorScale = reference
    ? { base, ...reference }
    : {
        base,
        dark: mixHex(base, '#000000', 0.15),
        light: mixHex(base, '#ffffff', 0.2),
        soft: mixHex(base, '#ffffff', 0.9),
      }
  const scale = mode === 'dark'
    ? {
        ...lightScale,
        soft: DARK_SOFT_COLORS[normalized] ?? mixHex(base, '#141414', 0.86),
      }
    : lightScale

  return {
    ...scale,
    50: scale.soft,
    500: scale.base,
    600: scale.dark,
  }
}

export function createPalette(seed: ThemeSeed): ThemePalette {
  const mode = seed.mode ?? 'light'
  const neutral = mode === 'dark'
    ? {
        '0': '#141414',
        '50': '#1d1d1d',
        '100': '#262727',
        '200': '#4c4d4f',
        '300': '#636466',
        '400': '#8d9095',
        '500': '#a3a6ad',
        '600': '#cfd3dc',
        '900': '#e5eaf3',
        '1000': '#e5eaf3',
        'white': '#ffffff',
        'black': '#000000',
        'text-primary': '#e5eaf3',
        'text-regular': '#cfd3dc',
        'text-secondary': '#a3a6ad',
        'text-placeholder': '#8d9095',
        'text-disabled': '#6c6e72',
        'border-darker': '#636466',
        'border-dark': '#58585a',
        'border-base': '#4c4d4f',
        'border-light': '#414243',
        'border-lighter': '#363637',
        'border-extra-light': '#2a2b2c',
        'fill-darker': '#424243',
        'fill-dark': '#39393a',
        'fill-base': '#303030',
        'fill-light': '#262727',
        'fill-lighter': '#1d1d1d',
        'fill-extra-light': '#191919',
        'bg-page': '#0a0a0a',
        'bg-base': '#141414',
        'bg-overlay': '#1d1e1f',
      }
    : {
        '0': '#ffffff',
        '50': '#fafafa',
        '100': '#f5f7fa',
        '200': '#dcdfe6',
        '300': '#cdd0d6',
        '400': '#a8abb2',
        '500': '#909399',
        '600': '#606266',
        '900': seed.neutral,
        '1000': seed.neutral,
        'white': '#ffffff',
        'black': '#000000',
        'text-primary': seed.neutral,
        'text-regular': '#606266',
        'text-secondary': '#909399',
        'text-placeholder': '#a8abb2',
        'text-disabled': '#c0c4cc',
        'border-darker': '#cdd0d6',
        'border-dark': '#d4d7de',
        'border-base': '#dcdfe6',
        'border-light': '#e4e7ed',
        'border-lighter': '#ebeef5',
        'border-extra-light': '#f2f6fc',
        'fill-darker': '#e6e8eb',
        'fill-dark': '#ebedf0',
        'fill-base': '#f0f2f5',
        'fill-light': '#f5f7fa',
        'fill-lighter': '#fafafa',
        'fill-extra-light': '#fafcff',
        'bg-page': '#f2f3f5',
        'bg-base': '#ffffff',
        'bg-overlay': '#ffffff',
      }

  return {
    primary: createColorScale(seed.primary, mode),
    success: createColorScale(seed.success, mode),
    warning: createColorScale(seed.warning, mode),
    error: createColorScale(seed.error, mode),
    info: createColorScale(seed.info ?? '#73767a', mode),
    neutral,
  }
}

export function createSemanticTokens(palette: ThemePalette): SemanticTokens {
  return {
    textBase: palette.neutral['text-primary'],
    textRegular: palette.neutral['text-regular'],
    textMuted: palette.neutral['text-secondary'],
    textPlaceholder: palette.neutral['text-placeholder'],
    textDisabled: palette.neutral['text-disabled'],
    surfaceBase: palette.neutral['bg-base'],
    surfaceElevated: palette.neutral['bg-page'],
    surfaceOverlay: palette.neutral['bg-overlay'],
    fillBase: palette.neutral['fill-base'],
    fillLight: palette.neutral['fill-light'],
    fillLighter: palette.neutral['fill-lighter'],
    borderBase: palette.neutral['border-base'],
    borderStrong: palette.neutral['border-darker'],
    borderLight: palette.neutral['border-light'],
    borderLighter: palette.neutral['border-lighter'],
    primaryBase: palette.primary.base,
    primaryDark: palette.primary.dark,
    primaryHover: palette.primary.light,
    primarySoft: palette.primary.soft,
    successBase: palette.success.base,
    successDark: palette.success.dark,
    successHover: palette.success.light,
    successSoft: palette.success.soft,
    warningBase: palette.warning.base,
    warningDark: palette.warning.dark,
    warningHover: palette.warning.light,
    warningSoft: palette.warning.soft,
    dangerBase: palette.error.base,
    dangerDark: palette.error.dark,
    dangerHover: palette.error.light,
    dangerSoft: palette.error.soft,
    infoBase: palette.info.base,
    infoDark: palette.info.dark,
    infoHover: palette.info.light,
    infoSoft: palette.info.soft,
  }
}

export function createComponentTokens(semantic: SemanticTokens): ComponentTokens {
  return {
    button: {
      borderRadius: '12px',
      heightSm: '32px',
      heightMd: '40px',
      heightLg: '48px',
    },
    dialog: {
      borderRadius: '16px',
      overlayColor: semantic.borderStrong,
    },
    input: {
      borderRadius: '12px',
      heightSm: '32px',
      heightMd: '40px',
      heightLg: '48px',
    },
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
    components,
  }
}

export function mergeThemeOverrides(theme: ThemeDefinition, overrides: ThemeOverrides = {}): ThemeDefinition {
  return {
    ...theme,
    semantic: {
      ...theme.semantic,
      ...overrides.semantic,
    },
    components: {
      button: {
        ...theme.components.button,
        ...overrides.components?.button,
      },
      dialog: {
        ...theme.components.dialog,
        ...overrides.components?.dialog,
      },
      input: {
        ...theme.components.input,
        ...overrides.components?.input,
      },
    },
  }
}
