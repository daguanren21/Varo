# Form 表单

## 演示

<FormComponentDemo example="form" locale="zh" />

<FormComponentDemo example="form-array" locale="zh" />

## Hooks

```ts
import { defineRule, useField, useForm } from '@varo-ui/headless'

defineRule('mobile', value => /^1\d{10}$/.test(String(value)) || '请输入手机号')

const form = useForm({
  initialValues: { mobile: '' },
  rules: {
    mobile: [
      { required: true, trigger: 'change' },
      { validator: value => /^1\d{10}$/.test(String(value)) || '请输入手机号', trigger: 'blur' }
    ]
  }
})

const mobile = useField(form, 'mobile')
```

## Props

| Prop               | 类型                      | 默认值      | 描述         |
| ------------------ | ------------------------- | ----------- | ------------ |
| `model`            | `Record<string, unknown>` | `undefined` | 表单数据     |
| `rules`            | `FormRules`               | `{}`        | 校验规则     |
| `showError`        | `boolean`                 | `true`      | 展示错误信息 |
| `validateOnChange` | `boolean`                 | `false`     | 值变化时校验 |

## Events

| Event    | Payload              | 描述     |
| -------- | -------------------- | -------- |
| `submit` | `{ values, errors }` | 校验通过 |
| `failed` | `{ values, errors }` | 校验失败 |
| `reset`  | `{ values, errors }` | 重置     |
