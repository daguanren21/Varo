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

describe('primitives-weapp p1 disclosure and floating parts', () => {
  it('composes collapsible parts with platform tags', async () => {
    const wrapper = mount(CollapsibleRoot, {
      props: { as: 'view', defaultOpen: false },
      slots: {
        default: () => [
          h(CollapsibleTrigger, { as: 'button' }, { default: () => 'Toggle' }),
          h(CollapsibleContent, { as: 'view' }, { default: () => 'Details' })
        ]
      }
    })

    expect(wrapper.text()).not.toContain('Details')

    await wrapper.get('[aria-expanded="false"]').trigger('click')

    expect(wrapper.text()).toContain('Details')
  })

  it('composes accordion parts with platform tags', async () => {
    const Harness = defineComponent({
      setup() {
        return () =>
          h(AccordionRoot, { as: 'view', collapsible: true, defaultValue: 'account', type: 'single' }, {
            default: () => [
              h(AccordionItem, { as: 'view', value: 'account' }, {
                default: () => [
                  h(AccordionTrigger, { as: 'button' }, { default: () => 'Account' }),
                  h(AccordionContent, { as: 'view' }, { default: () => 'Account panel' })
                ]
              }),
              h(AccordionItem, { as: 'view', value: 'security' }, {
                default: () => [
                  h(AccordionTrigger, { as: 'button' }, { default: () => 'Security' }),
                  h(AccordionContent, { as: 'view' }, { default: () => 'Security panel' })
                ]
              })
            ]
          })
      }
    })
    const wrapper = mount(Harness)

    expect(wrapper.text()).toContain('Account panel')
    await wrapper.findAll('[aria-expanded]')[1].trigger('click')
    expect(wrapper.text()).toContain('Security panel')
    expect(wrapper.text()).not.toContain('Account panel')
  })

  it('opens and closes popover through explicit parts', async () => {
    const wrapper = mount(PopoverRoot, {
      slots: {
        default: () => [
          h(PopoverTrigger, { as: 'button' }, { default: () => 'Open' }),
          h(PopoverContent, { as: 'view' }, {
            default: () => [
              h('text', 'Popover panel'),
              h(PopoverClose, { as: 'button' }, { default: () => 'Close' })
            ]
          })
        ]
      }
    })

    expect(wrapper.text()).not.toContain('Popover panel')
    await wrapper.get('[aria-haspopup="dialog"]').trigger('click')
    expect(wrapper.text()).toContain('Popover panel')
    await wrapper.get('[data-part="close"]').trigger('click')
    expect(wrapper.text()).not.toContain('Popover panel')
  })
})
