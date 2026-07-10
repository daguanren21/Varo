import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
  type TabsOrientation
} from '../src'

interface MountTabsOptions {
  onKeydown?: (event: KeyboardEvent) => void
  orientation?: TabsOrientation
}

function mountTabs(options: MountTabsOptions = {}) {
  return mount(TabsRoot, {
    attachTo: document.body,
    props: {
      defaultValue: 'docs',
      id: 'docs-tabs',
      orientation: options.orientation
    },
    slots: {
      default: () => [
        h(TabsList, null, {
          default: () => [
            h(TabsTrigger, { value: 'docs', onKeydown: options.onKeydown }, { default: () => 'Docs' }),
            h(TabsTrigger, { disabled: true, value: 'examples' }, { default: () => 'Examples' }),
            h(TabsTrigger, { value: 'api' }, { default: () => 'API' })
          ]
        }),
        h(TabsContent, { value: 'docs' }, { default: () => 'Docs panel' }),
        h(TabsContent, { value: 'api' }, { default: () => 'API panel' })
      ]
    }
  })
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('primitives-h5 tabs accessibility', () => {
  it('links panels and moves focus through enabled horizontal tabs', async () => {
    const wrapper = mountTabs()
    const tabs = wrapper.findAll('[role="tab"]')
    const first = tabs[0].element as HTMLElement
    const last = tabs[2].element as HTMLElement

    expect(tabs[0].attributes()).toMatchObject({
      id: 'varo-tabs-docs-tabs-trigger-s-docs',
      'aria-controls': 'varo-tabs-docs-tabs-content-s-docs',
      tabindex: '0'
    })
    expect(wrapper.get('[role="tabpanel"]').attributes()).toMatchObject({
      id: 'varo-tabs-docs-tabs-content-s-docs',
      'aria-labelledby': 'varo-tabs-docs-tabs-trigger-s-docs'
    })

    first.focus()
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })
    await nextTick()

    expect(document.activeElement).toBe(last)
    expect(tabs[2].attributes('data-state')).toBe('active')
    expect(wrapper.text()).toContain('API panel')
    expect(wrapper.emitted('valueChange')?.at(-1)).toEqual(['api'])

    await tabs[2].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(first)
    wrapper.unmount()
  })

  it('supports vertical arrows and Home and End', async () => {
    const wrapper = mountTabs({ orientation: 'vertical' })
    const tabs = wrapper.findAll('[role="tab"]')
    const first = tabs[0].element as HTMLElement
    const last = tabs[2].element as HTMLElement

    expect(wrapper.get('[role="tablist"]').attributes('aria-orientation')).toBe('vertical')
    first.focus()
    await tabs[0].trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(last)
    await tabs[2].trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(first)
    await tabs[0].trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(last)
    wrapper.unmount()
  })

  it('lets consumer keydown prevent automatic navigation', async () => {
    const onKeydown = vi.fn((event: KeyboardEvent) => event.preventDefault())
    const wrapper = mountTabs({ onKeydown })
    const tabs = wrapper.findAll('[role="tab"]')
    const first = tabs[0].element as HTMLElement

    first.focus()
    await tabs[0].trigger('keydown', { key: 'ArrowRight' })

    expect(onKeydown).toHaveBeenCalledOnce()
    expect(document.activeElement).toBe(first)
    expect(tabs[0].attributes('data-state')).toBe('active')
    wrapper.unmount()
  })

  it('keeps navigation inside the nearest tablist', async () => {
    const NestedHarness = defineComponent({
      setup() {
        return () =>
          h(TabsRoot, { defaultValue: 'outer-a', id: 'outer' }, {
            default: () => [
              h(TabsList, null, {
                default: () => [
                  h(TabsTrigger, { value: 'outer-a' }, { default: () => 'Outer A' }),
                  h(TabsRoot, { defaultValue: 'inner-a', id: 'inner' }, {
                    default: () =>
                      h(TabsList, null, {
                        default: () => [
                          h(TabsTrigger, { value: 'inner-a' }, { default: () => 'Inner A' }),
                          h(TabsTrigger, { value: 'inner-b' }, { default: () => 'Inner B' })
                        ]
                      })
                  }),
                  h(TabsTrigger, { value: 'outer-b' }, { default: () => 'Outer B' })
                ]
              }),
              h(TabsContent, { value: 'outer-a' }, { default: () => 'Outer A panel' }),
              h(TabsContent, { value: 'outer-b' }, { default: () => 'Outer B panel' })
            ]
          })
      }
    })
    const wrapper = mount(NestedHarness, { attachTo: document.body })
    const outerList = wrapper.findAll('[role="tablist"]')[0].element
    const outerTabs = wrapper.findAll('[role="tab"]').filter(
      (trigger) => trigger.element.closest('[role="tablist"]') === outerList
    )
    const first = outerTabs[0].element as HTMLElement
    const last = outerTabs[1].element as HTMLElement

    first.focus()
    await outerTabs[0].trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBe(last)
    wrapper.unmount()
  })
})
