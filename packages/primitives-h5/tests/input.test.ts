import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { mergeProps } from 'vue'
import { InputRoot } from '../src/input'

describe('primitives-h5 input', () => {
  it('forwards merged input listeners once only for accepted changes', async () => {
    const events: string[] = []
    const wrapper = mount(InputRoot, {
      attrs: mergeProps(
        { onInput: () => events.push('first') },
        { onInput: () => events.push('second') },
      ),
    })
    await wrapper.get('input').setValue('accepted')
    expect((wrapper.element as HTMLInputElement).value).toBe('accepted')
    expect(events).toEqual(['first', 'second'])

    await wrapper.setProps({ readonly: true })
    await wrapper.get('input').setValue('blocked')
    expect((wrapper.element as HTMLInputElement).value).toBe('accepted')
    expect(events).toEqual(['first', 'second'])
    wrapper.unmount()
  })

  it('updates local value in uncontrolled mode', async () => {
    const wrapper = mount(InputRoot, {
      props: {
        defaultValue: 'hello',
      },
    })
    const input = wrapper.find('input')

    expect((wrapper.element as HTMLInputElement).value).toBe('hello')
    await input.setValue('world')
    expect((wrapper.element as HTMLInputElement).value).toBe('world')
  })

  it('emits value update in controlled mode without mutating visual state', async () => {
    const onUpdateValue = vi.fn()
    const wrapper = mount(InputRoot, {
      props: {
        'value': 'hello',
        'onUpdate:value': onUpdateValue,
      },
    })
    const input = wrapper.find('input')

    await input.setValue('world')
    expect(onUpdateValue).toHaveBeenCalledWith('world')
    expect((wrapper.element as HTMLInputElement).value).toBe('hello')
  })

  it('keeps invalid and disabled attrs in sync', () => {
    const wrapper = mount(InputRoot, {
      props: {
        disabled: true,
        invalid: true,
      },
    })

    expect(wrapper.attributes('aria-invalid')).toBe('true')
    expect(wrapper.attributes('data-disabled')).toBe('true')
  })

  it('formats and limits values before emitting changes', async () => {
    const onValueChange = vi.fn()
    const wrapper = mount(InputRoot, {
      props: {
        formatter: (value: string) => value.toUpperCase(),
        maxLength: 4,
        onValueChange,
      },
    })
    const input = wrapper.find('input')

    await input.setValue('abcdef')

    expect(onValueChange).toHaveBeenCalledWith('ABCD')
    expect((wrapper.element as HTMLInputElement).value).toBe('ABCD')
    expect(wrapper.attributes('maxlength')).toBe('4')
  })

  it('does not update while readonly', async () => {
    const onValueChange = vi.fn()
    const wrapper = mount(InputRoot, {
      props: {
        defaultValue: 'locked',
        readonly: true,
        onValueChange,
      },
    })
    const input = wrapper.find('input')

    await input.setValue('changed')

    expect(onValueChange).not.toHaveBeenCalled()
    expect((wrapper.element as HTMLInputElement).value).toBe('locked')
    expect(wrapper.attributes('readonly')).toBeDefined()
    expect(wrapper.attributes('data-readonly')).toBe('true')
  })

  it('renders textarea controls with autosize metadata', () => {
    const wrapper = mount(InputRoot, {
      props: {
        type: 'textarea',
        rows: 3,
        autosize: { minRows: 2, maxRows: 5 },
      },
    })

    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.attributes('rows')).toBe('3')
    expect(wrapper.attributes('data-autosize')).toBe('true')
  })

  it('rejects imperative writes while readonly or disabled and emits accepted changes in order', async () => {
    const events: string[] = []
    const wrapper = mount(InputRoot, {
      props: {
        'defaultValue': 'locked',
        'readonly': true,
        'onUpdate:value': (value: string) => events.push(`update:${value}`),
        'onValueChange': (value: string) => events.push(`change:${value}`),
      },
    })
    const api = wrapper.vm as unknown as { setValue: (value: string) => boolean, clear: () => boolean }
    expect(api.setValue('changed')).toBe(false)
    expect(api.clear()).toBe(false)
    expect(events).toEqual([])

    await wrapper.setProps({ readonly: false, disabled: true })
    expect(api.setValue('changed')).toBe(false)
    await wrapper.setProps({ disabled: false })
    expect(api.clear()).toBe(true)
    expect(events).toEqual(['update:', 'change:'])
    expect((wrapper.element as HTMLInputElement).value).toBe('')
    expect(api.clear()).toBe(false)
    wrapper.unmount()
  })
})
