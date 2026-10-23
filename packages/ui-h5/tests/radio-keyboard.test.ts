import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { VRadio, VRadioGroup } from '../src/radio'

enableAutoUnmount(afterEach)

describe('styled radio keyboard contract', () => {
  it('repairs tab stops after independently updated child choices', async () => {
    const choices = ref([{ value: 'a', disabled: false }, { value: 'b', disabled: false }])
    const Children = defineComponent({ setup: () => () => choices.value.map(choice => h(VRadio, { ...choice, key: choice.value })) })
    const wrapper = mount(VRadioGroup, { props: { value: 'a' }, slots: { default: () => h(Children) } })
    expect(wrapper.findAll('[role="radio"]').map(item => item.attributes('tabindex'))).toEqual(['0', '-1'])
    choices.value = [{ value: 'a', disabled: true }, { value: 'b', disabled: false }]
    await flushPromises()
    expect(wrapper.findAll('[role="radio"]').map(item => item.attributes('tabindex'))).toEqual(['-1', '0'])
    choices.value = [{ value: 'b', disabled: false }]
    await flushPromises()
    expect(wrapper.get('[role="radio"]').attributes('tabindex')).toBe('0')
    choices.value = [{ value: 'b', disabled: false }, { value: 'a', disabled: false }]
    await flushPromises()
    expect(wrapper.findAll('[role="radio"]').map(item => item.attributes('tabindex'))).toEqual(['-1', '0'])
  })

  it.each(['listener', 'capture'])('honors %s cancellation during arrow selection', async (boundary) => {
    let cancel = true
    const click = vi.fn((event: MouseEvent) => { if (cancel && boundary === 'listener') { event.preventDefault() } })
    const wrapper = mount(VRadioGroup, {
      props: { value: 'a' },
      attrs: { onClickCapture: (event: MouseEvent) => { if (cancel && boundary === 'capture') { event.preventDefault() } } },
      slots: { default: () => [h(VRadio, { value: 'a' }), h(VRadio, { value: 'b', onClick: click })] },
    })
    await wrapper.findAll('[role="radio"]')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(click).toHaveBeenCalledOnce()
    cancel = false
    await wrapper.findAll('[role="radio"]')[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:value')).toEqual([['b']])
    expect(wrapper.emitted('change')).toEqual([['b']])
    expect(click).toHaveBeenCalledTimes(2)
  })

  it('provides group semantics and a single tab stop, wraps focus and skips disabled options', async () => {
    const value = ref<string | number | boolean>('a')
    const wrapper = mount({
      setup: () => () => h(VRadioGroup, {
        'value': value.value,
        'onUpdate:value': (next: string | number | boolean) => { value.value = next },
      }, () => [
        h(VRadio, { value: 'a' }, () => 'A'),
        h(VRadio, { value: 'b', disabled: true }, () => 'B'),
        h(VRadio, { value: 'c' }, () => 'C'),
      ]),
    }, { attachTo: document.body })
    expect(wrapper.find('[role="radiogroup"]').exists()).toBe(true)
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map(item => item.attributes('tabindex'))).toEqual(['0', '-1', '-1'])
    await radios[0].trigger('keydown', { key: 'ArrowRight' })
    expect(value.value).toBe('c')
    expect(document.activeElement).toBe(radios[2].element)
    expect(radios.map(item => item.attributes('tabindex'))).toEqual(['-1', '-1', '0'])
    await radios[2].trigger('keydown', { key: 'ArrowDown' })
    expect(value.value).toBe('a')
    await radios[0].trigger('keydown', { key: 'ArrowUp' })
    expect(value.value).toBe('c')
  })

  it('starts with the first enabled tab stop and removes it when the group becomes disabled', async () => {
    const change = vi.fn()
    const wrapper = mount(VRadioGroup, {
      attrs: { onChange: change },
      slots: { default: () => [h(VRadio, { value: false, disabled: true }), h(VRadio, { value: 0 }), h(VRadio, { value: '' })] },
    })
    const radios = wrapper.findAll('[role="radio"]')
    expect(radios.map(item => item.attributes('tabindex'))).toEqual(['-1', '0', '-1'])
    await wrapper.setProps({ disabled: true })
    expect(radios.map(item => item.attributes('tabindex'))).toEqual(['-1', '-1', '-1'])
    await radios[1].trigger('keydown', { key: 'ArrowRight' })
    expect(change).not.toHaveBeenCalled()
    await wrapper.setProps({ disabled: false, value: '' })
    expect(radios.map(item => item.attributes('tabindex'))).toEqual(['-1', '-1', '0'])
  })

  it('ignores nested keyboard events and cancellation', async () => {
    const onChange = vi.fn()
    let cancelKey = false
    const wrapper = mount(VRadioGroup, {
      props: { value: 'a', onChange },
      attrs: { onKeydown: (event: KeyboardEvent) => { if (cancelKey) { event.preventDefault() } } },
      slots: { default: () => [
        h(VRadio, { value: 'a' }, () => h('span', { tabindex: 0 }, 'Nested')),
        h(VRadio, { value: 'b' }),
      ] },
    })
    await wrapper.get('[tabindex="0"] span[tabindex]').trigger('keydown', { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
    cancelKey = true
    await wrapper.findAll('[role="radio"]')[0].trigger('keydown', { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not re-emit standalone checked state but permits unchecked selection', async () => {
    const wrapper = mount(VRadio, { props: { value: false, checked: true } })
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:checked')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    await wrapper.setProps({ checked: false })
    await wrapper.trigger('click')
    expect(wrapper.emitted('update:checked')).toEqual([[true]])
    expect(wrapper.emitted('change')).toEqual([[false]])
  })
})
