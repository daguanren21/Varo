# Form

## Demo

<FormComponentDemo example="form" locale="en" />

<FormComponentDemo example="form-array" locale="en" />

## Native Weapp model binding

Native properties carry snapshots. Bind controls to the page-owned `model` and handle `VForm`'s `update:model` event so resets and form methods update that page state:

```vue
<script setup lang="ts">
import type { FormValues } from '@varo-ui/headless'
import { reactive } from 'wevu'
import VFormItem from '@/components/ui/v-form-item.vue'
import VForm from '@/components/ui/v-form.vue'
import VInput from '@/components/ui/v-input.vue'

const model = reactive({ name: '' })
function updateModel(values: FormValues) {
  Object.assign(model, values)
}
function updateName(value: string) {
  model.name = value
}
</script>

<template>
  <VForm :model="model" @update:model="updateModel">
    <VFormItem name="name" label="Name" required>
      <VInput :value="model.name" @update:value="updateName" />
    </VFormItem>
  </VForm>
</template>
```

For dynamic arrays, update the complete page-model path in a script handler, such as `model.companies[index].name`. Native templates use explicit `:value` / `@update:value` bindings. To validate on input or blur, call `validateField(path, 'change' | 'blur')` through the form component ref after `nextTick()` has synchronized the native properties.

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

| Prop               | Type                      | Default     | Description                                                      |
| ------------------ | ------------------------- | ----------- | ---------------------------------------------------------------- |
| `model`            | `Record<string, unknown>` | `undefined` | Form values                                                      |
| `rules`            | `FormRules`               | `undefined` | Field rules; inherits the global preset                          |
| `validationSchema` | `StandardSchemaV1`        | `undefined` | Standard Schema validator such as Zod                            |
| `showError`        | `boolean`                 | `true`      | Show validation error                                            |
| `validateOnChange` | `boolean`                 | `undefined` | Validate on change; inherits global preset                       |
| `disabled`         | `boolean`                 | `false`     | Reject submission and propagate disabled state to field controls |

## FormItem Props

| Prop              | Type                             | Default     | Description                  |
| ----------------- | -------------------------------- | ----------- | ---------------------------- |
| `name`            | `string`                         | —           | Field name                   |
| `label`           | `string`                         | `undefined` | Field label                  |
| `description`     | `string`                         | `undefined` | Supporting field description |
| `required`        | `boolean`                        | `false`     | Adds the required rule       |
| `validateTrigger` | `'submit' \| 'change' \| 'blur'` | `'submit'`  | Validation trigger           |

## Events

| Event          | Payload              | Description                                                   |
| -------------- | -------------------- | ------------------------------------------------------------- |
| `submit`       | `SubmitPayload`      | Emitted once after successful validation                      |
| `failed`       | `SubmitPayload`      | Emitted once after failed validation                          |
| `reset`        | `{ values, errors }` | Form reset                                                    |
| `update:model` | `FormValues`         | Native controlled form requests replacement of the page model |

`submit` / `failed` receive the named `SubmitPayload` exported by `@varo-ui/headless`. The component's `FormSubmitPayload` aliases this type; it is neither a raw DOM event nor a type inferred through a concrete function's `ReturnType`:

```ts
import type { SubmitPayload } from '@varo-ui/headless'

function onSubmit({ values, errors, event }: SubmitPayload) {
  console.log(values, errors, event)
}
```

The payload contains `values`, `errors`, and optional `event?: unknown`. H5 supplies the DOM form event; native consumers receive a host event, and programmatic calls may omit it. Do not assume a browser `SubmitEvent`. Validation selects exactly one success/failure branch; `disabled` rejects submission. `reset` retains the `{ values, errors }` shape shown above without a submit event.
