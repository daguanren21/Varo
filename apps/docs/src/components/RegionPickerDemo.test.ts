import type { ThemeConfig } from '@varo-ui/theme'
import type { Plugin } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import RegionPickerDemo from './RegionPickerDemo.vue'

const themeConfig: ThemeConfig = {
  theme: createTheme({
    primary: '#07c160',
    success: '#13b248',
    warning: '#fa9200',
    error: '#eb3437',
    neutral: '#303133',
  }),
}
const themePlugin: [Plugin, ThemeConfig] = [VaroConfigProvider, themeConfig]

describe('RegionPickerDemo', () => {
  it('navigates hierarchy and confirms labels with coordinates', async () => {
    const wrapper = mount(RegionPickerDemo, { global: { plugins: [themePlugin] } })
    await wrapper.get('button').trigger('click')
    expect(wrapper.get('[role="dialog"]').attributes('aria-labelledby')).toContain('varo-region-picker-')
    expect(wrapper.get('[role="dialog"]').attributes('aria-label')).toBeUndefined()
    const option = (label: string) => wrapper.findAll('.varo-region-picker__option').find(item => item.text().includes(label))!
    await option('中国').trigger('click')
    await option('浙江省').trigger('click')
    await option('杭州市').trigger('click')
    await option('西湖区').trigger('click')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')

    expect(wrapper.text()).toContain('中国 / 浙江省 / 杭州市 / 西湖区')
    expect(wrapper.get('output').text()).toContain('30.259')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('supports shortcuts and Escape dismissal', async () => {
    const wrapper = mount(RegionPickerDemo, { global: { plugins: [themePlugin] } })
    await wrapper.get('button').trigger('click')
    await wrapper.findAll('.varo-region-picker__shortcuts button')[1]!.trigger('click')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.text()).toContain('中国 / 上海市 / 浦东新区')

    await wrapper.get('button').trigger('click')
    await wrapper.get('.varo-region-picker').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })
})
