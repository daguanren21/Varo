# Cell

## 演示

<PlatformTabsDemo example="cell" locale="zh" />

## 基础用法

```vue
<template>
  <VCell title="标题" desc="描述" />
  <VCell title="标题" sub-title="副标题" desc="右侧内容" />
</template>
```

## 图标与箭头

```vue
<template>
  <VCell title="带图标" icon="◎" desc="内容" />
  <VCell title="可跳转" desc="详情" is-link />
  <VCell title="路由跳转" desc="查看" to="/profile" />
</template>
```

## 分组

```vue
<template>
  <VCellGroup title="账户信息" desc="基础资料">
    <VCell title="昵称" sub-title="公开展示" desc="Varo" />
    <VCell title="收货地址" desc="去设置" is-link />
  </VCellGroup>
</template>
```

## 对齐与尺寸

```vue
<template>
  <VCell title="垂直居中" desc="内容" center />
  <VCell title="大尺寸" desc="内容" size="large" />
  <VCell title="左对齐描述" desc="多行描述内容" desc-text-align="left" />
  <VCell title="固定标题宽度" desc="内容" title-width="120px" />
</template>
```

## 自定义圆角与插槽

```vue
<template>
  <VCellGroup title="自定义">
    <VCell title="圆角" desc="16px" round-radius="16px" />
    <VCell>
      <template #icon>i</template>
      <template #title>自定义标题</template>
      <template #desc>自定义描述</template>
      <template #link>→</template>
    </VCell>
  </VCellGroup>
</template>
```

## Cell Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `title` | `string` | `undefined` | 左侧标题 |
| `subTitle` | `string` | `undefined` | 标题下方副标题 |
| `desc` | `string` | `undefined` | 右侧描述内容 |
| `descTextAlign` | `'left' \| 'right'` | `'right'` | 右侧描述对齐方式 |
| `icon` | `string` | `undefined` | 左侧图标内容 |
| `isLink` | `boolean` | `false` | 展示右侧箭头并进入可点击态 |
| `to` | `string` | `undefined` | 链接地址，传入后渲染为 anchor |
| `roundRadius` | `string` | `undefined` | 自定义圆角 CSS 变量 |
| `center` | `boolean` | `false` | 内容垂直居中 |
| `size` | `'default' \| 'large'` | `'default'` | 单元格尺寸 |
| `clickable` | `boolean` | `false` | 开启可点击态 |
| `titleWidth` | `number \| string` | `undefined` | 标题宽度 |

## CellGroup Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `title` | `string` | `undefined` | 分组标题 |
| `desc` | `string` | `undefined` | 分组右侧描述 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `click` | `MouseEvent \| KeyboardEvent` | 点击或键盘激活 Cell 时触发 |

## Slots

| Slot | 描述 |
| --- | --- |
| `default` | 自定义 Cell 主内容或 CellGroup 内容 |
| `title` | 自定义标题 |
| `subTitle` | 自定义副标题 |
| `desc` | 自定义右侧描述 |
| `icon` | 自定义左侧图标 |
| `link` | 自定义右侧箭头 |

## Data Attributes

| Attribute | 描述 |
| --- | --- |
| `data-size` | 当前尺寸 |
| `data-center` | 是否垂直居中 |
| `data-clickable` | 是否可点击 |
| `data-link` | 是否展示链接态 |
| `data-desc-align` | 描述对齐方式 |
