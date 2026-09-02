import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import { VActionSheet } from '../src/action-sheet'
import { VAvatar } from '../src/avatar'
import { VBadge } from '../src/badge'
import { VCard, VCardContent, VCardHeader, VCardTitle } from '../src/card'
import { VCollapse, VCollapseItem } from '../src/collapse'
import { VEmpty } from '../src/empty'
import { VIcon } from '../src/icon'
import { VList } from '../src/list'
import { VNoticeBar } from '../src/notice-bar'
import { VPopoverContent, VPopoverRoot, VPopoverTrigger } from '../src/popover'
import { VProgress } from '../src/progress'
import { VSafeArea } from '../src/safe-area'
import { VSkeleton } from '../src/skeleton'
import { VSteps } from '../src/steps'
import { VSwipeCell } from '../src/swipe-cell'
import { VTag } from '../src/tag'

describe('P0 display components', () => {
  it('renders card anatomy, icon glyphs, avatar fallback, and bounded badges', () => {
    const wrapper = mount({
      render: () =>
        h(VCard, { variant: 'outline' }, {
          default: () => [
            h(VCardHeader, null, { default: () => h(VCardTitle, null, { default: () => 'Overview' }) }),
            h(VCardContent, null, { default: () => [
              h(VIcon, { name: 'check', label: 'Completed' }),
              h(VAvatar, { fallback: 'VA', alt: 'Varo account' }),
              h(VBadge, { content: 120, max: 99 }),
            ] }),
          ],
        }),
    })

    expect(wrapper.get('.varo-card').attributes('data-variant')).toBe('outline')
    expect(wrapper.get('.varo-card__title').text()).toBe('Overview')
    expect(wrapper.get('.varo-icon').text()).toBe('✓')
    expect(wrapper.get('.varo-avatar__fallback').text()).toBe('VA')
    expect(wrapper.get('.varo-badge').text()).toBe('99+')
  })

  it('delays skeleton placeholders and fades loaded content in', async () => {
    vi.useFakeTimers()
    try {
      const skeleton = mount(VSkeleton, {
        props: { delay: 180, rows: 2 },
        slots: { default: 'Loaded content' },
      })
      expect(skeleton.attributes('data-state')).toBe('pending')
      expect(skeleton.findAll('.varo-skeleton__row')).toHaveLength(0)

      await vi.advanceTimersByTimeAsync(179)
      expect(skeleton.attributes('data-state')).toBe('pending')
      await vi.advanceTimersByTimeAsync(1)
      expect(skeleton.attributes('data-state')).toBe('visible')
      expect(skeleton.findAll('.varo-skeleton__row')).toHaveLength(2)

      await skeleton.setProps({ loading: false })
      expect(skeleton.get('.varo-skeleton__loaded').text()).toBe('Loaded content')
      expect(skeleton.attributes('data-fade')).toBe('true')
    }
    finally {
      vi.useRealTimers()
    }

    const progress = mount(VProgress, { props: { percentage: 140 } })
    expect(progress.attributes('aria-valuenow')).toBe('100')
    expect(progress.text()).toContain('100%')

    const empty = mount(VEmpty, { props: { title: 'No orders', description: 'Try another filter.' } })
    expect(empty.get('.varo-empty__title').text()).toBe('No orders')
    expect(empty.get('.varo-empty__description').text()).toBe('Try another filter.')
  })

  it('exposes safe-area edges through stable state attributes', () => {
    const wrapper = mount(VSafeArea, { props: { edges: ['top', 'bottom'] } })
    expect(wrapper.attributes('data-top')).toBe('true')
    expect(wrapper.attributes('data-bottom')).toBe('true')
    expect(wrapper.attributes('data-left')).toBe('false')
  })
})

describe('P0 interaction components', () => {
  it('toggles checkable tags and emits close separately', async () => {
    const wrapper = mount(VTag, {
      props: { checkable: true, checked: false, closeable: true },
      slots: { default: () => 'New' },
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted('update:checked')?.[0]).toEqual([true])
    await wrapper.get('.varo-tag__close').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('selects steps only when clickable', async () => {
    const wrapper = mount(VSteps, {
      props: { clickable: true, current: 0, items: ['Created', 'Shipped'] },
    })

    await wrapper.findAll('.varo-steps__trigger')[1].trigger('click')
    expect(wrapper.emitted('update:current')?.[0]).toEqual([1])
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ index: 1 })
  })

  it('closes notice bars through the controlled visibility contract', async () => {
    const wrapper = mount(VNoticeBar, { props: { closeable: true, text: 'Maintenance tonight' } })
    await wrapper.get('.varo-notice-bar__close').trigger('click')
    expect(wrapper.emitted('update:visible')?.[0]).toEqual([false])
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('opens collapse items and popovers through their primitives', async () => {
    const collapse = mount({
      render: () =>
        h(VCollapse, { collapsible: true }, {
          default: () => h(VCollapseItem, { title: 'Details', value: 'details' }, { default: () => 'Body' }),
        }),
    })
    expect(collapse.text()).not.toContain('Body')
    await collapse.get('.varo-collapse-item__trigger').trigger('click')
    expect(collapse.text()).toContain('Body')

    const popover = mount({
      render: () =>
        h(VPopoverRoot, null, {
          default: () => [
            h(VPopoverTrigger, null, { default: () => 'Open' }),
            h(VPopoverContent, null, { default: () => 'Popover body' }),
          ],
        }),
    })
    expect(popover.text()).not.toContain('Popover body')
    await popover.get('.varo-popover__trigger').trigger('click')
    expect(popover.text()).toContain('Popover body')
  })

  it('selects action-sheet entries and requests close', async () => {
    const wrapper = mount(VActionSheet, {
      props: { visible: true, actions: [{ name: 'Archive', value: 'archive' }] },
    })

    await wrapper.get('.varo-action-sheet__action').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ index: 0, item: { value: 'archive' } })
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false])
  })

  it('opens swipe actions after crossing the configured threshold', async () => {
    const wrapper = mount(VSwipeCell, {
      props: { leftWidth: 80, threshold: 0.25 },
      slots: { default: () => 'Order' },
    })
    const content = wrapper.get('.varo-swipe-cell__content')

    await content.trigger('touchstart', { touches: [{ clientX: 0 }] })
    await content.trigger('touchmove', { touches: [{ clientX: 40 }] })
    await content.trigger('touchend', { changedTouches: [{ clientX: 40 }] })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['left'])
    expect(wrapper.attributes('data-open')).toBe('left')
  })

  it('requests initial list data once and supports retry feedback', async () => {
    const onLoad = vi.fn()
    const wrapper = mount(VList, {
      props: { errorText: undefined, onLoad },
      slots: { default: () => h('div', 'Row') },
    })
    await nextTick()
    expect(onLoad).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ errorText: 'Load failed' })
    await wrapper.get('.varo-list__retry').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
