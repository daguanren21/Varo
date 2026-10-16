import type { ThemeDefinition } from '@varo-ui/theme/weapp'
import type { ComputedRef, ShallowRef } from 'wevu'
import { createTheme } from '@varo-ui/theme/weapp'
import { computed, onLoad, shallowRef } from 'wevu'

export interface DocsDemoContext {
  component: ShallowRef<string>
  locale: ShallowRef<'zh' | 'en'>
  en: ComputedRef<boolean>
  theme: ComputedRef<ThemeDefinition>
}

export function useDocsDemo(fallback: string): DocsDemoContext {
  const component = shallowRef(fallback)
  const locale = shallowRef<'zh' | 'en'>('zh')
  const mode = shallowRef<'light' | 'dark'>('light')
  function applyOptions(options: Record<string, unknown> = {}) {
    component.value = typeof options.component === 'string' ? options.component : fallback
    locale.value = options.locale === 'en' ? 'en' : 'zh'
    mode.value = options.theme === 'dark' ? 'dark' : 'light'
  }
  const pages = getCurrentPages()
  applyOptions(pages.at(-1)?.options)
  onLoad(applyOptions)
  const en = computed(() => locale.value === 'en')
  const theme = computed(() => createTheme({
    primary: '#07c160',
    success: '#13b248',
    warning: '#fa9200',
    error: '#eb3437',
    neutral: '#303133',
    info: '#73767a',
    mode: mode.value,
  }))
  return { component, locale, en, theme }
}
