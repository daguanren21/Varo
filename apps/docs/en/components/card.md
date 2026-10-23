<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# Card

Composable content with header, body and actions.

## Live demo

<FoundationComponentDemo component="card" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VButton, VCard, VCardContent, VCardFooter, VCardHeader, VCardTitle } from '@varo-ui/h5'
</script>

<template>
  <VCard variant="outline">
    <VCardHeader><VCardTitle>Weekend trip</VCardTitle></VCardHeader>
    <VCardContent>Two nights, flexible cancellation.</VCardContent>
    <VCardFooter><VButton>Book</VButton></VCardFooter>
  </VCard>
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop          | Type                                           | Default     | Description               |
| ------------- | ---------------------------------------------- | ----------- | ------------------------- |
| `as`          | `string`                                       | `'section'` | H5 root element           |
| `interactive` | `boolean`                                      | `false`     | Enable button interaction |
| `padding`     | `boolean`                                      | `true`      | Inner spacing             |
| `variant`     | `'default' / 'outline' / 'elevated' / 'muted'` | `'default'` | Visual treatment          |

## Events and slots

No component-specific state events. Use `@click` on an interactive card. H5 parts (`VCardHeader`, `VCardTitle`, `VCardDescription`, `VCardContent`, `VCardFooter`) each accept `as` and a default slot. Native Card uses `header`, `title`, `description`, default and `footer` slots instead of these H5 parts.

## Behavior and platform notes

Keep nested buttons in a non-interactive card; an interactive card should represent one action. Native Card does not support arbitrary HTML elements through `as`; it supports `ariaLabel` for its accessible name.
