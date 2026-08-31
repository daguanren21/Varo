export interface ThemeSeed {
  primary: string
  success: string
  warning: string
  error: string
  neutral: string
  info?: string
  mode?: 'light' | 'dark'
}

export interface ThemePalette {
  primary: Record<string, string>
  neutral: Record<string, string>
  success: Record<string, string>
  warning: Record<string, string>
  error: Record<string, string>
  info: Record<string, string>
}

export interface SemanticTokens {
  textBase: string
  textRegular: string
  textMuted: string
  textPlaceholder: string
  textDisabled: string
  surfaceBase: string
  surfaceElevated: string
  surfaceOverlay: string
  fillBase: string
  fillLight: string
  fillLighter: string
  borderBase: string
  borderStrong: string
  borderLight: string
  borderLighter: string
  primaryBase: string
  primaryDark: string
  primaryHover: string
  primarySoft: string
  successBase: string
  successDark: string
  successHover: string
  successSoft: string
  warningBase: string
  warningDark: string
  warningHover: string
  warningSoft: string
  dangerBase: string
  dangerDark: string
  dangerHover: string
  dangerSoft: string
  infoBase: string
  infoDark: string
  infoHover: string
  infoSoft: string
}

export interface ComponentTokens {
  button: {
    borderRadius: string
    heightSm: string
    heightMd: string
    heightLg: string
  }
  dialog: {
    borderRadius: string
    overlayColor: string
  }
  input: {
    borderRadius: string
    heightSm: string
    heightMd: string
    heightLg: string
  }
}

export interface ThemeDefinition {
  seed: ThemeSeed
  palette: ThemePalette
  semantic: SemanticTokens
  components: ComponentTokens
}

export interface ThemeOverrides {
  semantic?: Partial<SemanticTokens>
  components?: Partial<{
    button: Partial<ComponentTokens['button']>
    dialog: Partial<ComponentTokens['dialog']>
    input: Partial<ComponentTokens['input']>
  }>
}
