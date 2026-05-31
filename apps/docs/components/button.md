# Button

## 基础用法

```vue
<template>
  <VButton>默认按钮</VButton>
  <VButton tone="primary">主要按钮</VButton>
  <VButton tone="success">成功按钮</VButton>
  <VButton tone="warning">警告按钮</VButton>
  <VButton tone="danger">危险按钮</VButton>
</template>
```

## 变体

```vue
<template>
  <VButton variant="solid">实心按钮</VButton>
  <VButton variant="outline">描边按钮</VButton>
  <VButton variant="ghost">浅色按钮</VButton>
  <VButton plain>朴素按钮</VButton>
  <VButton hairline plain>细边框按钮</VButton>
</template>
```

## 尺寸

```vue
<template>
  <VButton size="sm">小号按钮</VButton>
  <VButton size="md">默认按钮</VButton>
  <VButton size="lg">大号按钮</VButton>
</template>
```

## 形状与块级按钮

```vue
<template>
  <VButton shape="square">直角按钮</VButton>
  <VButton shape="round">圆角按钮</VButton>
  <VButton block>块级按钮</VButton>
</template>
```

## 图标与加载

```vue
<template>
  <VButton icon="+">新增</VButton>
  <VButton icon="✓" icon-position="right">完成</VButton>
  <VButton loading>提交中</VButton>
  <VButton loading loading-text="保存中..." />
</template>
```

## 自定义颜色与原生类型

```vue
<template>
  <VButton color="#0f766e">自定义颜色</VButton>
  <VButton native-type="submit">提交表单</VButton>
  <VButton disabled>禁用按钮</VButton>
</template>
```

## 跨端演示

<PlatformTabsDemo example="button" locale="zh" />

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | 视觉变体 |
| `tone` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | 语义色 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `shape` | `'default' \| 'square' \| 'round'` | `'default'` | 形状 |
| `plain` | `boolean` | `false` | 朴素按钮，等价于描边视觉 |
| `hairline` | `boolean` | `false` | 细边框标记 |
| `block` | `boolean` | `false` | 宽度占满父容器 |
| `icon` | `string` | `undefined` | 图标文本或图标名，由样式层解释 |
| `iconPosition` | `'left' \| 'right'` | `'left'` | 图标位置 |
| `loading` | `boolean` | `false` | 加载中，自动禁用点击 |
| `loadingText` | `string` | `undefined` | 加载时替换默认内容 |
| `disabled` | `boolean` | `false` | 禁用按钮 |
| `color` | `string` | `undefined` | 自定义按钮颜色 |
| `nativeType` | `'button' \| 'submit' \| 'reset'` | `undefined` | 原生 button type |

## Slots

| Slot | 描述 |
| --- | --- |
| `default` | 按钮内容 |
| `icon` | 自定义图标内容，优先级高于 `icon` prop |

## Data Attributes

| Attribute | 描述 |
| --- | --- |
| `data-variant` | 当前视觉变体 |
| `data-tone` | 当前语义色 |
| `data-size` | 当前尺寸 |
| `data-shape` | 当前形状 |
| `data-loading` | 是否加载中 |
| `data-disabled` | 是否禁用 |
| `data-plain` | 是否朴素 |
| `data-hairline` | 是否细边框 |
| `data-block` | 是否块级 |
