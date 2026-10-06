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

## Zod / Standard Schema

`validationSchema` 接受 Standard Schema v1，因此可以直接传入 Zod 4 schema。数组 issue 的路径会映射为 `companies.0.name`，无需为每个动态索引生成 `rules`。

```ts
import { z } from 'zod'

const companySchema = z.object({
  companies: z.array(z.object({
    name: z.string().min(2, '公司名称至少 2 个字符'),
    phone: z.string().regex(/^\d{11}$/, '请输入 11 位手机号')
  })).min(1, '请至少添加一家公司')
})
```

```vue
<VForm :model="model" :validation-schema="companySchema">
  <!-- VFormItem name="companies.0.name" -->
</VForm>
```

字段 `rules` 与 schema 可以并用；同一路径都失败时优先展示字段规则错误。

## 全局预设

在应用启动入口调用一次 `configureForm`。局部 `rules`、`validationSchema` 和 `validateOnChange` 会覆盖全局预设。

```ts
import { configureForm } from '@varo-ui/headless'

configureForm({
  validateOnChange: true,
  rules: {
    email: 'required|email'
  }
})
```

服务端渲染应用应在每个隔离的应用进程启动时配置，而不是在请求处理中修改全局预设。测试可调用 `resetFormPreset()` 清理状态。

## Props

| Prop               | 类型                      | 默认值      | 描述                               |
| ------------------ | ------------------------- | ----------- | ---------------------------------- |
| `model`            | `Record<string, unknown>` | `undefined` | 表单数据                           |
| `rules`            | `FormRules`               | `undefined` | 字段校验规则；继承全局预设         |
| `validationSchema` | `StandardSchemaV1`        | `undefined` | Zod 等 Standard Schema 校验器      |
| `showError`        | `boolean`                 | `true`      | 展示错误信息                       |
| `validateOnChange` | `boolean`                 | `undefined` | 值变化时校验；继承全局预设         |
| `disabled`         | `boolean`                 | `false`     | 禁止提交，并向字段控件传递禁用状态 |

## FormItem Props

| Prop              | 类型                             | 默认值      | 描述                         |
| ----------------- | -------------------------------- | ----------- | ---------------------------- |
| `name`            | `string`                         | —           | 字段名称                     |
| `label`           | `string`                         | `undefined` | 字段标签                     |
| `description`     | `string`                         | `undefined` | 字段辅助说明                 |
| `required`        | `boolean`                        | `false`     | 必填并自动合并 required 规则 |
| `validateTrigger` | `'submit' \| 'change' \| 'blur'` | `'submit'`  | 校验触发时机                 |

## Events

| Event    | Payload              | 描述               |
| -------- | -------------------- | ------------------ |
| `submit` | `SubmitPayload`      | 校验通过后触发一次 |
| `failed` | `SubmitPayload`      | 校验失败后触发一次 |
| `reset`  | `{ values, errors }` | 重置               |

`submit` / `failed` 接收 `@varo-ui/headless` 导出的具名 `SubmitPayload`，组件的 `FormSubmitPayload` 是它的类型别名，不是原始 DOM 事件，也不从具体函数的 `ReturnType` 推导：

```ts
import type { SubmitPayload } from '@varo-ui/headless'

function onSubmit({ values, errors, event }: SubmitPayload) {
  console.log(values, errors, event)
}
```

payload 包含 `values`、`errors` 与可选 `event?: unknown`。H5 的 `event` 来自表单 DOM 提交；原生端是宿主事件，程序调用时可省略，不能无条件断言为浏览器 `SubmitEvent`。校验完成后只触发成功或失败分支；`disabled` 阻止提交。`reset` 仍使用表中 `{ values, errors }`，不附带提交事件。
