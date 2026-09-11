// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { h, nextTick } from 'vue'
import AgentChat from './components/blocks/agent-chat.vue'
import VSelect from './components/ui/select.vue'
import VActionSheet from './components/ui/v-action-sheet.vue'
import VButton from './components/ui/v-button.vue'
import VCard from './components/ui/v-card.vue'
import VCollapseItem from './components/ui/v-collapse-item.vue'
import VCollapse from './components/ui/v-collapse.vue'
import VIcon from './components/ui/v-icon.vue'
import VInput from './components/ui/v-input.vue'
import VList from './components/ui/v-list.vue'
import VNoticeBar from './components/ui/v-notice-bar.vue'
import VSteps from './components/ui/v-steps.vue'
import VSwipeCell from './components/ui/v-swipe-cell.vue'
import VSwitch from './components/ui/v-switch.vue'
import VTextarea from './components/ui/v-textarea.vue'
import VToast from './components/ui/v-toast.vue'

describe('expanded weapp registry components', () => {
  it('moves the Switch thumb with controlled checked state', async () => {
    const style = document.createElement('style')
    style.textContent = readFileSync(resolve(import.meta.dirname, 'styles/varo.css'), 'utf8')
    document.head.append(style)
    const wrapper = mount(VSwitch, {
      attachTo: document.body,
      props: { modelValue: false },
    })

    try {
      const thumb = wrapper.get('.varo-switch__thumb').element
      const uncheckedTransform = getComputedStyle(thumb).transform
      await wrapper.setProps({ modelValue: true })
      expect(getComputedStyle(thumb).transform).toBe('translateX(20px)')
      await wrapper.setProps({ modelValue: false })
      expect(getComputedStyle(thumb).transform).toBe(uncheckedTransform)
    }
    finally {
      wrapper.unmount()
      style.remove()
    }
  })

  it('uses native mini-program hover classes for pressed feedback', () => {
    const button = mount(VButton, { props: { className: 'rounded-none shadow-none' } })
    expect(button.get('button').attributes('hover-class')).toBe('varo-button--pressed')
    expect(button.get('button').attributes('hover-start-time')).toBe('20')
    expect(button.get('button').attributes('hover-stay-time')).toBe('70')
    expect(button.get('button').classes()).toContain('rounded-none')
    expect(button.get('button').classes()).toContain('shadow-none')

    const disabledButton = mount(VButton, { props: { disabled: true } })
    expect(disabledButton.get('button').attributes('hover-class')).toBe('none')

    const textButton = mount(VButton, { props: { variant: 'text' } })
    expect(textButton.get('button').attributes('data-variant')).toBe('text')

    const card = mount(VCard, { props: { className: 'rounded-none shadow-none', interactive: true } })
    expect(card.get('.varo-card').attributes('hover-class')).toBe('varo-card--pressed')
    expect(card.get('.varo-card').classes()).toContain('rounded-none')
    expect(card.get('.varo-card').classes()).toContain('shadow-none')
  })

  it('selects an action and closes the action sheet', async () => {
    const wrapper = mount(VActionSheet, {
      props: {
        actions: [{ name: '归档', value: 'archive' }],
        visible: true,
      },
    })

    await wrapper.get('.varo-action-sheet__action').trigger('click')
    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ item: { value: 'archive' } })
    expect(wrapper.emitted('update:visible')?.at(-1)).toEqual([false])
  })

  it('opens collapse content and selects steps', async () => {
    const collapse = mount({
      render: () =>
        h(VCollapse, { collapsible: true }, {
          default: () => h(VCollapseItem, { title: '订单详情', value: 'order' }, { default: () => '已发货' }),
        }),
    })
    expect(collapse.text()).not.toContain('已发货')
    await collapse.get('.varo-collapse-item__trigger').trigger('click')
    expect(collapse.text()).toContain('已发货')

    const steps = mount(VSteps, {
      props: { clickable: true, current: 0, items: ['下单', '发货'] },
    })
    await steps.findAll('.varo-steps__trigger')[1].trigger('click')
    expect(steps.emitted('update:current')?.[0]).toEqual([1])
  })

  it('supports notice close, list load, and swipe actions', async () => {
    const notice = mount(VNoticeBar, { props: { closeable: true, text: '系统维护' } })
    await notice.get('.varo-notice-bar__close').trigger('click')
    expect(notice.emitted('update:visible')?.[0]).toEqual([false])

    const onLoad = vi.fn()
    mount(VList, { props: { onLoad } })
    await nextTick()
    expect(onLoad).toHaveBeenCalledTimes(1)

    const swipe = mount(VSwipeCell, {
      props: { leftWidth: 80, threshold: 0.25 },
      slots: { default: () => '订单' },
    })
    const content = swipe.get('.varo-swipe-cell__content')
    await content.trigger('touchstart', { touches: [{ clientX: 0 }] })
    await content.trigger('touchmove', { touches: [{ clientX: 40 }] })
    await content.trigger('touchend', { changedTouches: [{ clientX: 40 }] })
    expect(swipe.emitted('update:modelValue')?.at(-1)).toEqual(['left'])
  })

  it('filters from the Select field without a duplicate panel search box', async () => {
    const wrapper = mount(VSelect, {
      props: {
        clearable: true,
        filterable: true,
        options: [
          { label: 'Shanghai', value: 'shanghai' },
          { label: 'Hangzhou', value: 'hangzhou' },
          { label: 'Suzhou', value: 'suzhou' },
        ],
        value: 'shanghai',
      },
    })
    const filterInput = wrapper.get('.varo-select__filter-input')
    expect(filterInput.attributes('value')).toBe('Shanghai')
    expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(false)

    await filterInput.trigger('focus')
    expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(true)
    expect(wrapper.find('.varo-select__panel .varo-select__filter-input').exists()).toBe(false)
    await filterInput.setValue('zhou')

    expect(wrapper.emitted('search')?.at(-1)).toEqual(['zhou'])
    expect(wrapper.findAll('.varo-select__option').map(option => option.text())).toEqual(['Hangzhou', 'Suzhou'])
    await wrapper.get('[aria-label="Clear selection"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([undefined])
  })

  it('preserves the selected label across search dismissal and reselection', async () => {
    const wrapper = mount(VSelect, {
      props: {
        filterable: true,
        options: [
          { label: 'Shanghai', value: 'shanghai' },
          { label: 'Hangzhou', value: 'hangzhou' },
        ],
        value: 'shanghai',
      },
    })
    const input = wrapper.get<HTMLInputElement>('[role="combobox"]')

    await input.trigger('focus')
    expect(input.element.value).toBe('Shanghai')
    await input.setValue('')
    expect(input.element.value).toBe('')
    expect(wrapper.findAll('[role="option"]').map(option => option.text())).toEqual(['Shanghai', 'Hangzhou'])
    await wrapper.get('.varo-select__dismiss').trigger('click')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(input.element.value).toBe('Shanghai')
    expect(wrapper.emitted('update:value')).toBeUndefined()

    await input.trigger('focus')
    expect(input.element.value).toBe('Shanghai')
    await wrapper.findAll('[role="option"]')[0].trigger('click')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
    expect(wrapper.emitted('update:value')).toBeUndefined()
    wrapper.unmount()
  })

  it('hides the native Select clear action between interactions', async () => {
    const wrapper = mount(VSelect, {
      props: {
        clearable: true,
        options: [
          { label: 'Shanghai', value: 'shanghai' },
          { label: 'Hangzhou', value: 'hangzhou' },
        ],
        value: 'shanghai',
      },
    })

    expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(false)
    await wrapper.get('[role="combobox"]').trigger('click')
    expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(true)
    await wrapper.findAll('[role="option"]')[1].trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual(['hangzhou'])
    expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(false)

    await wrapper.setProps({ value: 'hangzhou' })
    await wrapper.get('[role="combobox"]').trigger('click')
    await wrapper.get('[aria-label="Clear selection"]').trigger('click')
    expect(wrapper.emitted('update:value')?.at(-1)).toEqual([undefined])
    expect(wrapper.emitted('clear')).toHaveLength(1)
    await wrapper.setProps({ value: undefined })
    expect(wrapper.find('[aria-label="Clear selection"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('keeps readonly native Select values immutable while allowing browsing', async () => {
    const wrapper = mount(VSelect, {
      props: {
        clearable: true,
        filterable: true,
        options: [
          { label: 'Shanghai', value: 'shanghai' },
          { label: 'Hangzhou', value: 'hangzhou' },
        ],
        readonly: true,
        value: 'shanghai',
      },
    })

    expect(wrapper.find('.varo-select__filter-input').exists()).toBe(false)
    expect(wrapper.find('.varo-select__clear').exists()).toBe(false)
    const trigger = wrapper.get('.varo-select__control')
    expect(trigger.attributes('disabled')).toBeUndefined()
    expect(trigger.attributes('aria-disabled')).toBe('false')
    expect(trigger.attributes('aria-readonly')).toBe('true')

    await trigger.trigger('click')
    expect(wrapper.get('[role="listbox"]').attributes('aria-readonly')).toBe('true')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.find('.varo-select__panel').exists()).toBe(true)

    await trigger.trigger('click')
    await wrapper.setProps({ multiple: true, value: ['shanghai'] })
    await trigger.trigger('click')
    await wrapper.findAll('.varo-select__option')[1].trigger('click')
    await wrapper.get('.varo-select__confirm').trigger('click')
    expect(wrapper.emitted('update:value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)

    await wrapper.setProps({ disabled: true })
    await wrapper.get('.varo-select__trigger').trigger('click')
    expect(wrapper.find('.varo-select__panel').exists()).toBe(false)
  })

  it('preserves uncontrolled native input and textarea values', async () => {
    const input = mount(VInput, {
      props: {
        ariaDescribedby: 'name-help',
        className: 'consumer-input',
        defaultValue: 'seed',
        formatter: (value: string) => value.toUpperCase(),
        inputId: 'customer-name',
        name: 'customerName',
        selectionStart: 1,
      },
    })
    expect(input.get('input').attributes('value')).toBe('seed')
    expect(input.get('.varo-input').classes()).toContain('consumer-input')
    expect(input.get('.varo-input').attributes('name')).toBeUndefined()
    expect(input.get('input').attributes('id')).toBe('customer-name')
    expect(input.get('input').attributes('name')).toBe('customerName')
    expect(input.get('input').attributes('aria-describedby')).toBe('name-help')
    expect(input.get('input').attributes('selection-start')).toBe('1')

    await input.get('input').trigger('input', { detail: { value: 'next' } })
    expect(input.emitted('update:value')?.at(-1)).toEqual(['NEXT'])
    expect(input.get('input').attributes('value')).toBe('NEXT')

    const textarea = mount(VTextarea, {
      props: { defaultValue: 'memo' },
    })
    expect(textarea.get('textarea').attributes('value')).toBe('memo')
  })

  it('gives WeChat empty native strings for VIcon and class-only toast states', async () => {
    expect(VIcon).toMatchObject({
      properties: {
        color: { type: null, value: '' },
        label: { type: null, value: '' },
        name: { type: null, value: '' },
      },
    })

    const toast = mount(VToast, {
      props: {
        message: '保存成功',
        position: 'top',
        type: 'success',
        visible: true,
      },
    })
    const root = toast.get('.varo-toast')
    expect(root.classes()).toContain('varo-toast--success')
    expect(root.classes()).toContain('varo-toast--top')
    expect(toast.get('.varo-toast__icon .varo-icon').attributes('data-name')).toBe('success')
  })

  it('renders the mini-program Agent Chat block and forwards prompts', async () => {
    const wrapper = mount(AgentChat, {
      props: {
        messages: [{ content: '欢迎使用', id: 'welcome', role: 'assistant' }],
        suggestions: ['买一盒牛奶'],
        title: '购物 Agent',
      },
    })

    expect(wrapper.text()).toContain('购物 Agent')
    expect(wrapper.find('rich-text').exists()).toBe(true)
    await wrapper.findAll('button').find(button => button.text() === '买一盒牛奶')!.trigger('click')
    expect(wrapper.emitted('submit')?.[0]).toEqual(['买一盒牛奶'])
  })
})
