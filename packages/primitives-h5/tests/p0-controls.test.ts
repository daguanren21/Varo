import { mount } from '@vue/test-utils'
import { defineComponent, h, type PropType } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import {
  CheckboxIndicator,
  CheckboxRoot,
  RadioGroup,
  RadioIndicator,
  RadioItem,
  SwitchRoot,
  SwitchThumb,
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger
} from '../src'

describe('primitives-h5 p0 controls', () => {
  it('composes checkbox root and indicator', async () => {
    const wrapper = mount(CheckboxRoot, {
      props: { defaultChecked: false },
      slots: {
        default: () => h(CheckboxIndicator, null, { default: () => 'check' })
      }
    })

    expect(wrapper.get('[role="checkbox"]').attributes('data-state')).toBe('unchecked')
    expect(wrapper.text()).toBe('')

    await wrapper.get('[role="checkbox"]').trigger('click')

    expect(wrapper.get('[role="checkbox"]').attributes('data-state')).toBe('checked')
    expect(wrapper.text()).toBe('check')
  })

  it('keeps checkbox controlled when checked is explicitly undefined', async () => {
    const onUpdateChecked = vi.fn()
    const wrapper = mount(CheckboxRoot, {
      props: {
        checked: undefined,
        'onUpdate:checked': onUpdateChecked
      },
      slots: {
        default: () => h(CheckboxIndicator, null, { default: () => 'check' })
      }
    })

    await wrapper.get('[role="checkbox"]').trigger('click')

    expect(onUpdateChecked).toHaveBeenCalledWith(true)
    expect(wrapper.get('[role="checkbox"]').attributes('data-state')).toBe('unchecked')
    expect(wrapper.text()).toBe('')
  })

  it('does not toggle checkbox when disabled on a non-button element or when default is prevented', async () => {
    const disabledClick = vi.fn()
    const disabled = mount(CheckboxRoot, {
      attrs: { onClick: disabledClick },
      props: { as: 'div', defaultChecked: false, disabled: true }
    })

    await disabled.get('[role="checkbox"]').trigger('click')

    expect(disabledClick).not.toHaveBeenCalled()
    expect(disabled.get('[role="checkbox"]').attributes('data-state')).toBe('unchecked')

    const prevented = mount(CheckboxRoot, {
      attrs: {
        onClick: (event: MouseEvent) => event.preventDefault()
      },
      props: { defaultChecked: false }
    })

    await prevented.get('[role="checkbox"]').trigger('click')

    expect(prevented.get('[role="checkbox"]').attributes('data-state')).toBe('unchecked')
  })

  it('composes radio group, item, and indicator', async () => {
    const onUpdateValue = vi.fn()
    const wrapper = mount(RadioGroup, {
      props: {
        value: 'h5',
        'onUpdate:value': onUpdateValue
      },
      slots: {
        default: () => [
          h(RadioItem, { value: 'h5' }, { default: () => h(RadioIndicator, null, { default: () => 'dot' }) }),
          h(RadioItem, { value: 'weapp' }, { default: () => 'Weapp' })
        ]
      }
    })

    expect(wrapper.findAll('[role="radio"]')[0].attributes('data-state')).toBe('checked')
    await wrapper.findAll('[role="radio"]')[1].trigger('click')
    expect(onUpdateValue).toHaveBeenCalledWith('weapp')
    expect(wrapper.findAll('[role="radio"]')[0].attributes('data-state')).toBe('checked')
  })

  it('keeps radio controlled when value is explicitly undefined', async () => {
    const onUpdateValue = vi.fn()
    const wrapper = mount(RadioGroup, {
      props: {
        value: undefined,
        'onUpdate:value': onUpdateValue
      },
      slots: {
        default: () => h(RadioItem, { value: 'h5' }, { default: () => 'H5' })
      }
    })

    await wrapper.get('[role="radio"]').trigger('click')

    expect(onUpdateValue).toHaveBeenCalledWith('h5')
    expect(wrapper.get('[role="radio"]').attributes('data-state')).toBe('unchecked')
  })

  it('does not select radio when disabled on a non-button element or when default is prevented', async () => {
    const disabledClick = vi.fn()
    const disabled = mount(RadioGroup, {
      slots: {
        default: () =>
          h(RadioItem, { as: 'div', disabled: true, value: 'h5', onClick: disabledClick }, { default: () => 'H5' })
      }
    })

    await disabled.get('[role="radio"]').trigger('click')

    expect(disabledClick).not.toHaveBeenCalled()
    expect(disabled.get('[role="radio"]').attributes('data-state')).toBe('unchecked')

    const prevented = mount(RadioGroup, {
      slots: {
        default: () =>
          h(
            RadioItem,
            { value: 'h5', onClick: (event: MouseEvent) => event.preventDefault() },
            { default: () => 'H5' }
          )
      }
    })

    await prevented.get('[role="radio"]').trigger('click')

    expect(prevented.get('[role="radio"]').attributes('data-state')).toBe('unchecked')
  })

  it('keeps radio indicator in sync when item value changes', async () => {
    const Harness = defineComponent({
      props: {
        itemValue: {
          type: String as PropType<string>,
          default: 'h5'
        }
      },
      setup(props) {
        return () =>
          h(RadioGroup, { value: 'weapp' }, {
            default: () =>
              h(RadioItem, { value: props.itemValue }, {
                default: () => h(RadioIndicator, null, { default: () => 'dot' })
              })
          })
      }
    })
    const wrapper = mount(Harness)

    expect(wrapper.text()).not.toContain('dot')

    await wrapper.setProps({ itemValue: 'weapp' })

    expect(wrapper.text()).toContain('dot')
  })

  it('composes switch root and thumb', async () => {
    const wrapper = mount(SwitchRoot, {
      props: { defaultChecked: false },
      slots: {
        default: () => h(SwitchThumb, null, { default: () => 'thumb' })
      }
    })

    expect(wrapper.get('[role="switch"]').attributes('data-state')).toBe('unchecked')
    expect(wrapper.get('[data-part="thumb"]').attributes('data-state')).toBe('unchecked')

    await wrapper.get('[role="switch"]').trigger('click')

    expect(wrapper.get('[role="switch"]').attributes('data-state')).toBe('checked')
    expect(wrapper.get('[data-part="thumb"]').attributes('data-state')).toBe('checked')
  })

  it('does not toggle switch when loading on a non-button element or when default is prevented', async () => {
    const loadingClick = vi.fn()
    const loading = mount(SwitchRoot, {
      attrs: { onClick: loadingClick },
      props: { as: 'div', defaultChecked: false, loading: true }
    })

    await loading.get('[role="switch"]').trigger('click')

    expect(loadingClick).not.toHaveBeenCalled()
    expect(loading.get('[role="switch"]').attributes('data-state')).toBe('unchecked')

    const prevented = mount(SwitchRoot, {
      attrs: {
        onClick: (event: MouseEvent) => event.preventDefault()
      },
      props: { defaultChecked: false }
    })

    await prevented.get('[role="switch"]').trigger('click')

    expect(prevented.get('[role="switch"]').attributes('data-state')).toBe('unchecked')
  })

  it('composes tabs root, list, trigger, and content', async () => {
    const Harness = defineComponent({
      setup() {
        return () =>
          h(TabsRoot, { defaultValue: 'docs' }, {
            default: () => [
              h(TabsList, null, {
                default: () => [
                  h(TabsTrigger, { value: 'docs' }, { default: () => 'Docs' }),
                  h(TabsTrigger, { value: 'api' }, { default: () => 'API' })
                ]
              }),
              h(TabsContent, { value: 'docs' }, { default: () => 'Docs panel' }),
              h(TabsContent, { value: 'api' }, { default: () => 'API panel' })
            ]
          })
      }
    })
    const wrapper = mount(Harness)

    expect(wrapper.text()).toContain('Docs panel')
    expect(wrapper.text()).not.toContain('API panel')

    await wrapper.findAll('[role="tab"]')[1].trigger('click')

    expect(wrapper.text()).not.toContain('Docs panel')
    expect(wrapper.text()).toContain('API panel')
    expect(wrapper.findAll('[role="tab"]')[1].attributes('data-state')).toBe('active')
  })

  it('does not select tabs when disabled on a non-button element or when default is prevented', async () => {
    const disabledClick = vi.fn()
    const DisabledHarness = defineComponent({
      setup() {
        return () =>
          h(TabsRoot, { defaultValue: 'docs' }, {
            default: () =>
              h(TabsTrigger, { as: 'div', disabled: true, value: 'api', onClick: disabledClick }, {
                default: () => 'API'
              })
          })
      }
    })
    const disabled = mount(DisabledHarness)

    await disabled.get('[role="tab"]').trigger('click')

    expect(disabledClick).not.toHaveBeenCalled()
    expect(disabled.get('[role="tab"]').attributes('data-state')).toBe('inactive')

    const PreventedHarness = defineComponent({
      setup() {
        return () =>
          h(TabsRoot, { defaultValue: 'docs' }, {
            default: () =>
              h(
                TabsTrigger,
                { value: 'api', onClick: (event: MouseEvent) => event.preventDefault() },
                { default: () => 'API' }
              )
          })
      }
    })
    const prevented = mount(PreventedHarness)

    await prevented.get('[role="tab"]').trigger('click')

    expect(prevented.get('[role="tab"]').attributes('data-state')).toBe('inactive')
  })
})
