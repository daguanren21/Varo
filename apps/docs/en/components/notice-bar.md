<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# NoticeBar

Inline status messages with optional dismissal.

## Live demo

<FoundationComponentDemo component="notice-bar" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VNoticeBar } from '@varo-ui/h5'
import { ref } from 'vue'

const visible = ref(true)
</script>

<template>
  <VNoticeBar
    v-model:visible="visible" closeable tone="info"
    text="Your order has shipped."
  />
  <VNoticeBar wrapable text="Save your work before scheduled maintenance." />
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop         | Type                                        | Default     | Description                                |
| ------------ | ------------------------------------------- | ----------- | ------------------------------------------ |
| `text`       | `string`                                    | `—`         | Message text                               |
| `visible`    | `boolean`                                   | `true`      | Visibility; v-model:visible                |
| `tone`       | `'info' / 'success' / 'warning' / 'danger'` | `'warning'` | Status color                               |
| `icon`       | `string`                                    | `'info'`    | Leading icon                               |
| `closeable`  | `boolean`                                   | `false`     | Show dismiss button                        |
| `scrollable` | `boolean`                                   | `false`     | Animate single-line text                   |
| `wrapable`   | `boolean`                                   | `false`     | Wrap text; takes precedence over scrolling |

## Events and slots

`update:visible` emits false on dismiss; `close` emits the interaction event (H5 DOM event; native event object). Default slot replaces `text`; `icon` replaces the leading icon; `action` replaces the close button.

## Behavior and platform notes

Bind visibility to make dismissal persistent. The component has no automatic dismissal timer. Wrapping disables scrolling. Custom `action` content must implement its own action and accessible name.
