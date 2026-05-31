# Input

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const value = ref('')
</script>

<template>
  <VInput v-model:value="value" placeholder="Type here" />
  <VInput default-value="Default content" />
</template>
```

## Clearable And Word Limit

```vue
<template>
  <VInput v-model:value="value" clearable placeholder="Type here" />
  <VInput v-model:value="value" :max-length="20" show-word-limit />
  <VInput v-model:value="value" clearable clear-trigger="always" />
</template>
```

## Formatting

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

## Textarea

```vue
<template>
  <VInput type="textarea" :rows="3" placeholder="Notes" />
  <VInput type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" />
</template>
```

## Alignment, Affixes, And State

```vue
<template>
  <VInput label="Name" placeholder="Type a name" />
  <VInput prefix-icon="Search" suffix-icon="Done" />
  <VInput align="right" value="Right aligned" />
  <VInput readonly value="Readonly content" />
  <VInput disabled value="Disabled content" />
  <VInput invalid error-message="Enter a valid value" />
</template>
```

## Cross-Platform Demo

<PlatformTabsDemo example="input" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| undefined` | `undefined` | Controlled value |
| `defaultValue` | `string` | `''` | Initial uncontrolled value |
| `placeholder` | `string \| undefined` | `undefined` | Placeholder text |
| `type` | `string` | `'text'` | Input type; `textarea` renders a textarea |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment |
| `disabled` | `boolean` | `false` | Disabled state |
| `readonly` | `boolean` | `false` | Readonly state |
| `invalid` | `boolean` | `false` | Invalid state |
| `clearable` | `boolean` | `false` | Show a clear control |
| `clearTrigger` | `'focus' \| 'always'` | `'focus'` | When the clear control is visible |
| `maxLength` | `number \| string` | `undefined` | Maximum input length |
| `showWordLimit` | `boolean` | `false` | Show word count |
| `formatter` | `(value: string) => string` | `undefined` | Value formatter |
| `formatTrigger` | `'onInput' \| 'onBlur'` | `'onInput'` | Formatter trigger |
| `rows` | `number \| string` | `undefined` | Textarea rows |
| `autosize` | `boolean \| { minRows?: number; maxRows?: number }` | `false` | Textarea autosize |
| `label` | `string` | `undefined` | Left label |
| `labelWidth` | `number \| string` | `undefined` | Label width |
| `prefixIcon` | `string` | `undefined` | Prefix content |
| `suffixIcon` | `string` | `undefined` | Suffix content |
| `errorMessage` | `string` | `undefined` | Error message |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string` | Value update |
| `valueChange` | `string` | Value change |
| `clear` | `MouseEvent` | Clear control click |
| `focus` | `FocusEvent` | Focus |
| `blur` | `FocusEvent` | Blur |

## Slots

| Slot | Description |
| --- | --- |
| `label` | Custom label |
| `prefix` | Custom prefix |
| `suffix` | Custom suffix |

## Data Attributes

| Attribute | Description |
| --- | --- |
| `data-size` | Current size |
| `data-align` | Current alignment |
| `data-clearable` | Clearable state |
| `data-focused` | Focus state |
| `data-invalid` | Invalid state |
| `data-readonly` | Readonly state |
| `data-disabled` | Disabled state |
