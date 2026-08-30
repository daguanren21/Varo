import type { ThemeConfig } from '@varo-ui/theme'
import type { Plugin } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ExtendedComponentDemo from './ExtendedComponentDemo.vue'

const themeConfig: ThemeConfig = {
  theme: createTheme({
    primary: '#0f766e',
    success: '#16824c',
    warning: '#a85d00',
    error: '#bd3f38',
    neutral: '#1b2430',
  }),
}
const themePlugin: [Plugin, ThemeConfig] = [VaroConfigProvider, themeConfig]

const examples = [
  'action-sheet',
  'avatar',
  'badge',
  'card',
  'collapse',
  'empty',
  'icon',
  'list',
  'notice-bar',
  'popover',
  'progress',
  'safe-area',
  'skeleton',
  'steps',
  'swipe-cell',
  'tag',
] as const

function mountDemo(example: typeof examples[number]) {
  return mount(ExtendedComponentDemo, {
    global: {
      plugins: [themePlugin],
    },
    props: {
      example,
      locale: 'zh',
    },
  })
}

describe('ExtendedComponentDemo', () => {
  it('renders every public component missing from the former docs catalog', async () => {
    for (const example of examples) {
      const wrapper = mountDemo(example)
      expect(wrapper.get('.extended-demo__preview').element.childElementCount, example).toBeGreaterThan(0)
      expect(wrapper.findAll('.demo-code-panel__tab'), example).toHaveLength(2)
      await wrapper.get('.demo-code-panel__toggle').trigger('click')
      expect(wrapper.get('.demo-code-panel__body code').text(), example).toContain('@varo-ui/h5')
      wrapper.unmount()
    }
  })

  it('switches the rendered runtime and its code together', async () => {
    const wrapper = mountDemo('avatar')
    const runtimeTabs = wrapper.findAll('.demo-segmented__item')

    expect(wrapper.findAll('.varo-avatar')).toHaveLength(6)
    expect(runtimeTabs[0]!.attributes('data-active')).toBe('true')

    await runtimeTabs[1]!.trigger('click')
    await wrapper.get('.demo-code-panel__toggle').trigger('click')

    expect(runtimeTabs[1]!.attributes('data-active')).toBe('true')
    expect(wrapper.get('.demo-code-panel__body code').text()).toContain('@varo-ui/weapp')
  })

  it('keeps destructive action sheets closed until explicitly triggered', async () => {
    const wrapper = mountDemo('action-sheet')

    expect(wrapper.find('.varo-action-sheet').exists()).toBe(false)
    await wrapper.get('.extended-demo__trigger').trigger('click')
    expect(wrapper.find('.varo-action-sheet').exists()).toBe(true)
  })
})
