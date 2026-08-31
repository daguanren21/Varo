import type { App, InjectionKey, Plugin } from 'vue'
import type { ThemeDefinition } from './types'
import type { ThemeConfig } from './types-runtime'
import { computed, inject, provide } from 'vue'
import { createTheme } from './theme'

const ThemeKey: InjectionKey<ThemeConfig> = Symbol('varo-theme')

export function provideVaroTheme(config: ThemeConfig) {
  provide(ThemeKey, config)
}

export function useVaroTheme() {
  const config = inject(ThemeKey, undefined)

  if (!config) {
    return computed<ThemeDefinition>(() =>
      createTheme({
        primary: '#07c160',
        success: '#13b248',
        warning: '#fa9200',
        error: '#eb3437',
        neutral: '#303133',
        info: '#73767a',
      }),
    )
  }

  return computed(() => config.theme)
}

export const VaroConfigProvider = {
  install(app: App, config?: ThemeConfig) {
    if (!config) { throw new Error('VaroConfigProvider requires a theme configuration.') }
    app.provide(ThemeKey, config)
  },
} satisfies Plugin
