import type { Plugin } from 'vite'
import type { ThemeCssVariableOverrides } from './css.ts'
import type { ThemeDefinition } from './types.ts'
import { resolve } from 'node:path'
import { renderWeappThemeCss } from './weapp.ts'

export interface VaroWeappThemePluginOptions {
  appStyle: string
  theme: ThemeDefinition
  variables?: ThemeCssVariableOverrides
}

export function createVaroWeappThemePlugin(options: VaroWeappThemePluginOptions): Plugin {
  const appStylePath = resolve(options.appStyle)

  return {
    name: 'varo:weapp-theme',
    enforce: 'pre',
    transform(source, id) {
      if (resolve(id.split('?')[0]) !== appStylePath) {
        return
      }

      return {
        code: `${source}\n${renderWeappThemeCss(options.theme, { variables: options.variables })}\n`,
        map: null,
      }
    },
  }
}
