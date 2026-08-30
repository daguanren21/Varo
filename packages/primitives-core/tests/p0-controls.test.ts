import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useCheckboxRoot } from '../src/checkbox'
import { useImageRoot } from '../src/image'
import { useNumberFieldRoot } from '../src/number-field'
import { useRadioGroup } from '../src/radio'
import { useSwitchRoot } from '../src/switch'
import { getTabsNavigationIndex, useTabsRoot } from '../src/tabs'

describe('p0 control primitives', () => {
  it('toggles checkbox state with controlled and uncontrolled contracts', () => {
    const uncontrolled = useCheckboxRoot({ defaultChecked: false })

    expect(uncontrolled.state.checked.value).toBe(false)
    expect(uncontrolled.attrs.root['data-state']).toBe('unchecked')

    uncontrolled.events.toggle()

    expect(uncontrolled.state.checked.value).toBe(true)
    expect(uncontrolled.attrs.root['data-state']).toBe('checked')

    const checked = ref<boolean | undefined>(false)
    const onCheckedChange = vi.fn()
    const controlled = useCheckboxRoot({ checked, onCheckedChange })

    controlled.events.toggle()

    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(controlled.state.checked.value).toBe(false)
  })

  it('selects radio items through a group contract', () => {
    const value = ref<string | undefined>('h5')
    const onValueChange = vi.fn()
    const group = useRadioGroup({ value, onValueChange })

    expect(group.api.getItemAttrs('h5')).toMatchObject({
      'aria-checked': true,
      'data-state': 'checked',
      'role': 'radio',
    })
    expect(group.api.getItemAttrs('weapp')).toMatchObject({
      'aria-checked': false,
      'data-state': 'unchecked',
    })

    group.events.select('weapp')

    expect(onValueChange).toHaveBeenCalledWith('weapp')
    expect(group.state.value.value).toBe('h5')
  })

  it('toggles switch state and exposes thumb state attributes', () => {
    const root = useSwitchRoot({ defaultChecked: false })

    expect(root.attrs.root).toMatchObject({
      'aria-checked': false,
      'data-state': 'unchecked',
      'role': 'switch',
    })
    expect(root.attrs.thumb['data-state']).toBe('unchecked')

    root.events.toggle()

    expect(root.state.checked.value).toBe(true)
    expect(root.attrs.thumb['data-state']).toBe('checked')
  })

  it('normalizes number fields and exposes bounded increment actions', () => {
    const onValueChange = vi.fn()
    const value = ref<number | undefined>(1.2)
    const numberField = useNumberFieldRoot({
      max: ref(2),
      min: ref(0),
      onValueChange,
      precision: ref(1),
      step: ref(0.5),
      value,
    })

    expect(numberField.state.value.value).toBe(1.2)
    expect(numberField.state.canIncrease.value).toBe(true)
    expect(numberField.attrs.input['aria-valuenow']).toBe(1.2)

    numberField.events.increment()
    expect(onValueChange).toHaveBeenCalledWith(1.7)
    expect(numberField.state.value.value).toBe(1.2)

    value.value = 2
    expect(numberField.state.canIncrease.value).toBe(false)
    expect(numberField.events.increment()).toBe(false)
    expect(numberField.api.normalize(Number.NaN)).toBe(2)
  })

  it('tracks image loading, failure, and source resets', () => {
    const src = ref<string | undefined>('product.webp')
    const image = useImageRoot({ src })

    expect(image.state.loading.value).toBe(true)
    image.events.error()
    expect(image.state.failed.value).toBe(true)
    expect(image.state.loading.value).toBe(false)

    src.value = 'replacement.webp'
    image.api.reset()
    expect(image.state.failed.value).toBe(false)
    expect(image.state.loading.value).toBe(true)

    image.events.load()
    expect(image.state.loading.value).toBe(false)
  })

  it('selects tabs and marks triggers and content with active state', () => {
    const tabs = useTabsRoot({ defaultValue: 'docs' })

    expect(tabs.api.getTriggerAttrs('docs')).toMatchObject({
      'aria-selected': true,
      'data-state': 'active',
      'role': 'tab',
    })
    expect(tabs.api.getContentAttrs('api')).toMatchObject({
      'data-state': 'inactive',
      'role': 'tabpanel',
    })

    tabs.events.select('api')

    expect(tabs.state.value.value).toBe('api')
    expect(tabs.api.getContentAttrs('api')['data-state']).toBe('active')
  })

  it('links tabs and panels with unique lossless ids', () => {
    const first = useTabsRoot({ defaultValue: 'a b', id: 'settings' })
    const second = useTabsRoot({ defaultValue: 'a b', id: 'secondary' })
    const firstTrigger = first.api.getTriggerAttrs('a b')
    const firstPanel = first.api.getContentAttrs('a b')

    expect(firstTrigger).toMatchObject({
      'id': 'varo-tabs-settings-trigger-s-a%20b',
      'aria-controls': 'varo-tabs-settings-content-s-a%20b',
      'tabindex': 0,
    })
    expect(firstPanel).toMatchObject({
      'id': 'varo-tabs-settings-content-s-a%20b',
      'aria-labelledby': 'varo-tabs-settings-trigger-s-a%20b',
    })
    expect(first.api.getTriggerAttrs('a@b').id).not.toBe(firstTrigger.id)
    expect(first.api.getTriggerAttrs(1).id).not.toBe(first.api.getTriggerAttrs('1').id)
    expect(second.api.getTriggerAttrs('a b').id).not.toBe(firstTrigger.id)
    expect(first.api.getTriggerAttrs('disabled', true).tabindex).toBe(-1)
  })

  it('maps orientation keys to wrapped navigation indexes', () => {
    expect(
      getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'ArrowRight', orientation: 'horizontal' }),
    ).toBe(1)
    expect(
      getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'ArrowLeft', orientation: 'horizontal' }),
    ).toBe(2)
    expect(
      getTabsNavigationIndex({ currentIndex: 1, itemCount: 3, key: 'ArrowDown', orientation: 'vertical' }),
    ).toBe(2)
    expect(
      getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'ArrowUp', orientation: 'vertical' }),
    ).toBe(2)
    expect(
      getTabsNavigationIndex({ currentIndex: 2, itemCount: 3, key: 'Home', orientation: 'horizontal' }),
    ).toBe(0)
    expect(
      getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'End', orientation: 'vertical' }),
    ).toBe(2)
    expect(
      getTabsNavigationIndex({ currentIndex: 0, itemCount: 3, key: 'ArrowDown', orientation: 'horizontal' }),
    ).toBeUndefined()
    expect(
      getTabsNavigationIndex({ currentIndex: -1, itemCount: 3, key: 'Home', orientation: 'horizontal' }),
    ).toBeUndefined()
    expect(
      getTabsNavigationIndex({ currentIndex: 0, itemCount: 0, key: 'End', orientation: 'horizontal' }),
    ).toBeUndefined()
  })

  it('exposes the selected orientation on the tablist', () => {
    const tabs = useTabsRoot({ orientation: 'vertical' })

    expect(tabs.state.orientation.value).toBe('vertical')
    expect(tabs.attrs.list['aria-orientation']).toBe('vertical')
  })
})
