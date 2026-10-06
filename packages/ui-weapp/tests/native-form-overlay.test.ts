import type { DialogOpenChangeDetails } from '@varo-ui/headless'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, reactive } from 'vue'
import VDialogClose from '../native/src/components/ui/v-dialog-close.vue'
import VDialogContent from '../native/src/components/ui/v-dialog-content.vue'
import VDialogRoot from '../native/src/components/ui/v-dialog-root.vue'
import VDialogTrigger from '../native/src/components/ui/v-dialog-trigger.vue'
import VDrawer from '../native/src/components/ui/v-drawer.vue'
import VFormItem from '../native/src/components/ui/v-form-item.vue'
import VForm from '../native/src/components/ui/v-form.vue'
import VInputOtp from '../native/src/components/ui/v-input-otp.vue'
import VInput from '../native/src/components/ui/v-input.vue'
import VPopup from '../native/src/components/ui/v-popup.vue'

enableAutoUnmount(afterEach)

// Native untyped properties represent an omitted value as null, not undefined.
const nativeUnset = null as unknown as undefined

describe('native form and overlay accepted transitions', () => {
  it('honors defaultOpen and emits accepted drawer close events in order', async () => {
    const events: string[] = []
    const wrapper = mount(VDrawer, {
      props: {
        'defaultOpen': true,
        'open': nativeUnset,
        'closeable': true,
        'onOpenChange': () => events.push('request'),
        'onUpdate:open': () => events.push('update'),
        'onClose': () => events.push('close'),
      },
    })
    expect(wrapper.find('.varo-drawer__content').exists()).toBe(true)
    await wrapper.get('.varo-drawer__close').trigger('click')
    expect(events).toEqual(['request', 'update', 'close'])
    expect(wrapper.find('.varo-drawer__content').exists()).toBe(false)
  })

  it('keeps canceled and disabled drawer requests from updating the parent', async () => {
    const events: string[] = []
    const wrapper = mount(VDrawer, {
      props: {
        'open': true,
        'closeable': true,
        'onOpenChange': ([open, details]: [boolean, DialogOpenChangeDetails]) => {
          events.push(`request:${open}`)
          details.cancel()
        },
        'onUpdate:open': (open: boolean) => events.push(`update:${open}`),
        'onClose': () => events.push('close'),
      },
    })
    await wrapper.get('.varo-drawer__close').trigger('click')
    expect(events).toEqual(['request:false'])
    expect(wrapper.find('.varo-drawer__content').exists()).toBe(true)
    await wrapper.setProps({ disabled: true })
    await wrapper.get('.varo-drawer__overlay').trigger('click')
    expect(events).toEqual(['request:false'])
    await wrapper.setProps({ disabled: false, onOpenChange: () => events.push('accepted') })
    await wrapper.get('.varo-drawer__close').trigger('click')
    expect(events).toEqual(['request:false', 'accepted', 'update:false', 'close'])
    expect(wrapper.find('.varo-drawer__content').exists()).toBe(true)
    await wrapper.setProps({ open: false })
    expect(wrapper.find('.varo-drawer__content').exists()).toBe(false)
  })

  it('cancels Dialog tuple requests before updating uncontrolled state', async () => {
    const events: string[] = []
    let cancelClose = true
    const wrapper = mount(VDialogRoot, {
      props: {
        'defaultOpen': true,
        'open': nativeUnset,
        'onOpenChange': ([open, details]: [boolean, DialogOpenChangeDetails]) => {
          events.push(`request:${open}:${details.reason}`)
          if (!open && cancelClose) { details.cancel() }
        },
        'onUpdate:open': (open: boolean) => events.push(`update:${open}`),
      },
      slots: {
        default: () => h(VDialogContent, null, {
          default: () => h(VDialogClose, null, { default: () => 'Close' }),
        }),
      },
    })
    expect(wrapper.find('.varo-dialog__content').exists()).toBe(true)
    await wrapper.get('.varo-dialog__close').trigger('click')
    expect(events).toEqual(['request:false:close-press'])
    expect(wrapper.find('.varo-dialog__content').exists()).toBe(true)

    cancelClose = false
    await wrapper.get('.varo-dialog__close').trigger('click')
    expect(events).toEqual(['request:false:close-press', 'request:false:close-press', 'update:false'])
    expect(wrapper.find('.varo-dialog__content').exists()).toBe(false)
  })

  it('blocks disabled Dialog requests and leaves controlled visibility to the parent', async () => {
    const events: string[] = []
    const wrapper = mount(VDialogRoot, {
      props: {
        'open': false,
        'disabled': true,
        'onOpenChange': ([open, details]: [boolean, DialogOpenChangeDetails]) => {
          events.push(`request:${open}:${details.reason}`)
        },
        'onUpdate:open': (open: boolean) => events.push(`update:${open}`),
      },
      slots: {
        default: () => [
          h(VDialogTrigger, null, { default: () => 'Open' }),
          h(VDialogContent, null, { default: () => 'Content' }),
        ],
      },
    })
    await wrapper.get('.varo-dialog__trigger').trigger('click')
    expect(events).toEqual([])
    expect(wrapper.find('.varo-dialog__content').exists()).toBe(false)

    await wrapper.setProps({ disabled: false })
    await wrapper.get('.varo-dialog__trigger').trigger('click')
    expect(events).toEqual(['request:true:trigger-press', 'update:true'])
    expect(wrapper.find('.varo-dialog__content').exists()).toBe(false)
    await wrapper.setProps({ open: true })
    expect(wrapper.find('.varo-dialog__content').exists()).toBe(true)
    expect(events).toEqual(['request:true:trigger-press', 'update:true'])
  })

  it('formats accepted input before change events and ignores readonly, disabled, and no-op input', async () => {
    const events: string[] = []
    const wrapper = mount(VInput, {
      props: {
        'defaultValue': 'AB',
        'value': nativeUnset,
        'readonly': true,
        'formatter': (value: string) => value.toUpperCase(),
        'maxLength': 3,
        'onUpdate:value': (value: string) => events.push(`update:${value}`),
        'onValueChange': (value: string) => events.push(`change:${value}`),
        'onInput': () => events.push('input'),
      },
    })
    const input = wrapper.get('input')
    expect(input.element.value).toBe('AB')
    await input.trigger('input', { detail: { value: 'blocked' } })
    await wrapper.setProps({ readonly: false, disabled: true })
    await input.trigger('input', { detail: { value: 'blocked' } })
    expect(events).toEqual([])
    await wrapper.setProps({ disabled: false })
    await input.trigger('input', { detail: { value: 'abcd' } })
    expect(events).toEqual(['update:ABC', 'change:ABC', 'input'])
    await input.trigger('input', { detail: { value: 'abc' } })
    expect(events).toEqual(['update:ABC', 'change:ABC', 'input'])
    expect(input.element.value).toBe('ABC')
  })

  it('blocks disabled form input and submit, then validates accepted model values', async () => {
    const model = reactive({ name: 'Ada' })
    const onSubmit = vi.fn()
    const onFailed = vi.fn()
    const wrapper = mount(VForm, {
      props: { disabled: true, model, rules: { name: 'required' }, onSubmit, onFailed },
      slots: {
        default: () => h(VFormItem, { name: 'name' }, {
          default: ({ field, setValue }: { field: { value: { value: string } }, setValue: (value: string) => void }) =>
            h(VInput, { 'value': field.value.value, 'onUpdate:value': setValue }),
        }),
      },
    })
    const input = wrapper.get('input')
    expect(input.element.disabled).toBe(true)
    await input.trigger('input', { detail: { value: 'blocked' } })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    const form = wrapper.vm.form
    expect(form.submitCount.value).toBe(0)
    expect(model.name).toBe('Ada')
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onFailed).not.toHaveBeenCalled()

    await wrapper.setProps({ disabled: false })
    await input.trigger('input', { detail: { value: '' } })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(onFailed).toHaveBeenCalledOnce()
    await input.trigger('input', { detail: { value: 'Grace' } })
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ values: { name: 'Grace' } }))
    expect(form.submitCount.value).toBe(2)
  })

  it('does not emit popup close again when already closed', async () => {
    const events: string[] = []
    const wrapper = mount(VPopup, {
      props: {
        'defaultVisible': true,
        'visible': nativeUnset,
        'closeable': true,
        'destroyOnClose': false,
        'onUpdate:visible': (visible: boolean) => events.push(`update:${visible}`),
        'onVisibleChange': (visible: boolean) => events.push(`change:${visible}`),
        'onClose': () => events.push('close'),
      },
    })
    await wrapper.get('.varo-popup__close').trigger('click')
    expect(wrapper.attributes('data-state')).toBe('closed')
    expect(events).toEqual(['update:false', 'change:false', 'close'])
    await wrapper.get('.varo-popup__close').trigger('click')
    expect(events).toEqual(['update:false', 'change:false', 'close'])
  })

  it('preserves native OTP normalization, leading zeros, and completion order', async () => {
    const events: string[] = []
    const wrapper = mount(VInputOtp, {
      props: {
        'length': 4,
        'value': nativeUnset,
        'defaultValue': '00',
        'onUpdate:value': (value: string) => events.push(`update:${value}`),
        'onValueChange': (value: string) => events.push(`change:${value}`),
        'onComplete': (value: string) => events.push(`complete:${value}`),
      },
    })
    expect(wrapper.findAll('.varo-input-otp__cell').map(cell => cell.text())).toEqual(['0', '0', '', ''])
    await wrapper.get('input').trigger('input', { detail: { value: '0a1234' } })
    expect(events).toEqual(['update:0123', 'change:0123', 'complete:0123'])
    expect(wrapper.findAll('.varo-input-otp__cell').map(cell => cell.text())).toEqual(['0', '1', '2', '3'])
  })
})
