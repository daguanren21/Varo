# InputOtp

## Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const code = ref('')
</script>

<template>
  <VInputOtp v-model:value="code" />
</template>
```

## Masking, separators, and validation

```vue
<template>
  <VInputOtp v-model:value="code" mask separator="·" />
  <VInputOtp v-model:value="code" :length="4" pattern="[0-9]" invalid />
  <VInputOtp v-model:value="code" disabled />
</template>
```

## Props

| Prop             | Type                   | Default               | Description                |
| ---------------- | ---------------------- | --------------------- | -------------------------- |
| `value`          | `string \| undefined`  | `undefined`           | Controlled value           |
| `defaultValue`   | `string`               | `''`                  | Uncontrolled initial value |
| `length`         | `number`               | `6`                   | OTP length, minimum 1      |
| `pattern`        | `string \| RegExp`     | `'[0-9]'`             | Per-character validation   |
| `inputMode`      | `InputMode`            | `'numeric'`           | Native input mode          |
| `inputAriaLabel` | `string`               | `'One-time password'` | Accessible input name      |
| `size`           | `'sm' \| 'md' \| 'lg'` | `'md'`                | Cell size                  |
| `separator`      | `string`               | `undefined`           | Separator between cells    |
| `mask`           | `boolean`              | `false`               | Mask entered characters    |
| `disabled`       | `boolean`              | `false`               | Disable input              |
| `invalid`        | `boolean`              | `false`               | Invalid state              |
| `readonly`       | `boolean`              | `false`               | Read-only state            |

## Events

| Event          | Payload                              | Description            |
| -------------- | ------------------------------------ | ---------------------- |
| `update:value` | `string`                             | Value update           |
| `valueChange`  | `string`                             | Value change           |
| `complete`     | `string`                             | Value reached `length` |
| `focus`        | H5: `FocusEvent`; native: host event | Input focused          |
| `blur`         | H5: `FocusEvent`; native: host event | Input blurred          |

::: info Weapp input
Weapp uses one native `input` for typing and paste, with visual cells rendered above it. It uses a text value with numeric keyboard mode so codes such as `012345` retain their leading zero. Pass `value=""` explicitly when controlling an empty value.
:::
