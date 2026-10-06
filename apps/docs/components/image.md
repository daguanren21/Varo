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

| Prop          | 类型                                                       | 默认值      | 描述                 |
| ------------- | ---------------------------------------------------------- | ----------- | -------------------- |
| `src`         | `string`                                                   | `undefined` | 图片地址             |
| `alt`         | `string`                                                   | `''`        | 图片替代文本         |
| `width`       | `number \| string`                                         | `undefined` | 容器宽度             |
| `height`      | `number \| string`                                         | `undefined` | 容器高度             |
| `fit`         | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'fill'`    | 图片填充模式         |
| `position`    | `string`                                                   | `'center'`  | `object-position`    |
| `radius`      | `number \| string`                                         | `undefined` | 圆角                 |
| `round`       | `boolean`                                                  | `false`     | 是否圆形展示         |
| `lazyLoad`    | `boolean`                                                  | `false`     | 是否使用浏览器懒加载 |
| `showLoading` | `boolean`                                                  | `true`      | 是否展示加载占位     |
| `showError`   | `boolean`                                                  | `true`      | 是否展示失败占位     |
| `loadingText` | `string`                                                   | `''`        | 加载占位文案         |
| `errorText`   | `string`                                                   | `''`        | 失败占位文案         |
| `draggable`   | `boolean \| undefined`                                     | `undefined` | 是否允许拖拽图片     |

## Events

下表 DOM 事件类型仅描述 H5；原生 Wevu SFC 使用宿主图片/点击事件，不提供浏览器 `Event` / `MouseEvent` 对象。

| Event   | Payload      | 描述         |
| ------- | ------------ | ------------ |
| `load`  | `Event`      | 图片加载完成 |
| `error` | `Event`      | 图片加载失败 |
| `click` | `MouseEvent` | 点击图片容器 |

## Slots

| Slot      | 描述           |
| --------- | -------------- |
| `loading` | 自定义加载占位 |
| `error`   | 自定义失败占位 |

::: info Primitives
`ImageRoot` 是 `@varo-ui/h5/primitives` 的 H5 Parts API；`@varo-ui/headless` 只承载共享状态契约。原生 `VImage` 来自 Registry 或 `@varo-ui/weapp` 的 Wevu SFC，由目标编译器处理，不是等价的 Vue Parts。
:::
