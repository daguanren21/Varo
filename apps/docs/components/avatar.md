# Avatar 头像

`VAvatar` 展示图片或文字回退内容；`VAvatarGroup` 将成员头像重叠排列，并显示未展示人数。

## H5 头像组

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
  <VAvatarGroup :max="3" aria-label="项目成员">
    <template v-for="(member, index) in members" :key="member.id">
      <VAvatar v-if="index < 4 || includeLast" :alt="member.name" :fallback="member.fallback" />
    </template>
  </VAvatarGroup>
</template>
```

五个头像配合 `max="3"` 显示三个头像和 `+2`；`max` 不包含计数圆点。直接插槽、`v-for` 生成的 Fragment、嵌套 Fragment 使用相同计数规则；条件渲染的注释节点与空白文本不占人数。上例隐藏最后一位后变为三个头像和 `+1`。自定义 `aria-label`、class 和 style 会保留。

## 小程序头像组

原生插槽无法像 Vue VNode 一样遍历，因此小程序使用显式 `items` 数据，内部渲染真实的 `VAvatar`。安装 `avatar` 同时获得单头像和头像组，无需额外组件包。

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
  <VAvatarGroup :items="members" :max="3" :size="40" :overlap="10" aria-label="项目成员" />
</template>
```

`items` 中每项为 `{ id: string | number, src?: string, alt?: string, fallback?: string }`，`id` 应唯一且稳定。通过更新数组控制成员数量及顺序。`alt` 为头像提供可访问名称；不提供图片时显示 `fallback`，图片失败时也使用同一回退内容。

## VAvatar Props

| Prop       | 类型                                                       | 默认值     | 描述                       |
| ---------- | ---------------------------------------------------------- | ---------- | -------------------------- |
| `src`      | `string`                                                   | —          | 图片地址                   |
| `alt`      | `string`                                                   | `''`       | 头像的可访问名称           |
| `fallback` | `string`                                                   | `''`       | 无图片或图片失败时的文字   |
| `shape`    | `'circle' \| 'rounded' \| 'square'`                        | `'circle'` | 外形                       |
| `size`     | `number \| string`                                         | `40`       | 数字为 px，也可传 CSS 长度 |
| `fit`      | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'cover'`  | 仅 H5；原生使用 cover      |

两个渲染器都支持 `fallback` 插槽。

## VAvatarGroup Props

| Prop        | 渲染器      | 类型                | 默认值 | 描述                                 |
| ----------- | ----------- | ------------------- | ------ | ------------------------------------ |
| `max`       | H5 / 小程序 | `number`            | 不限制 | 最多展示的头像数，`0` 仅展示溢出人数 |
| `overlap`   | H5 / 小程序 | `number \| string`  | `10`   | 重叠长度，数字为 px                  |
| `items`     | 小程序      | `AvatarGroupItem[]` | `[]`   | 显式成员数据                         |
| `size`      | 小程序      | `number \| string`  | `40`   | 所有头像与计数圆点的尺寸             |
| `ariaLabel` | 小程序      | `string`            | `''`   | 整组名称；H5 使用 `aria-label` 属性  |
| `className` | 小程序      | `ClassValue`        | —      | 追加样式类                           |

H5 使用默认插槽组合 `VAvatar`，尺寸由各头像的 `size` 控制，计数圆点为 40px。未指定整组名称时，有溢出会生成例如 `2 more` 的名称；可以通过自定义名称本地化整组描述。头像组不发送状态事件。
