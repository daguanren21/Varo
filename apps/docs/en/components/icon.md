<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# Icon

Built-in symbols with size, color and accessible labels.

## Live demo

<FoundationComponentDemo component="icon" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VButton, VIcon } from '@varo-ui/h5'
</script>

<template>
  <VIcon name="check" tone="success" :size="24" label="Saved" />
  <VButton><VIcon name="search" />Search</VButton>
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop    | Type                                                                 | Default     | Description                                |
| ------- | -------------------------------------------------------------------- | ----------- | ------------------------------------------ |
| `name`  | `string`                                                             | `required`  | Built-in icon name                         |
| `size`  | `number / string`                                                    | `16`        | Pixels for numbers; CSS length for strings |
| `color` | `string`                                                             | `—`         | Explicit CSS color                         |
| `tone`  | `'default' / 'primary' / 'success' / 'warning' / 'danger' / 'muted'` | `'default'` | Semantic color                             |
| `spin`  | `boolean`                                                            | `false`     | Rotation animation                         |
| `label` | `string`                                                             | `—`         | Accessible image name                      |

## Events and slots

No component events. The default slot replaces the built-in artwork. Common names include `check`, `close`, `search`, `info`, `loading`, `star`, and `chevronRight`.

## Behavior and platform notes

Without `label`, the icon is decorative and hidden from assistive technology. Put actions on a labelled button, not on the icon alone. H5 renders built-in SVG artwork; native renders native-compatible icon assets.
