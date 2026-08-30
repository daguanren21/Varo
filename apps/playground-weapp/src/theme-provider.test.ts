// @vitest-environment jsdom

import { createTheme } from '@varo-ui/theme/weapp'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import VThemeProvider from './components/ui/v-theme-provider.vue'

const tealTheme = createTheme({
  primary: '#08786f',
  success: '#15803d',
  warning: '#b76b00',
  error: '#c7372f',
  neutral: '#182433',
})
const violetTheme = createTheme({
  primary: '#7c3aed',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  neutral: '#1f1933',
})

describe('VThemeProvider', () => {
  it('reactively replaces inherited Weapp CSS variables', async () => {
    const wrapper = mount(VThemeProvider, {
      props: { theme: tealTheme },
      slots: { default: '<text>themed content</text>' },
    })

    expect(wrapper.attributes('style')).toContain('--varo-ui-primary: #08786f')
    expect(wrapper.text()).toContain('themed content')

    await wrapper.setProps({ theme: violetTheme })

    expect(wrapper.attributes('style')).toContain('--varo-ui-primary: #7c3aed')
    expect(wrapper.attributes('style')).toContain('--varo-ui-ring: rgb(124 58 237 / 16%)')
  })

  it('applies page-local variable overrides', () => {
    const wrapper = mount(VThemeProvider, {
      props: {
        theme: tealTheme,
        variables: { '--varo-ui-radius': '24px' },
      },
    })

    expect(wrapper.attributes('style')).toContain('--varo-ui-radius: 24px')
  })
})
