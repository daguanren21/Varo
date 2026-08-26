# Image

## 演示

<PlatformTabsDemo example="image" locale="zh" />

## 基础用法

```vue
<template>
  <VImage src="/logo.png" width="96" height="96" fit="cover" radius="12px" />
</template>
```

## 填充模式

```vue
<template>
  <VImage src="/logo.png" width="96" height="96" fit="contain" />
  <VImage src="/logo.png" width="96" height="96" fit="cover" />
  <VImage src="/logo.png" width="96" height="96" fit="fill" />
</template>
```

## 圆形图片

```vue
<template>
  <VImage src="/logo.png" width="72" height="72" round />
</template>
```

## 加载与失败态

```vue
<template>
  <VImage src="/not-found.png" width="96" height="96" error-text="加载失败" />
</template>
```

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `src` | `string` | `undefined` | 图片地址 |
| `alt` | `string` | `''` | 图片替代文本 |
| `width` | `number \| string` | `undefined` | 容器宽度 |
| `height` | `number \| string` | `undefined` | 容器高度 |
| `fit` | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'fill'` | 图片填充模式 |
| `position` | `string` | `'center'` | `object-position` |
| `radius` | `number \| string` | `undefined` | 圆角 |
| `round` | `boolean` | `false` | 是否圆形展示 |
| `lazyLoad` | `boolean` | `false` | 是否使用浏览器懒加载 |
| `showLoading` | `boolean` | `true` | 是否展示加载占位 |
| `showError` | `boolean` | `true` | 是否展示失败占位 |
| `loadingText` | `string` | `''` | 加载占位文案 |
| `errorText` | `string` | `''` | 失败占位文案 |
| `draggable` | `boolean \| undefined` | `undefined` | 是否允许拖拽图片 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `load` | `Event` | 图片加载完成 |
| `error` | `Event` | 图片加载失败 |
| `click` | `MouseEvent` | 点击图片容器 |

## Slots

| Slot | 描述 |
| --- | --- |
| `loading` | 自定义加载占位 |
| `error` | 自定义失败占位 |

## Primitives

`ImageRoot` 同步在 `@varo/primitives-h5` 与 `@varo/primitives-weapp` 暴露，UI 包的 `VImage` 只负责 Varo 类名和 API 包装。
