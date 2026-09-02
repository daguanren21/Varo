import type { ThemeConfig } from '@varo-ui/theme'
import type { Plugin } from 'vue'
import { createTheme, VaroConfigProvider } from '@varo-ui/theme'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

async function settleRequest() {
  await vi.advanceTimersByTimeAsync(320)
  await flushPromises()
}

describe('RegionPickerDemo', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('loads every hierarchy level, exposes failure, retries, and confirms coordinates', async () => {
    const wrapper = mount(RegionPickerDemo, { global: { plugins: [themePlugin] } })
    const option = (label: string) => wrapper.findAll('.varo-region-picker__option').find(item => item.text().includes(label))!

    await wrapper.get('.region-demo > header button').trigger('click')
    expect(wrapper.get('[role="dialog"]').attributes('aria-labelledby')).toContain('varo-region-picker-')
    expect(wrapper.get('.varo-region-picker__state').text()).toContain('加载中')
    expect(wrapper.get('.region-demo__request').attributes('data-state')).toBe('loading')
    await settleRequest()

    await option('中国').trigger('click')
    expect(wrapper.get('.region-demo__request code').text()).toContain('parent=cn')
    await settleRequest()
    await option('浙江省').trigger('click')
    await settleRequest()

    expect(wrapper.get('.region-demo__request').attributes('data-state')).toBe('error')
    expect(wrapper.get('[role="alert"]').text()).toContain('地区服务暂时不可用')
    expect(wrapper.get('.varo-region-picker__retry').text()).toBe('重新请求')
    await wrapper.get('.varo-region-picker__retry').trigger('click')
    await settleRequest()

    await option('杭州市').trigger('click')
    await settleRequest()
    await option('西湖区').trigger('click')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')

    expect(wrapper.text()).toContain('中国 / 浙江省 / 杭州市 / 西湖区')
    expect(wrapper.get('output').text()).toContain('30.259')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.get('.region-demo__request').text()).toContain('第 5 次请求')
  })

  it('can dismiss while a root request is pending', async () => {
    const wrapper = mount(RegionPickerDemo, { global: { plugins: [themePlugin] } })
    await wrapper.get('.region-demo > header button').trigger('click')
    expect(wrapper.get('.varo-region-picker__options').attributes('aria-busy')).toBe('true')
    await wrapper.get('.varo-region-picker').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    await settleRequest()
    expect(wrapper.get('.region-demo__request').attributes('data-state')).toBe('success')
  })
})
