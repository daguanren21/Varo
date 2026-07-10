import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { describe, expect, it } from 'vitest'
import {
  AccordionContent,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  PopoverClose,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger
} from '../src'

describe('primitives-h5 p1 disclosure and floating parts', () => {
  it('composes collapsible root, trigger, and content', async () => {
    const wrapper = mount(CollapsibleRoot, {
      props: { defaultOpen: false },
      slots: {
        default: () => [
          h(CollapsibleTrigger, null, { default: () => 'Toggle' }),
          h(CollapsibleContent, null, { default: () => 'Details' })
        ]
      }
    })

    expect(wrapper.text()).not.toContain('Details')

    await wrapper.get('[aria-expanded="false"]').trigger('click')

    expect(wrapper.text()).toContain('Details')
    expect(wrapper.get('[aria-expanded="true"]').attributes('data-state')).toBe('open')
  })

  it('composes a collapsible single accordion', async () => {
    const Harness = defineComponent({
      setup() {
        return () =>
          h(AccordionRoot, { collapsible: true, defaultValue: 'account', type: 'single' }, {
            default: () => [
              h(AccordionItem, { value: 'account' }, {
                default: () => [
                  h(AccordionTrigger, null, { default: () => 'Account' }),
                  h(AccordionContent, null, { default: () => 'Account panel' })
                ]
              }),
              h(AccordionItem, { value: 'security' }, {
                default: () => [
                  h(AccordionTrigger, null, { default: () => 'Security' }),
                  h(AccordionContent, null, { default: () => 'Security panel' })
                ]
              })
            ]
          })
      }
    })
    const wrapper = mount(Harness)

    expect(wrapper.text()).toContain('Account panel')
    expect(wrapper.text()).not.toContain('Security panel')

    await wrapper.findAll('[aria-expanded]')[1].trigger('click')

    expect(wrapper.text()).not.toContain('Account panel')
    expect(wrapper.text()).toContain('Security panel')

    await wrapper.findAll('[aria-expanded]')[1].trigger('click')
    expect(wrapper.text()).not.toContain('Security panel')
  })

  it('opens popover and closes it through close, escape, and outside interaction', async () => {
    const Harness = defineComponent({
      setup() {
        return () =>
          h('div', [
            h(PopoverRoot, null, {
              default: () => [
                h(PopoverTrigger, null, { default: () => 'Open' }),
                h(PopoverContent, null, {
                  default: () => [
                    h('span', 'Popover panel'),
                    h(PopoverClose, null, { default: () => 'Close' })
                  ]
                })
              ]
            }),
            h('button', { class: 'outside' }, 'Outside')
          ])
      }
    })
    const wrapper = mount(Harness, { attachTo: document.body })

    await wrapper.get('[aria-haspopup="dialog"]').trigger('click')
    expect(wrapper.text()).toContain('Popover panel')

    await wrapper.get('[data-part="close"]').trigger('click')
    expect(wrapper.text()).not.toContain('Popover panel')

    await wrapper.get('[aria-haspopup="dialog"]').trigger('click')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).not.toContain('Popover panel')

    await wrapper.get('[aria-haspopup="dialog"]').trigger('click')
    await wrapper.get('.outside').trigger('pointerdown')
    expect(wrapper.text()).not.toContain('Popover panel')

    wrapper.unmount()
  })
})
