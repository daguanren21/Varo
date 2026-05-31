# Input

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <VInput v-model:value="value" placeholder="请输入内容" />
  <VInput default-value="默认内容" />
</template>
```

## 清空与字数统计

```vue
<template>
  <VInput v-model:value="value" clearable placeholder="请输入内容" />
  <VInput v-model:value="value" :max-length="20" show-word-limit />
  <VInput v-model:value="value" clearable clear-trigger="always" />
</template>
```

## 格式化输入

```vue
<script setup lang="ts">
const trim = (value: string) => value.trim()
const digits = (value: string) => value.replace(/\D/g, '')
</script>

<template>
  <VInput v-model:value="value" :formatter="trim" format-trigger="onBlur" />
  <VInput v-model:value="phone" :formatter="digits" :max-length="11" />
</template>
```

## 文本域

```vue
<template>
  <VInput type="textarea" :rows="3" placeholder="请输入备注" />
  <VInput type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" />
</template>
```

## 对齐、前后缀与状态

```vue
<template>
  <VInput label="姓名" placeholder="请输入姓名" />
  <VInput prefix-icon="搜索" suffix-icon="完成" />
  <VInput align="right" value="右对齐" />
  <VInput readonly value="只读内容" />
  <VInput disabled value="禁用内容" />
  <VInput invalid error-message="请输入有效内容" />
</template>
```

## 跨端演示

<PlatformTabsDemo example="input" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `value` | `string \| undefined` | `undefined` | 受控值 |
| `defaultValue` | `string` | `''` | 非受控初始值 |
| `placeholder` | `string \| undefined` | `undefined` | 占位文本 |
| `type` | `string` | `'text'` | 输入类型，`textarea` 会渲染文本域 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 输入内容对齐 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `invalid` | `boolean` | `false` | 非法状态 |
| `clearable` | `boolean` | `false` | 展示清空按钮 |
| `clearTrigger` | `'focus' \| 'always'` | `'focus'` | 清空按钮显示时机 |
| `maxLength` | `number \| string` | `undefined` | 最大输入长度 |
| `showWordLimit` | `boolean` | `false` | 展示字数统计 |
| `formatter` | `(value: string) => string` | `undefined` | 输入格式化函数 |
| `formatTrigger` | `'onInput' \| 'onBlur'` | `'onInput'` | 格式化触发时机 |
| `rows` | `number \| string` | `undefined` | textarea 行数 |
| `autosize` | `boolean \| { minRows?: number; maxRows?: number }` | `false` | textarea 自适应高度 |
| `label` | `string` | `undefined` | 左侧标签 |
| `labelWidth` | `number \| string` | `undefined` | 标签宽度 |
| `prefixIcon` | `string` | `undefined` | 前缀内容 |
| `suffixIcon` | `string` | `undefined` | 后缀内容 |
| `errorMessage` | `string` | `undefined` | 错误文案 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:value` | `string` | 值更新 |
| `valueChange` | `string` | 值变化 |
| `clear` | `MouseEvent` | 点击清空 |
| `focus` | `FocusEvent` | 聚焦 |
| `blur` | `FocusEvent` | 失焦 |

## Slots

| Slot | 描述 |
| --- | --- |
| `label` | 自定义标签 |
| `prefix` | 自定义前缀 |
| `suffix` | 自定义后缀 |

## Data Attributes

| Attribute | 描述 |
| --- | --- |
| `data-size` | 当前尺寸 |
| `data-align` | 当前对齐方式 |
| `data-clearable` | 是否允许清空 |
| `data-focused` | 是否聚焦 |
| `data-invalid` | 是否非法 |
| `data-readonly` | 是否只读 |
| `data-disabled` | 是否禁用 |
