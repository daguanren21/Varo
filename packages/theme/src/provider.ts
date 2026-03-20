import { computed, inject, provide, type App, type InjectionKey } from 'vue'
import { createTheme } from './theme'
import type { ThemeDefinition } from './types'
import type { ThemeConfig } from './types-runtime'

const ThemeKey: InjectionKey<ThemeConfig> = Symbol('varo-theme')

export function provideVaroTheme(config: ThemeConfig) {
  provide(ThemeKey, config)
}

export function useVaroTheme() {
  const config = inject(ThemeKey)

  if (!config) {
    return computed<ThemeDefinition>(() =>
      createTheme({
        primary: '#2563eb',
        success: '#16a34a',
        warning: '#d97706',
        error: '#dc2626',
        neutral: '#0f172a'
      })
    )
  }

  return computed(() => config.theme)
}

export const VaroConfigProvider = {
  install(app: App, config: ThemeConfig) {
    app.provide(ThemeKey, config)
  }
}
