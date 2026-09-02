# Skeleton

`VSkeleton` waits `180ms` before showing placeholders by default, preventing flashes on short requests. It covers article, image, and video layouts, then fades loaded slot content in.

## Demo

<FormComponentDemo example="skeleton" locale="en" />

## Usage

```vue
<script setup lang="ts">
import { VSkeleton } from '@varo-ui/h5'
import { shallowRef } from 'vue'

const loading = shallowRef(true)
</script>

<template>
  <VSkeleton :loading="loading" :delay="180" content-fade media="image" avatar title :rows="4" round>
    <article>Loaded content</article>
  </VSkeleton>
</template>
```

For mini-programs, replace `vue` and `@varo-ui/h5` with `wevu` and `@varo-ui/weapp`; the public API stays aligned.

## Props

| Prop          | Type                           | Default    | Description                                                                  |
| ------------- | ------------------------------ | ---------- | ---------------------------------------------------------------------------- |
| `loading`     | `boolean`                      | `true`     | Whether the loading flow is active                                           |
| `delay`       | `number`                       | `180`      | Milliseconds before placeholders appear, avoiding flashes for short requests |
| `contentFade` | `boolean`                      | `true`     | Fades real content in when loading completes                                 |
| `media`       | `'none' \| 'image' \| 'video'` | `'none'`   | Optional image or video media placeholder                                    |
| `mediaRatio`  | `string`                       | `'16 / 9'` | CSS `aspect-ratio` used by the media placeholder                             |
| `animated`    | `boolean`                      | `true`     | Enables the low-intensity shimmer                                            |
| `avatar`      | `boolean`                      | `false`    | Shows an avatar placeholder                                                  |
| `title`       | `boolean`                      | `true`     | Shows a title placeholder                                                    |
| `rows`        | `number`                       | `3`        | Number of content rows; negative values normalize to `0`                     |
| `round`       | `boolean`                      | `false`    | Uses pill radii for title and content rows                                   |

## Accessibility and motion

- Loading state exposes `aria-busy="true"` and a Loading name.
- `loading=false` removes placeholders and fades real content according to `contentFade`.
- Global `prefers-reduced-motion` disables both shimmer and content-fade motion.
