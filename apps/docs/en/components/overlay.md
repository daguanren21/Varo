# Overlay

## Demo

<PlatformTabsDemo example="overlay" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <VButton @click="visible = true">Open overlay</VButton>
  <VOverlay v-model:visible="visible" />
</template>
```

## Z-index and Duration

```vue
<template>
  <VOverlay v-model:visible="visible" :z-index="3000" :duration="0.2" />
</template>
```

## Disable Overlay Close

```vue
<template>
  <VOverlay v-model:visible="visible" :close-on-click-overlay="false" />
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean \| undefined` | `undefined` | Controlled visibility |
| `defaultVisible` | `boolean` | `false` | Initial uncontrolled visibility |
| `disabled` | `boolean \| undefined` | `undefined` | Disable internal visibility changes |
| `zIndex` | `number \| string` | `undefined` | Overlay z-index |
| `duration` | `number \| string` | `undefined` | Animation duration; numbers are seconds |
| `lockScroll` | `boolean` | `false` | Lock body scroll while visible |
| `closeOnClickOverlay` | `boolean` | `true` | Close on overlay click |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:visible` | `boolean` | Controlled sync event |
| `visibleChange` | `boolean` | Visibility changed |
| `close` | `void` | Close requested |
| `click` | `MouseEvent` | Overlay clicked |

## Slots

| Slot | Description |
| --- | --- |
| `default` | Custom overlay content |

## Primitives

`OverlayRoot` uses `useOverlayRoot` for controlled/uncontrolled state and click-close behavior. H5 and Weapp primitives both reuse `useBodyScrollLock`.
