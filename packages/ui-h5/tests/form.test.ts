import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, reactive, ref } from 'vue'
import { VForm, VFormItem } from '../src/form'
import { VInput } from '../src/input'

describe('ui-h5 form', () => {
  it('validates model values and emits failed or submit events', async () => {
    const onSubmit = vi.fn()
    const onFailed = vi.fn()
    const model = reactive({
      mobile: ''
    })
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VForm,
              {
                model,
                rules: {
                  mobile: 'required|length:11'
                },
                onFailed,
                onSubmit
              },
              {
                default: () => [
                  h(
                    VFormItem,
                    {
                      label: 'Mobile',
                      name: 'mobile'
                    },
                    {
                      default: () =>
                        h(VInput, {
                          value: model.mobile,
                          'onUpdate:value': (value: string) => {
                            model.mobile = value
                          }
                        })
                    }
                  ),
                  h('button', { type: 'submit' }, 'Submit')
                ]
              }
            )
        }
      })
    )

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(onSubmit).not.toHaveBeenCalled()
    expect(onFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.objectContaining({ mobile: expect.any(String) }),
        values: expect.objectContaining({ mobile: '' })
      })
    )
    expect(wrapper.get('.varo-form-item__error').text()).toContain('Mobile')

    await wrapper.get('input').setValue('13800138000')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ mobile: '13800138000' })
      })
    )
  })

  it('supports field-level rules and scoped slot state', async () => {
    const model = reactive({
      code: ''
    })
    const wrapper = mount(VForm, {
      props: {
        model
      },
      slots: {
        default: () =>
          h(
            VFormItem,
            {
              label: 'Code',
              name: 'code',
              rules: { required: true, min: 4 }
            },
            {
              default: ({ field }: { field: { value: { value: string } } }) =>
                h('input', {
                  value: field.value.value,
                  onInput: (event: Event) => {
                    field.value.value = (event.target as HTMLInputElement).value
                  }
                })
            }
          )
      }
    })

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('.varo-form-item').attributes('data-invalid')).toBe('true')
    expect(wrapper.get('.varo-form-item__error').text()).toContain('Code')

    await wrapper.get('input').setValue('1234')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.varo-form-item__error').exists()).toBe(false)
    expect(model.code).toBe('1234')
  })

  it('validates field changes when form item trigger is change', async () => {
    const model = reactive({
      mobile: ''
    })
    const wrapper = mount(VForm, {
      props: {
        model
      },
      slots: {
        default: () =>
          h(
            VFormItem,
            {
              label: 'Mobile',
              name: 'mobile',
              rules: 'required|length:11',
              validateTrigger: 'change'
            },
            {
              default: ({ setValue, value }: { setValue: (value: string) => void; value: { value: string } }) =>
                h(VInput, {
                  value: value.value,
                  'onUpdate:value': setValue
                })
            }
          )
      }
    })

    await wrapper.get('input').setValue('138')
    await flushPromises()

    expect(wrapper.get('.varo-form-item__error').text()).toContain('Mobile')

    await wrapper.get('input').setValue('13800138000')
    await flushPromises()

    expect(wrapper.find('.varo-form-item__error').exists()).toBe(false)
    expect(model.mobile).toBe('13800138000')
  })

  it('validates change and blur according to rule trigger config', async () => {
    const model = reactive({
      email: ''
    })
    const wrapper = mount(VForm, {
      props: {
        model,
        rules: {
          email: [
            { required: true, trigger: 'change' },
            { email: true, trigger: 'blur' }
          ]
        }
      },
      slots: {
        default: () =>
          h(
            VFormItem,
            {
              label: 'Email',
              name: 'email'
            },
            {
              default: ({ onBlur, setValue, value }: { onBlur: (event?: FocusEvent) => void; setValue: (value: string) => void; value: { value: string } }) =>
                h(VInput, {
                  value: value.value,
                  onBlur,
                  'onUpdate:value': setValue
                })
            }
          )
      }
    })

    await wrapper.get('input').setValue('team')
    await flushPromises()

    expect(wrapper.find('.varo-form-item__error').exists()).toBe(false)

    await wrapper.get('input').trigger('blur')
    await flushPromises()

    expect(wrapper.get('.varo-form-item__error').text()).toContain('请输入有效邮箱')
  })

  it('supports dynamic array field paths and unregisters removed items', async () => {
    const model = reactive({
      companies: [
        { name: '', contact: '', phone: '' },
        { name: '', contact: '', phone: '' }
      ]
    })
    const showSecond = ref(true)
    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              VForm,
              {
                model
              },
              {
                default: () => [
                  h(
                    VFormItem,
                    {
                      label: '公司 1',
                      name: 'companies.0.name',
                      rules: { required: true }
                    },
                    {
                      default: ({ setValue, value }: { setValue: (value: string) => void; value: { value: string } }) =>
                        h(VInput, {
                          value: value.value,
                          'onUpdate:value': setValue
                        })
                    }
                  ),
                  h(
                    VFormItem,
                    {
                      label: '公司 1 联系人',
                      name: 'companies.0.contact',
                      rules: { required: true }
                    },
                    {
                      default: ({ setValue, value }: { setValue: (value: string) => void; value: { value: string } }) =>
                        h(VInput, {
                          value: value.value,
                          'onUpdate:value': setValue
                        })
                    }
                  ),
                  showSecond.value
                    ? h(
                        'div',
                        [
                          h(
                            VFormItem,
                            {
                              label: '公司 2 名称',
                              name: 'companies.1.name',
                              rules: { required: true }
                            },
                            {
                              default: ({ setValue, value }: { setValue: (value: string) => void; value: { value: string } }) =>
                                h(VInput, {
                                  value: value.value,
                                  'onUpdate:value': setValue
                                })
                            }
                          ),
                          h(
                            VFormItem,
                            {
                              label: '公司 2 电话',
                              name: 'companies.1.phone',
                              rules: { required: true, length: 11 }
                            },
                            {
                              default: ({ setValue, value }: { setValue: (value: string) => void; value: { value: string } }) =>
                                h(VInput, {
                                  value: value.value,
                                  'onUpdate:value': setValue
                                })
                            }
                          )
                        ]
                      )
                    : null,
                  h(
                    'button',
                    {
                      class: 'toggle-company',
                      type: 'button',
                      onClick: () => {
                        model.companies.splice(1, 1)
                        showSecond.value = false
                      }
                    },
                    'Remove'
                  ),
                  h('button', { class: 'submit-form', type: 'submit' }, 'Submit')
                ]
              }
            )
        }
      })
    )

    const inputs = wrapper.findAll('input')
    await inputs[0]!.setValue('Acme')
    await inputs[1]!.setValue('Alice')
    await inputs[2]!.setValue('Globex')
    await inputs[3]!.setValue('13800138000')
    await flushPromises()

    expect(Array.isArray(model.companies)).toBe(true)
    expect(model.companies[0]?.name).toBe('Acme')
    expect(model.companies[0]?.contact).toBe('Alice')
    expect(model.companies[1]?.name).toBe('Globex')
    expect(model.companies[1]?.phone).toBe('13800138000')

    await wrapper.get('.toggle-company').trigger('click')
    await flushPromises()
    await wrapper.get('.submit-form').trigger('click')
    await flushPromises()

    expect(model.companies).toHaveLength(1)
    expect(wrapper.findAll('.varo-form-item')).toHaveLength(2)
    expect(wrapper.findAll('.varo-form-item__error')).toHaveLength(0)
  })
})
