import type { ThemeCssVariableOverrides, ThemeCssVariables } from './css.ts'
import type { ThemeDefinition } from './types.ts'
import { createThemeCssVariables, renderThemeCssVariables } from './css.ts'

export interface WeappThemeCssOptions {
  variables?: ThemeCssVariableOverrides
}

export function createWeappThemeStyle(
  theme: ThemeDefinition,
  options: WeappThemeCssOptions = {},
): ThemeCssVariables {
  return createThemeCssVariables(theme, options.variables)
}

export function renderWeappThemeCss(
  theme: ThemeDefinition,
  options: WeappThemeCssOptions = {},
): string {
  return renderThemeCssVariables('page', createWeappThemeStyle(theme, options))
}

export type { ThemeCssVariableOverrides, ThemeCssVariables } from './css.ts'
export { createTheme, mergeThemeOverrides } from './theme.ts'
export type { ThemeDefinition } from './types.ts'
