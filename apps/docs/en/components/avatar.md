# Avatar

`VAvatar` displays an image or fallback content. `VAvatarGroup` overlaps member avatars and shows how many members are hidden.

## H5 avatar groups

```vue
<script setup lang="ts">
import { VAvatar, VAvatarGroup } from '@varo-ui/h5'
import { shallowRef } from 'vue'

const includeLast = shallowRef(true)
const members = [
  { id: 'ada', name: 'Ada', fallback: 'A' },
  { id: 'bo', name: 'Bo', fallback: 'B' },
  { id: 'chen', name: 'Chen', fallback: 'C' },
  { id: 'dee', name: 'Dee', fallback: 'D' },
  { id: 'eli', name: 'Eli', fallback: 'E' },
]
</script>

<template>
  <VAvatarGroup :max="3" aria-label="Project members">
    <template v-for="(member, index) in members" :key="member.id">
      <VAvatar v-if="index < 4 || includeLast" :alt="member.name" :fallback="member.fallback" />
    </template>
  </VAvatarGroup>
</template>
```

Five avatars with `:max="3"` render three avatars and `+2`; the counter does not consume a visible-avatar slot. Direct children, `v-for` Fragments, and nested Fragments use the same accounting. Conditional comment nodes and whitespace do not count as members. Hiding the final member above changes the result to three avatars and `+1`. Caller-provided `aria-label`, class, and style attributes are preserved.

## Native avatar groups

Native slots cannot be traversed like Vue VNodes, so the native group takes an explicit `items` array and renders real `VAvatar` components. Installing `avatar` includes both the single avatar and the group.

```vue
<script setup lang="ts">
import VAvatarGroup from '@/components/ui/v-avatar-group.vue'

const members = [
  { id: 'ada', alt: 'Ada', fallback: 'A' },
  { id: 'bo', alt: 'Bo', fallback: 'B' },
  { id: 'chen', alt: 'Chen', fallback: 'C' },
  { id: 'dee', alt: 'Dee', fallback: 'D' },
  { id: 'eli', alt: 'Eli', fallback: 'E' },
]
</script>

<template>
  <VAvatarGroup :items="members" :max="3" :size="40" :overlap="10" aria-label="Project members" />
</template>
```

Each item is `{ id: string | number, src?: string, alt?: string, fallback?: string }`. Use a stable, unique `id`; replace the array to change membership or order. `alt` supplies the avatar's accessible name. `fallback` appears when there is no image or image loading fails.

## VAvatar Props

| Prop       | Type                                                       | Default    | Description                                     |
| ---------- | ---------------------------------------------------------- | ---------- | ----------------------------------------------- |
| `src`      | `string`                                                   | —          | Image URL                                       |
| `alt`      | `string`                                                   | `''`       | Accessible avatar name                          |
| `fallback` | `string`                                                   | `''`       | Text shown without an image or on image failure |
| `shape`    | `'circle' \| 'rounded' \| 'square'`                        | `'circle'` | Avatar shape                                    |
| `size`     | `number \| string`                                         | `40`       | Number in px, or a CSS length                   |
| `fit`      | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'`  | H5 only; native uses cover                      |

Both renderers support a `fallback` slot.

## VAvatarGroup Props

| Prop        | Renderer    | Type                | Default   | Description                                                |
| ----------- | ----------- | ------------------- | --------- | ---------------------------------------------------------- |
| `max`       | H5 / native | `number`            | Unlimited | Maximum visible avatars; `0` shows only the overflow count |
| `overlap`   | H5 / native | `number \| string`  | `10`      | Overlap length, numbers in px                              |
| `items`     | Native      | `AvatarGroupItem[]` | `[]`      | Explicit member data                                       |
| `size`      | Native      | `number \| string`  | `40`      | Size of every avatar and the overflow counter              |
| `ariaLabel` | Native      | `string`            | `''`      | Group name; H5 accepts the `aria-label` attribute          |
| `className` | Native      | `ClassValue`        | —         | Additional classes                                         |

H5 composes `VAvatar` children in the default slot. Set sizes on each avatar; its overflow counter is 40px. When no group name is supplied, an overflowing group gets a name such as `2 more`. Supply a group name to localize the group description. Avatar groups emit no state events.
