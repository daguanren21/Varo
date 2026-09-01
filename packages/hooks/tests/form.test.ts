import { configureForm, defineRule, resetFormPreset, useField, useForm } from '@varo/hooks'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

describe('form hooks', () => {
  it('validates built-in string and object rules', async () => {
    const form = useForm({
      initialValues: {
        username: '',
        password: '123',
      },
      rules: {
        username: 'required',
        password: { required: true, min: 6 },
      },
    })

    const invalid = await form.validate()

    expect(invalid.valid).toBe(false)
    expect(invalid.errors.username).toContain('username')
    expect(invalid.errors.password).toContain('6')

    form.setFieldValue('username', 'varocode')
    form.setFieldValue('password', '123456')

    await expect(form.validate()).resolves.toMatchObject({
      valid: true,
      errors: {},
    })
  })

  it('uses Chinese default messages for built-in rules', async () => {
    const form = useForm({
      initialValues: {
        email: 'bad',
        password: '123',
        shortPassword: '',
      },
      rules: {
        email: 'email',
        password: { length: 6 },
        shortPassword: 'required',
      },
    })

    const result = await form.validate()

    expect(result.errors.shortPassword).toBe('shortPassword 为必填项')
    expect(result.errors.password).toBe('password 长度必须为 6')
    expect(result.errors.email).toBe('email 请输入有效邮箱')
  })

  it('supports custom rules and useField helpers', async () => {
    defineRule('startsWithV', (value) => {
      return String(value).startsWith('V') || 'Name must start with V'
    })

    const form = useForm({
      initialValues: {
        name: 'Atom',
      },
    })
    const field = useField(form, 'name', {
      rules: 'required|startsWithV',
      label: 'Name',
    })

    await expect(field.validate()).resolves.toMatchObject({
      valid: false,
      errors: ['Name must start with V'],
    })
    expect(field.errorMessage.value).toBe('Name must start with V')

    field.value.value = 'Varo'

    await expect(field.validate()).resolves.toMatchObject({
      valid: true,
      errors: [],
    })
    expect(field.errorMessage.value).toBe('')
    expect(form.values.value.name).toBe('Varo')
  })

  it('calls valid and invalid submit handlers', async () => {
    const onValid = vi.fn()
    const onInvalid = vi.fn()
    const form = useForm({
      initialValues: {
        email: '',
      },
      rules: {
        email: 'required|email',
      },
    })
    const submit = form.handleSubmit(onValid, onInvalid)

    await submit({ type: 'submit' })

    expect(onValid).not.toHaveBeenCalled()
    expect(onInvalid).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: expect.objectContaining({ email: expect.any(String) }),
        event: { type: 'submit' },
      }),
    )

    form.setFieldValue('email', 'team@varo.dev')
    await submit()

    expect(onValid).toHaveBeenCalledWith(
      expect.objectContaining({
        values: expect.objectContaining({ email: 'team@varo.dev' }),
      }),
    )
  })

  it('resets values and field meta', async () => {
    const form = useForm({
      initialValues: {
        count: 1,
      },
      rules: {
        count: { min: 2 },
      },
    })

    form.setFieldValue('count', 0)
    form.setFieldTouched('count', true)
    await form.validateField('count')

    expect(form.dirty.value.count).toBe(true)
    expect(form.touched.value.count).toBe(true)
    expect(form.errors.value.count).toBeTruthy()

    form.reset({ count: 3 })

    expect(form.values.value.count).toBe(3)
    expect(form.dirty.value).toEqual({})
    expect(form.touched.value).toEqual({})
    expect(form.errors.value).toEqual({})
  })

  it('filters field validation by rule trigger', async () => {
    const form = useForm({
      initialValues: {
        email: '',
      },
      rules: {
        email: [
          { required: true, trigger: 'change' },
          { email: true, trigger: 'blur' },
        ],
      },
    })

    await expect(form.validateField('email', 'change')).resolves.toMatchObject({
      errors: [expect.stringContaining('email')],
      valid: false,
    })

    form.setFieldValue('email', 'team')

    await expect(form.validateField('email', 'change')).resolves.toMatchObject({
      errors: [],
      valid: true,
    })
    expect(form.errors.value.email).toBeUndefined()

    await expect(form.validateField('email', 'blur')).resolves.toMatchObject({
      errors: [expect.stringContaining('请输入有效邮箱')],
      valid: false,
    })

    form.setFieldValue('email', 'team@varo.dev')

    await expect(form.validate()).resolves.toMatchObject({
      errors: {},
      valid: true,
    })
  })
  it('validates dynamic nested fields with a Standard Schema compatible Zod schema', async () => {
    const form = useForm({
      initialValues: {
        companies: [
          {
            employeeCount: 0,
            name: '',
          },
        ],
      },
      validationSchema: z.object({
        companies: z.array(
          z.object({
            employeeCount: z.number().min(1, '员工数至少为 1'),
            name: z.string().min(1, '请输入企业名称'),
          }),
        ).min(1, '请至少添加一家企业'),
      }),
    })

    await expect(form.validate()).resolves.toMatchObject({
      errors: {
        'companies.0.employeeCount': '员工数至少为 1',
        'companies.0.name': '请输入企业名称',
      },
      valid: false,
    })
    await expect(form.validateField('companies.0.name')).resolves.toEqual({
      errors: ['请输入企业名称'],
      valid: false,
    })

    form.setFieldValue('companies.0.employeeCount', 12)
    form.setFieldValue('companies.0.name', 'Varo 科技')

    await expect(form.validate()).resolves.toMatchObject({
      errors: {},
      valid: true,
    })
  })

  it('uses global form presets while letting local options take precedence', async () => {
    configureForm({
      rules: {
        email: 'required',
      },
      validateOnChange: true,
    })

    try {
      const presetForm = useForm({
        initialValues: {
          email: '',
        },
      })
      expect(presetForm.validateOnChange).toBe(true)
      await expect(presetForm.validate()).resolves.toMatchObject({
        errors: {
          email: expect.stringContaining('必填'),
        },
        valid: false,
      })

      const locallyConfiguredForm = useForm({
        initialValues: {
          email: '',
        },
        rules: {
          email: 'email',
        },
        validateOnChange: false,
      })
      expect(locallyConfiguredForm.validateOnChange).toBe(false)
      await expect(locallyConfiguredForm.validate()).resolves.toMatchObject({
        errors: {},
        valid: true,
      })
    }
    finally {
      resetFormPreset()
    }
  })
})
