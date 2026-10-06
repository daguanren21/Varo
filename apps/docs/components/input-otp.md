# InputOtp

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const code = ref('')
</script>

<template>
  <VInputOtp v-model:value="code" />
</template>
```

## 掩码、分隔符与校验

```vue
<template>
  <VInputOtp v-model:value="code" mask separator="·" />
  <VInputOtp v-model:value="code" :length="4" pattern="[0-9]" invalid />
  <VInputOtp v-model:value="code" disabled />
</template>
```

## Props

| Prop             | 类型                   | 默认值                | 描述                 |
| ---------------- | ---------------------- | --------------------- | -------------------- |
| `value`          | `string \| undefined`  | `undefined`           | 受控值               |
| `defaultValue`   | `string`               | `''`                  | 非受控初始值         |
| `length`         | `number`               | `6`                   | OTP 位数，至少为 1   |
| `pattern`        | `string \| RegExp`     | `'[0-9]'`             | 单字符校验规则       |
| `inputMode`      | `InputMode`            | `'numeric'`           | 原生输入模式         |
| `inputAriaLabel` | `string`               | `'One-time password'` | 输入控件可访问名称   |
| `size`           | `'sm' \| 'md' \| 'lg'` | `'md'`                | 单元格尺寸           |
| `separator`      | `string`               | `undefined`           | 单元格之间的分隔符   |
| `mask`           | `boolean`              | `false`               | 已输入字符显示为掩码 |
| `disabled`       | `boolean`              | `false`               | 禁用输入             |
| `invalid`        | `boolean`              | `false`               | 非法状态             |
| `readonly`       | `boolean`              | `false`               | 只读状态             |

## Events

| Event          | Payload                          | 描述              |
| -------------- | -------------------------------- | ----------------- |
| `update:value` | `string`                         | 值更新            |
| `valueChange`  | `string`                         | 值变化            |
| `complete`     | `string`                         | 输入达到 `length` |
| `focus`        | H5: `FocusEvent`；原生: 宿主事件 | 输入聚焦          |
| `blur`         | H5: `FocusEvent`；原生: 宿主事件 | 输入失焦          |

::: info Weapp 输入
Weapp 使用单个原生 `input` 捕获输入和粘贴，再由可编辑单元格视图展示 OTP。输入使用文本值配合数字键盘模式，以保留 `012345` 这类验证码的前导零。受控空值请显式传入 `value=""`。
:::
