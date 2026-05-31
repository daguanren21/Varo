# Grid

## 基础用法

```vue
<template>
  <VGrid>
    <VGridItem icon="◎" text="文字" />
    <VGridItem icon="◎" text="物流" />
    <VGridItem icon="◎" text="收藏" />
    <VGridItem icon="◎" text="设置" />
  </VGrid>
</template>
```

## 列数与间距

```vue
<template>
  <VGrid :column-num="3" :gutter="8">
    <VGridItem text="入口" />
    <VGridItem text="入口" />
    <VGridItem text="入口" />
  </VGrid>
</template>
```

## 徽标与点击态

```vue
<template>
  <VGrid clickable>
    <VGridItem icon="◎" text="消息" badge="3" />
    <VGridItem icon="◎" text="提醒" dot />
  </VGrid>
</template>
```

## 跨端演示

<PlatformTabsDemo example="grid" locale="zh" />

## Grid Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `columnNum` | `number \| string` | `4` | 列数 |
| `gutter` | `number \| string` | `undefined` | 宫格间距 |
| `border` | `boolean` | `true` | 是否显示边框态 |
| `square` | `boolean` | `false` | 是否方形格子 |
| `center` | `boolean` | `true` | 是否居中内容 |
| `clickable` | `boolean` | `false` | 是否开启点击态 |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | 内容方向 |

## GridItem Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `text` | `string` | `undefined` | 文本 |
| `icon` | `string` | `undefined` | 图标内容 |
| `badge` | `number \| string` | `undefined` | 徽标内容 |
| `dot` | `boolean` | `false` | 是否显示小红点 |
| `url` | `string` | `undefined` | 链接地址 |
| `to` | `string` | `undefined` | 路由链接 |
| `span` | `number \| string` | `1` | 跨列数量 |
| `clickable` | `boolean \| undefined` | `undefined` | 覆盖父级点击态 |

## Slots

| Slot | 描述 |
| --- | --- |
| `default` | Grid 内容或 GridItem 自定义内容 |
| `icon` | 自定义图标 |
| `text` | 自定义文本 |
