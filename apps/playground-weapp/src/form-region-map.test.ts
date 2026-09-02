// @vitest-environment jsdom

import type { VaroRegionLoadContext } from './components/ui/region-picker.types'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import FormRegionMapDemo from './components/demos/FormRegionMapDemo.vue'
import VMap from './components/ui/v-map.vue'
import VRegionPicker from './components/ui/v-region-picker.vue'

describe('standalone Varo Form region and map demo', () => {
  it('validates fields, selects a region, and submits business data', async () => {
    const wrapper = mount(FormRegionMapDemo)

    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.get('[role="status"]').text()).toContain('昵称')
    expect(wrapper.findAll('.varo-form-item__error').length).toBeGreaterThan(0)

    const inputs = wrapper.findAll<HTMLInputElement>('input.varo-input__control')
    await inputs[0]!.setValue('Varo 用户')
    await inputs[1]!.setValue('13800138000')
    await inputs[2]!.setValue('team@varo.dev')

    await wrapper.findAll('button').find(button => button.text().includes('请选择活动区域'))!.trigger('click')
    const option = (label: string) => wrapper.findAll('.varo-region-picker__option').find(item => item.text().includes(label))!
    await option('中国').trigger('click')
    await option('浙江省').trigger('click')
    await option('杭州市').trigger('click')
    await option('西湖区').trigger('click')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')

    const updatedInputs = wrapper.findAll<HTMLInputElement>('input.varo-input__control')
    await updatedInputs[3]!.setValue('文三路 90 号')
    await wrapper.get<HTMLTextAreaElement>('textarea.varo-input__control').setValue('希望增加更多业务组件。')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="status"]').text()).toContain('已提交：Varo 用户 · 中国 / 浙江省 / 杭州市 / 西湖区')
    expect(wrapper.get('map').attributes('latitude')).toBe('30.259')
    expect(wrapper.get('map').attributes('longitude')).toBe('120.13')
  })

  it('loads RegionPicker levels dynamically and retries failed requests', async () => {
    let attempt = 0
    const loadChildren = vi.fn(async (_context: VaroRegionLoadContext) => {
      attempt += 1
      if (attempt === 1) {
        return [{ label: '中国', value: 'cn', hasChildren: true }]
      }
      if (attempt === 2) {
        throw new Error('network')
      }
      return [{ label: '浙江省', value: 'zhejiang' }]
    })
    const wrapper = mount(VRegionPicker, {
      props: {
        loadChildren,
        options: [],
        visible: true,
      },
    })

    await flushPromises()
    expect(loadChildren).toHaveBeenNthCalledWith(1, { level: 0, path: [] })
    await wrapper.get('.varo-region-picker__option').trigger('click')
    await flushPromises()
    expect(loadChildren.mock.calls[1]?.[0]).toMatchObject({ level: 1, path: ['cn'] })
    expect(wrapper.get('[role="alert"]').text()).toContain('地区加载失败')

    await wrapper.get('.varo-region-picker__retry').trigger('click')
    await flushPromises()
    expect(wrapper.get('.varo-region-picker__option').text()).toContain('浙江省')
    await wrapper.get('.varo-region-picker__option').trigger('click')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('confirm')?.[0]?.[0]).toMatchObject({ path: ['cn', 'zhejiang'] })
    expect(wrapper.emitted('loadError')).toHaveLength(1)
    expect(wrapper.emitted('loadSuccess')).toHaveLength(2)
  })

  it('forwards native map events with typed props', async () => {
    const onRegionChange = vi.fn()
    const wrapper = mount(VMap, {
      props: {
        mapId: 'testMap',
        latitude: 30.274,
        longitude: 120.155,
        onRegionChange,
      },
    })

    expect(wrapper.get('map').attributes()).toMatchObject({
      id: 'testMap',
      latitude: '30.274',
      longitude: '120.155',
    })
    await wrapper.get('map').trigger('regionchange', { type: 'end' })
    expect(onRegionChange).toHaveBeenCalled()
  })
})
