# Form

## Demo

<FormComponentDemo example="form" locale="en" />

<FormComponentDemo example="form-array" locale="en" />

## Hooks

```ts
import { defineRule, useField, useForm } from '@varo-ui/headless'

defineRule('mobile', value => /^1\d{10}$/.test(String(value)) || 'Invalid mobile number')

const form = useForm({
  initialValues: { mobile: '' },
  rules: {
    mobile: [
      { required: true, trigger: 'change' },
      { validator: value => /^1\d{10}$/.test(String(value)) || 'Invalid mobile number', trigger: 'blur' }
    ]
  }
})

const mobile = useField(form, 'mobile')
```

## Zod / Standard Schema

`validationSchema` accepts Standard Schema v1, so a Zod 4 schema can be passed directly. Array issue paths become dot paths such as `companies.0.name`; dynamic arrays do not need generated `rules`.

```ts
import { z } from 'zod'

const companySchema = z.object({
  companies: z.array(z.object({
    name: z.string().min(2, 'Use at least 2 characters'),
    phone: z.string().regex(/^\d{11}$/, 'Enter an 11-digit phone number')
  })).min(1, 'Add at least one company')
})
```

```vue
<VForm :model="model" :validation-schema="companySchema">
  <!-- VFormItem name="companies.0.name" -->
</VForm>
```

Field `rules` and the schema can be combined. When both reject the same path, the field-rule error is shown first.

## Global preset

Call `configureForm` once in the application bootstrap. Local `rules`, `validationSchema`, and `validateOnChange` override the global preset.

```ts
import { configureForm } from '@varo-ui/headless'

configureForm({
  validateOnChange: true,
  rules: {
    email: 'required|email'
  }
})
```

SSR applications should configure each isolated application process during bootstrap rather than mutate the global preset per request. Tests can call `resetFormPreset()` for cleanup.

## Props

| Prop               | Type                      | Default     | Description                                |
| ------------------ | ------------------------- | ----------- | ------------------------------------------ |
| `model`            | `Record<string, unknown>` | `undefined` | Form values                                |
| `rules`            | `FormRules`               | `undefined` | Field rules; inherits the global preset    |
| `validationSchema` | `StandardSchemaV1`        | `undefined` | Standard Schema validator such as Zod      |
| `showError`        | `boolean`                 | `true`      | Show validation error                      |
| `validateOnChange` | `boolean`                 | `undefined` | Validate on change; inherits global preset |

## Events

| Event    | Payload              | Description       |
| -------- | -------------------- | ----------------- |
| `submit` | `{ values, errors }` | Validation passed |
| `failed` | `{ values, errors }` | Validation failed |
| `reset`  | `{ values, errors }` | Form reset        |
