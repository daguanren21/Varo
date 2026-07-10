import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValue
} from '../src/select'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { disabled: true, label: 'Cherry', value: 'cherry' }
]

const Harness = defineComponent({
  setup() {
    return () =>
      h(SelectRoot, { defaultValue: undefined, options }, {
        default: () => [
          h(SelectTrigger, null, {
            default: () => h(SelectValue, { placeholder: 'Pick fruit' })
          }),
          h(SelectContent, null, {
            default: () =>
              h(SelectGroup, null, {
                default: () => [
                  h(SelectLabel, null, { default: () => 'Fruit' }),
                  ...options.map((option) =>
                    h(SelectItem, { key: option.value, option }, { default: () => option.label })
                  )
                ]
              })
          })
        ]
      })
  }
})

describe('primitives-h5 select', () => {
  it('composes root, trigger, value, content, group, label, and item parts', async () => {
    const wrapper = mount(Harness)

    expect(wrapper.text()).toContain('Pick fruit')
    expect(wrapper.text()).not.toContain('Apple')

    await wrapper.get('button').trigger('click')
    expect(wrapper.text()).toContain('Fruit')
    expect(wrapper.get('[role="option"]').attributes('data-state')).toBe('unchecked')

    await wrapper.get('[role="option"]').trigger('click')
    expect(wrapper.text()).toContain('Apple')
    expect(wrapper.text()).not.toContain('Fruit')
  })

  it('emits controlled value changes without changing rendered value', async () => {
    const onUpdateValue = vi.fn()
    const wrapper = mount(SelectRoot, {
      props: {
        value: 'apple',
        options,
        'onUpdate:value': onUpdateValue
      },
      slots: {
        default: () => [
          h(SelectTrigger, null, { default: () => h(SelectValue) }),
          h(SelectContent, null, {
            default: () => options.map((option) => h(SelectItem, { option }, { default: () => option.label }))
          })
        ]
      }
    })

    await wrapper.get('button').trigger('click')
    await wrapper.findAll('[role="option"]')[1].trigger('click')

    expect(onUpdateValue).toHaveBeenCalledWith('banana')
    expect(wrapper.text()).toContain('Apple')
  })
})
