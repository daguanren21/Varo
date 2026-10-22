// @vitest-environment jsdom

import type { VaroRegionLoadContext, VaroRegionOption } from './components/ui/region-picker.types'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { nextTick, reactive } from 'vue'
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
    expect(wrapper.get('.varo-region-picker__breadcrumbs').text()).not.toContain('请选择')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')

    const updatedInputs = wrapper.findAll<HTMLInputElement>('input.varo-input__control')
    await updatedInputs[3]!.setValue('文三路 90 号')
    await wrapper.get<HTMLTextAreaElement>('textarea.varo-input__control').setValue('希望增加更多业务组件。')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="status"]').text()).toContain('已提交：Varo 用户 · 中国 / 浙江省 / 杭州市 / 西湖区')
    expect(wrapper.get('map').attributes('latitude')).toBe('30.259')
    expect(wrapper.get('map').attributes('longitude')).toBe('120.13')
    expect(wrapper.get('map').attributes('enable-scroll')).toBe('false')
    expect(wrapper.get('map').attributes('enable-zoom')).toBe('false')
    expect(wrapper.get('map').attributes('show-location')).toBe('false')
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
    expect(wrapper.get('map').attributes('show-location')).toBe('false')
    expect(wrapper.get('map').attributes('style')).toContain('max-width: 100vw')
    expect(wrapper.get('map').attributes('style')).toContain('max-height: 720px')
    expect(wrapper.get('map').attributes('style')).toContain('box-sizing: border-box')
    await wrapper.get('map').trigger('regionchange', { type: 'end' })
    expect(onRegionChange).toHaveBeenCalled()
  })
})

describe('native RegionPicker option reconciliation', () => {
  it.each(['b', 0, ''])('retains draft %j when an unrelated option changes or the tree is replaced', async (draft) => {
    const options = reactive([
      { label: 'A', value: 'a', disabled: false },
      { label: 'B', value: draft, disabled: false },
      { label: 'C', value: 'c', disabled: false },
    ])
    const wrapper = mount(VRegionPicker, { props: { options, modelValue: ['a'], visible: true } })
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    options[2].disabled = true
    await nextTick()
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    await wrapper.setProps({ options: [options[2], { label: 'B updated', value: draft }, options[0]] })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B updated')
    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[[draft]]])
    expect(wrapper.emitted('confirm')?.[0]?.[0]).toMatchObject({ labels: ['B updated'], path: [draft] })
    wrapper.unmount()
  })

  it('preserves breadcrumb navigation and truncates removed draft nodes at the missing level', async () => {
    const options = reactive<VaroRegionOption[]>([
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b', children: [{ label: 'One', value: 1 }, { label: 'Two', value: 2 }] },
      { label: 'C', value: 'c', disabled: false },
    ])
    const wrapper = mount(VRegionPicker, { props: { options, modelValue: ['a'], visible: true } })
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    await wrapper.findAll('.varo-region-picker__option')[0].trigger('click')
    await wrapper.get('.varo-region-picker__breadcrumbs button').trigger('click')
    options[2].disabled = true
    await nextTick()
    expect(wrapper.findAll('.varo-region-picker__option').map(option => option.text())).toEqual(['A', 'B', 'C'])
    expect(wrapper.findAll('.varo-region-picker__breadcrumbs button').map(button => button.text())).toEqual(['B', 'One'])
    options[1].children!.splice(0, 1)
    await nextTick()
    const breadcrumbs = wrapper.findAll('.varo-region-picker__breadcrumbs button')
    expect(breadcrumbs[0].text()).toBe('B')
    expect(breadcrumbs).toHaveLength(2)
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
    await breadcrumbs[1].trigger('click')
    expect(wrapper.get('.varo-region-picker__option').text()).toBe('Two')
    await wrapper.get('.varo-region-picker__option').trigger('click')
    options.splice(1, 1)
    await nextTick()
    expect(wrapper.find('.varo-region-picker__option[data-selected="true"]').exists()).toBe(false)
    const confirm = wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm')
    expect(confirm.element.disabled).toBe(true)
    confirm.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('confirm')).toBeUndefined()
    expect(wrapper.emitted('change')).toHaveLength(3)
    wrapper.unmount()
  })

  it('resets on parent changes and reopening while cancellation never commits', async () => {
    const modelValue = reactive(['a'])
    const options = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }]
    const wrapper = mount(VRegionPicker, { props: { options, modelValue, visible: true } })
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    modelValue[0] = 'c'
    await nextTick()
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('C')
    await wrapper.setProps({ modelValue: ['a'], options: [...options] })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('A')
    await wrapper.findAll('.varo-region-picker__option')[1].trigger('click')
    await wrapper.get('.varo-region-picker__cancel').trigger('click')
    expect(wrapper.emitted('close')).toEqual([[]])
    expect(wrapper.emitted('update:visible')).toEqual([[false]])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.setProps({ visible: false })
    await wrapper.setProps({ visible: true })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('A')
    await wrapper.setProps({ modelValue: [] })
    expect(wrapper.find('.varo-region-picker__option[data-selected="true"]').exists()).toBe(false)
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
    wrapper.unmount()
  })

  it('resolves late parent options until the user edits without resurrecting an invalidated draft', async () => {
    const options = [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]
    const wrapper = mount(VRegionPicker, { props: { options: [], modelValue: ['b'], visible: true } })
    await wrapper.setProps({ options })
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    await wrapper.findAll('.varo-region-picker__option')[0].trigger('click')
    await wrapper.setProps({ options: [] })
    await wrapper.setProps({ options })
    expect(wrapper.find('.varo-region-picker__option[data-selected="true"]').exists()).toBe(false)
    expect(wrapper.get<HTMLButtonElement>('.varo-region-picker__confirm').element.disabled).toBe(true)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })

  it('retains shortcut drafts through option mutation', async () => {
    const options = reactive([
      { label: 'A', value: 'a', disabled: false },
      { label: 'B', value: 'b', disabled: false },
    ])
    const wrapper = mount(VRegionPicker, {
      props: { options, modelValue: ['a'], shortcuts: [{ label: 'Choose B', path: ['b'] }], visible: true },
    })
    await wrapper.get('.varo-region-picker__shortcuts button').trigger('click')
    options[0].disabled = true
    await nextTick()
    expect(wrapper.get('.varo-region-picker__option[data-selected="true"]').text()).toBe('B')
    await wrapper.get('.varo-region-picker__confirm').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toEqual([[['b']]])
    expect(wrapper.emitted('change')).toHaveLength(1)
    wrapper.unmount()
  })
})
