# Popup

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <VButton @click="visible = true">Open popup</VButton>
  <VPopup v-model:visible="visible" position="bottom" round closeable>
    <div class="popup-body">Popup content</div>
  </VPopup>
</template>
```

## Positions

```vue
<template>
  <VPopup v-model:visible="visible" position="top" />
  <VPopup v-model:visible="visible" position="bottom" />
  <VPopup v-model:visible="visible" position="left" />
  <VPopup v-model:visible="visible" position="right" />
  <VPopup v-model:visible="visible" position="center" />
</template>
```

## Close Button

```vue
<template>
  <VPopup v-model:visible="visible" closeable close-icon-position="top-right" />
</template>
```

## Cross-platform Preview

<PlatformTabsDemo example="popup" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean \| undefined` | `undefined` | Controlled visibility |
| `defaultVisible` | `boolean` | `false` | Initial uncontrolled visibility |
| `disabled` | `boolean \| undefined` | `undefined` | Disable internal visibility changes |
| `position` | `'center' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | Popup placement |
| `overlay` | `boolean` | `true` | Render overlay |
| `closeable` | `boolean` | `false` | Render close button |
| `closeIcon` | `string` | `'×'` | Close button content |
| `closeIconPosition` | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | `'top-right'` | Close button position marker |
| `round` | `boolean` | `false` | Rounded content marker |
| `safeAreaInsetBottom` | `boolean` | `false` | Bottom safe-area marker |
| `lockScroll` | `boolean` | `false` | Lock body scroll while visible |
| `closeOnClickOverlay` | `boolean` | `true` | Close on overlay click |
| `zIndex` | `number \| string` | `undefined` | Popup z-index |
| `duration` | `number \| string` | `undefined` | Animation duration; numbers are seconds |
| `destroyOnClose` | `boolean` | `true` | Destroy content when closed |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:visible` | `boolean` | Controlled sync event |
| `visibleChange` | `boolean` | Visibility changed |
| `close` | `void` | Close requested |
| `clickOverlay` | `void` | Overlay clicked |

## Slots

| Slot | Description |
| --- | --- |
| `default` | Popup content |
| `closeIcon` | Custom close button content |

## Primitives

`PopupRoot` uses `usePopupRoot` for visibility, overlay click, and `Escape` close behavior; UI packages keep the Varo-style component entry.
