export interface ThemeSeed {
  primary: string
  success: string
  warning: string
  error: string
  neutral: string
}

export interface ThemePalette {
  primary: Record<string, string>
  neutral: Record<string, string>
  success: Record<string, string>
  warning: Record<string, string>
  error: Record<string, string>
}

export interface SemanticTokens {
  textBase: string
  textMuted: string
  surfaceBase: string
  surfaceElevated: string
  borderBase: string
  borderStrong: string
  primaryBase: string
  primaryHover: string
  dangerBase: string
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
