import type { PrimitiveExampleName } from './primitiveExamples'
import * as WeappPrimitives from '@varo-ui/weapp/primitives'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import PrimitiveExample from './PrimitiveExample.vue'
import PrimitiveExamplePreview from './PrimitiveExamplePreview.vue'

const wrappers: Array<ReturnType<typeof mount>> = []
function mountPreview(name: PrimitiveExampleName, platform: 'h5' | 'weapp' = 'h5') {
  const wrapper = mount(PrimitiveExamplePreview, { props: { name, platform } })
  wrappers.push(wrapper)
  return wrapper
}

const weappPrimitiveRoots = {
  'accordion': WeappPrimitives.AccordionRoot,
  'button': WeappPrimitives.ButtonRoot,
  'cell': WeappPrimitives.CellGroupRoot,
  'checkbox': WeappPrimitives.CheckboxRoot,
  'collapsible': WeappPrimitives.CollapsibleRoot,
  'dialog': WeappPrimitives.DialogRoot,
  'image': WeappPrimitives.ImageRoot,
  'input': WeappPrimitives.InputRoot,
  'number-field': WeappPrimitives.NumberFieldRoot,
  'overlay': WeappPrimitives.OverlayRoot,
  'popover': WeappPrimitives.PopoverRoot,
  'popup': WeappPrimitives.PopupRoot,
  'radio-group': WeappPrimitives.RadioGroup,
  'select': WeappPrimitives.SelectRoot,
  'sticky': WeappPrimitives.StickyRoot,
  'switch': WeappPrimitives.SwitchRoot,
  'tabs': WeappPrimitives.TabsRoot,
} satisfies Record<PrimitiveExampleName, object>

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
})

describe('foundational primitive previews', () => {
  it('renders every documented public primitive in both runtimes', async () => {
    const names = [
      'button',
      'input',
      'number-field',
      'image',
      'cell',
      'sticky',
      'checkbox',
      'radio-group',
      'switch',
      'tabs',
      'select',
      'collapsible',
      'accordion',
      'popover',
      'dialog',
      'overlay',
      'popup',
    ] as const

    names.forEach((name) => {
      expect(mountPreview(name).get('.primitive-example-preview').element.children.length, name).toBeGreaterThan(0)
    })

    for (const name of names) {
      const preview = mountPreview(name, 'weapp')
      expect(preview.get('.primitive-example-preview').attributes('data-name'), name).toBe(name)
      expect(preview.get('.primitive-example-preview').attributes('data-platform'), name).toBe('weapp')
      if (name === 'overlay') {
        await preview.get('button').trigger('click')
        await nextTick()
      }
      expect(preview.findComponent(weappPrimitiveRoots[name]).exists(), name).toBe(true)
      if (name !== 'button' && name !== 'overlay' && name !== 'popup') {
        expect(preview.findComponent(WeappPrimitives.ButtonRoot).exists(), name).toBe(false)
      }
    }

    expect(mountPreview('image').get('img').attributes('src')).toBe('/logo.svg')
  })

  it('exercises press, input, numeric, and cell state', async () => {
    const button = mountPreview('button')
    await button.get('button').trigger('click')
    expect(button.text()).toContain('Pressed 1 times')

    const input = mountPreview('input')
    await input.get('input').setValue('Changed')
    expect((input.get('input').element as HTMLInputElement).value).toBe('Changed')

    const number = mountPreview('number-field')
    await number.findAll('button')[1].trigger('click')
    expect((number.get('input').element as HTMLInputElement).value).toBe('3')

    const cell = mountPreview('cell')
    await cell.get('.pe-cell').trigger('click')
    expect(cell.text()).toContain('1 activations')
  })

  it('opens and dismisses dialog, overlay, and popup layers', async () => {
    const dialog = mountPreview('dialog')
    await dialog.get('button').trigger('click')
    expect(dialog.get('.pe-layer-content').text()).toContain('Dialog content')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(dialog.find('.pe-layer-content').exists()).toBe(false)

    const overlay = mountPreview('overlay')
    await overlay.get('button').trigger('click')
    expect(overlay.find('.pe-layer-overlay--interactive').exists()).toBe(true)
    await overlay.get('.pe-layer-content').trigger('click')
    expect(overlay.find('.pe-layer-overlay--interactive').exists()).toBe(false)

    const popup = mountPreview('popup')
    await popup.get('button').trigger('click')
    expect(popup.get('.varo-popup__content').text()).toContain('Popup content')
    await popup.get('.varo-popup__close').trigger('click')
    expect(popup.find('.varo-popup__content').exists()).toBe(false)
  })
})

describe('primitive example Weapp preview', () => {
  it('renders the matching Weapp primitive inside VitePress', async () => {
    const wrapper = mount(PrimitiveExample, { props: { name: 'button', locale: 'zh' } })
    wrappers.push(wrapper)

    await wrapper.findAll('[role="tab"]').find(tab => tab.text() === '小程序')!.trigger('click')
    await nextTick()

    const preview = wrapper.getComponent(PrimitiveExamplePreview)
    expect(wrapper.find('iframe').exists()).toBe(false)
    expect(preview.props('platform')).toBe('weapp')
    expect(preview.attributes('data-name')).toBe('button')
    expect(preview.findComponent(WeappPrimitives.ButtonRoot).exists()).toBe(true)
    expect(preview.findComponent(WeappPrimitives.InputRoot).exists()).toBe(false)
    expect(wrapper.find('.primitive-example__contract-table').exists()).toBe(true)
  })
})
