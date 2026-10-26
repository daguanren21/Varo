<script setup>
import FoundationComponentDemo from '../../src/components/FoundationComponentDemo.vue'
</script>

# Empty

Explain missing content and provide a recovery action.

## Live demo

<FoundationComponentDemo component="empty" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VButton, VEmpty } from '@varo-ui/h5'
import { ref } from 'vue'

const filters = ref(['sale'])
function resetFilters() {
  filters.value = []
}
</script>

<template>
  <VEmpty title="No results" description="Try another keyword." icon="search">
    <VButton @click="resetFilters">
      Reset filters
    </VButton>
  </VEmpty>
</template>
```

Examples use H5 component names from `@varo-ui/h5`. Bind state and implement the business handlers in your page. The live demo above includes working controls; switch to Mini Program for the native scene.

## Props

| Prop          | Type                 | Default      | Description                           |
| ------------- | -------------------- | ------------ | ------------------------------------- |
| `title`       | `string`             | `—`          | Optional heading                      |
| `description` | `string`             | `'暂无数据'` | Description                           |
| `icon`        | `string`             | `'info'`     | Fallback icon                         |
| `image`       | `string`             | `—`          | Image URL, takes precedence over icon |
| `size`        | `'sm' / 'md' / 'lg'` | `'md'`       | Visual size                           |

## Events and slots

No component events. Slots: `image`, `title`, `description`, and default (recovery actions). Each named slot replaces its matching prop content.

## Behavior and platform notes

Empty does not fetch data or reset filters. Implement the action in the page. The built-in illustration is decorative; custom image slots must supply their own accessibility semantics. Set an English description explicitly because the default text is Chinese.
