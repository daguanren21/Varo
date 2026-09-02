import type { PrimitiveExampleName } from './primitiveExamples'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import PrimitiveExamplePreview from './PrimitiveExamplePreview.vue'

const wrappers: Array<ReturnType<typeof mount>> = []
function mountPreview(name: PrimitiveExampleName) {
  const wrapper = mount(PrimitiveExamplePreview, { props: { name } })
  wrappers.push(wrapper)
  return wrapper
}

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
})

describe('foundational primitive previews', () => {
  it('renders every newly documented public primitive', () => {
    const names = [
      'button',
      'input',
      'number-field',
      'image',
      'cell',
      'sticky',
      'dialog',
      'overlay',
      'popup',
    ] as const

    names.forEach((name) => {
      expect(mountPreview(name).get('.primitive-example-preview').element.children.length, name).toBeGreaterThan(0)
    })
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
