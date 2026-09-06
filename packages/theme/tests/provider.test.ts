import type { ThemeDefinition } from '../src/types'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, shallowRef } from 'vue'
import { createThemeCssVariables } from '../src/css'
import {
  useVaroTheme,
  VaroConfigProvider,
  VaroThemeProvider,
} from '../src/provider'
import { createTheme } from '../src/theme'

const brandTheme = createTheme({
  primary: '#07c160',
  success: '#13b248',
  warning: '#fa9200',
  error: '#eb3437',
  neutral: '#303133',
  info: '#73767a',
})
const blueTheme = createTheme({
  primary: '#2563eb',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  neutral: '#0f172a',
  info: '#475569',
})
const variableNames = Object.keys(createThemeCssVariables(brandTheme))

function removeDocumentTheme(): void {
  for (const name of variableNames) {
    document.documentElement.style.removeProperty(name)
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  removeDocumentTheme()
})

describe('Varo theme providers', () => {
  it('applies reactive app themes and restores document ownership on unmount', async () => {
    const activeTheme = shallowRef<ThemeDefinition>(blueTheme)
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({ render: () => h('div', 'App') })
    app.use(VaroConfigProvider, {
      theme: activeTheme,
      overrides: {
        components: {
          button: {
            borderRadius: '24px',
            heightMd: '56px',
          },
        },
      },
    })
    app.mount(host)
    const rootStyle = document.documentElement.style
    expect(rootStyle.getPropertyValue('--varo-ui-primary')).toBe('#2563eb')
    expect(rootStyle.getPropertyValue('--varo-ui-button-radius')).toBe('24px')
    expect(rootStyle.getPropertyValue('--varo-ui-button-height-md')).toBe('56px')
    activeTheme.value = brandTheme
    await nextTick()
    expect(rootStyle.getPropertyValue('--varo-ui-primary')).toBe('#07c160')
    app.unmount()
    expect(rootStyle.getPropertyValue('--varo-ui-primary')).toBe('')
    expect(rootStyle.getPropertyValue('--varo-ui-button-height-md')).toBe('')
    host.remove()
  })

  it('keeps multiple app theme owners isolated by stack order', async () => {
    const firstTheme = shallowRef<ThemeDefinition>(blueTheme)
    const firstHost = document.createElement('div')
    const secondHost = document.createElement('div')
    document.body.append(firstHost, secondHost)
    const firstApp = createApp({ render: () => h('div', 'First') })
    const secondApp = createApp({ render: () => h('div', 'Second') })
    firstApp.use(VaroConfigProvider, { theme: firstTheme })
    secondApp.use(VaroConfigProvider, { theme: brandTheme })
    firstApp.mount(firstHost)
    secondApp.mount(secondHost)
    const rootStyle = document.documentElement.style
    expect(rootStyle.getPropertyValue('--varo-ui-primary')).toBe('#07c160')
    firstTheme.value = createTheme({
      primary: '#fef08a',
      success: '#13b248',
      warning: '#fa9200',
      error: '#eb3437',
      neutral: '#303133',
    })
    await nextTick()
    expect(rootStyle.getPropertyValue('--varo-ui-primary')).toBe('#07c160')
    secondApp.unmount()
    expect(rootStyle.getPropertyValue('--varo-ui-primary')).toBe('#fef08a')
    firstApp.unmount()
    expect(rootStyle.getPropertyValue('--varo-ui-primary')).toBe('')
    firstHost.remove()
    secondHost.remove()
  })
  it('reacts to scoped theme prop changes in both CSS variables and injected theme state', async () => {
    const activeTheme = shallowRef<ThemeDefinition>(brandTheme)
    const ThemeConsumer = defineComponent({
      setup() {
        const theme = useVaroTheme()
        return () => h('output', theme.value.semantic.primaryBase)
      },
    })
    const Harness = defineComponent({
      setup() {
        return () =>
          h(
            VaroThemeProvider,
            {
              'data-testid': 'theme-root',
              'theme': activeTheme.value,
            },
            { default: () => h(ThemeConsumer) },
          )
      },
    })
    const wrapper = mount(Harness)
    const root = wrapper.get<HTMLElement>('[data-testid="theme-root"]')

    expect(root.element.style.getPropertyValue('--varo-ui-primary')).toBe('#07c160')
    expect(wrapper.get('output').text()).toBe('#07c160')

    activeTheme.value = blueTheme
    await nextTick()

    expect(root.element.style.getPropertyValue('--varo-ui-primary')).toBe('#2563eb')
    expect(wrapper.get('output').text()).toBe('#2563eb')
  })

  it('imports and installs without a browser document', async () => {
    vi.resetModules()
    vi.stubGlobal('document', undefined)
    // Reload after removing the DOM global to exercise the SSR import boundary.
    const { VaroConfigProvider: ssrProvider } = await import('../src/provider')
    const app = createApp({ render: () => null })

    expect(() => app.use(ssrProvider, { theme: blueTheme })).not.toThrow()
  })
})
