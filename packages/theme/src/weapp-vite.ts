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
  const themeCss = () => renderWeappThemeCss(options.theme, { variables: options.variables })

  return {
    name: 'varo:weapp-theme',
    enforce: 'pre',
    transform(source, id) {
      const [pathname, query = ''] = id.split('?')
      if (resolve(pathname) !== appStylePath) {
        return
      }
      if (query.includes('weapp-vite-sidecar') || /(?:^|&)lang\.(?:js|ts|jsx|tsx)(?:&|$)/.test(query)) {
        return
      }

      return {
        code: `${source}\n${themeCss()}\n`,
        map: null,
      }
    },
    generateBundle: {
      order: 'post',
      handler(_outputOptions, bundle) {
        const appStyle = Object.values(bundle).find(output => output.type === 'asset' && output.fileName === 'app.wxss')
        if (!appStyle || appStyle.type !== 'asset') {
          return
        }

        const source = typeof appStyle.source === 'string'
          ? appStyle.source
          : new TextDecoder().decode(appStyle.source)
        const extra = themeCss()
        if (source.includes(extra)) {
          return
        }
        appStyle.source = `${source}\n${extra}\n`
      },
    },
  }
}
