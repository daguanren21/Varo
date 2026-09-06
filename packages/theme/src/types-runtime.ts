import type { MaybeRefOrGetter } from 'vue'
import type { ThemeDefinition, ThemeOverrides } from './types'

export interface ThemeConfig {
  theme: MaybeRefOrGetter<ThemeDefinition>
  overrides?: MaybeRefOrGetter<ThemeOverrides | undefined>
  target?: HTMLElement
}
