# Skeleton 骨架屏

`VSkeleton` 默认延迟 `180ms` 再显示骨架，避免短请求闪烁；内容就绪后移除占位并淡入默认 slot。

## 演示

<FormComponentDemo example="skeleton" locale="zh" />

## 使用

```vue
<script setup lang="ts">
import { VSkeleton } from '@varo-ui/h5'
import { shallowRef } from 'vue'

const loading = shallowRef(true)
</script>

<template>
  <VSkeleton :loading="loading" :delay="180" content-fade avatar title :rows="4" round>
    <article>真实内容</article>
  </VSkeleton>
</template>
```

小程序把 `vue` 和 `@varo-ui/h5` 分别替换为 `wevu` 与 `@varo-ui/weapp`，API 保持一致。

## Props

| Prop          | 类型      | 默认值  | 描述                                             |
| ------------- | --------- | ------- | ------------------------------------------------ |
| `loading`     | `boolean` | `true`  | 是否处于加载流程                                 |
| `delay`       | `number`  | `180`   | 延迟多少毫秒后显示骨架，短请求可直接完成而不闪屏 |
| `contentFade` | `boolean` | `true`  | 真实内容出现时是否淡入                           |
| `animated`    | `boolean` | `true`  | 是否启用低强度扫光动画                           |
| `avatar`      | `boolean` | `false` | 是否显示头像占位                                 |
| `title`       | `boolean` | `true`  | 是否显示标题占位                                 |
| `rows`        | `number`  | `3`     | 内容占位行数，负数按 `0` 处理                    |
| `round`       | `boolean` | `false` | 标题与内容行是否使用胶囊圆角                     |

## 无障碍与动效

- 加载时输出 `aria-busy="true"` 和 Loading 名称。
- `loading=false` 时移除占位节点，并按 `contentFade` 淡入真实内容。
- 全局 `prefers-reduced-motion` 会关闭扫光和内容淡入动画。
