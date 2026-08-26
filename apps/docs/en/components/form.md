# Form

## Demo

<FormComponentDemo example="form" locale="en" />

<FormComponentDemo example="form-array" locale="en" />

## Hooks

```ts
import { defineRule, useField, useForm } from '@varo/hooks'

defineRule('mobile', (value) => /^1\d{10}$/.test(String(value)) || 'Invalid mobile number')

const form = useForm({
  initialValues: { mobile: '' },
  rules: {
    mobile: [
      { required: true, trigger: 'change' },
      { validator: (value) => /^1\d{10}$/.test(String(value)) || 'Invalid mobile number', trigger: 'blur' }
    ]
  }
})

const mobile = useField(form, 'mobile')
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `model` | `Record<string, unknown>` | `undefined` | Form values |
| `rules` | `FormRules` | `{}` | Validation rules |
| `showError` | `boolean` | `true` | Show validation error |
| `validateOnChange` | `boolean` | `false` | Validate when values change |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `submit` | `{ values, errors }` | Validation passed |
| `failed` | `{ values, errors }` | Validation failed |
| `reset` | `{ values, errors }` | Form reset |
