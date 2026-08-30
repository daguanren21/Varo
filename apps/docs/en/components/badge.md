# Badge

## Demo

<PlatformTabsDemo example="badge" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { VBadge } from '@varo-ui/h5'
</script>

<template>
  <VBadge :content="3" />
  <VBadge tone="primary">
    New
  </VBadge>
</template>
```

## Text Top-right Badge

```vue
<template>
  <span class="badge-anchor">
    Messages
    <VBadge class="badge-anchor__mark" :content="3" aria-label="3 unread messages" />
  </span>
  <span class="badge-anchor">
    Notifications
    <VBadge class="badge-anchor__mark" aria-label="New notification" dot />
  </span>
</template>

<style scoped>
.badge-anchor {
  position: relative;
  display: inline-flex;
  min-width: 72px;
  padding: 10px 14px;
  justify-content: center;
}

.badge-anchor + .badge-anchor {
  margin-left: 12px;
}

.badge-anchor__mark {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(45%, -40%);
}
</style>
```

## Count And Cap

```vue
<template>
  <VBadge :content="12" />
  <VBadge :content="120" :max="99" tone="warning" />
</template>
```

## Zero And Status Dot

```vue
<template>
  <VBadge :content="0" show-zero tone="default" />
  <VBadge aria-label="Online" dot tone="success" />
</template>
```

## Variants And Semantic Tones

```vue
<template>
  <VBadge tone="primary">
    New
  </VBadge>
  <VBadge tone="success" variant="soft">
    Stable
  </VBadge>
  <VBadge tone="warning" variant="outline">
    Review
  </VBadge>
</template>
```

## Props

| Prop       | Type                                                           | Default     | Description              |
| ---------- | -------------------------------------------------------------- | ----------- | ------------------------ |
| `content`  | `number \| string`                                             | `undefined` | Badge content            |
| `dot`      | `boolean`                                                      | `false`     | Render only a status dot |
| `max`      | `number`                                                       | `99`        | Numeric content cap      |
| `showZero` | `boolean`                                                      | `false`     | Render numeric `0`       |
| `tone`     | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'danger'`  | Semantic tone            |
| `variant`  | `'solid' \| 'soft' \| 'outline'`                               | `'solid'`   | Visual variant           |

## Slots

| Slot      | Description          |
| --------- | -------------------- |
| `default` | Custom badge content |

## Data Attributes

| Attribute      | Description            |
| -------------- | ---------------------- |
| `data-dot`     | Dot state              |
| `data-tone`    | Current semantic tone  |
| `data-variant` | Current visual variant |
