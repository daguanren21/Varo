# Input

`VInput` 是官方 H5 封装层里的输入框组件，建立在 `InputRoot` primitive 之上，并继承 field 控制逻辑。

## 何时使用

- 表单文本输入
- 需要受控与非受控双模式的业务输入
- 需要统一 invalid、disabled、尺寸和主题 token 的场景

## Anatomy

<div class="component-anatomy">
  <strong>Input 由输入根节点与 field 状态协作组成。</strong>
  <ul>
    <li><code>InputRoot</code> 处理 value 同步、invalid 状态与 DOM 回写。</li>
    <li><code>useFieldRoot</code> 负责字段级别的 disabled、invalid 等共享语义。</li>
    <li><code>VInput</code> 再补齐尺寸、主题 class 与平台封装。</li>
  </ul>
</div>

## H5 示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-h5'

const value = ref('')
</script>

<template>
  <VInput v-model:value="value" placeholder="请输入内容" />
  <VInput default-value="默认内容" />
</template>
```

## 小程序示例

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VInput } from '@varo/ui-weapp'

const mobile = ref('')
</script>

<template>
  <VInput v-model:value="mobile" placeholder="请输入手机号" />
</template>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| undefined` | `undefined` | 受控值 |
| `defaultValue` | `string` | `''` | 非受控初始值 |
| `placeholder` | `string \| undefined` | `undefined` | 输入占位文案 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 输入尺寸 token |
| `invalid` | `boolean` | `false` | 非法状态 |
| `disabled` | `boolean` | `false` | 禁用状态 |

## Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `update:value` | `string` | 受控模式下同步值 |
| `valueChange` | `string` | 值发生变化时触发 |

## Data Attributes

| Attribute | 说明 |
| --- | --- |
| `data-invalid` | 当前字段是否非法 |
| `data-disabled` | 当前字段是否禁用 |
| `aria-invalid` | 向无障碍层暴露非法状态 |

## 行为说明

- 受控模式下，组件会在输入事件后立刻把 DOM 值回写到当前 prop 值，避免视觉状态漂移
- `size` 只参与 theme class 计算，不会误透传到原生 `input` DOM 属性
- 小程序与 H5 在输入事件细节上存在平台差异，但对外部暴露的值同步契约保持一致

## 组合建议

<div class="component-note">
  <strong>推荐组合方式</strong>
  <ul>
    <li>表单容器统一维护字段状态时，优先使用受控模式。</li>
    <li>简单搜索框、筛选输入等场景可以先走非受控模式，再在提交时读取值。</li>
    <li>如果要扩展前缀、后缀、清空按钮等复杂 UI，建议从 primitives 层继续封装。</li>
  </ul>
</div>

## 无障碍与状态

- invalid 状态会同步到 `aria-invalid`
- disabled 状态会阻止继续交互
- 主题层只负责视觉反馈，不应该改变字段状态语义

## 相关文档

- [Button](/components/button)
- [Dialog](/components/dialog)
- [国际化配置](/guide/i18n)
- [小程序示例](/examples/weapp)