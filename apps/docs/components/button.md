# Button

## 演示

<PlatformTabsDemo example="button" locale="zh" />

::: info 交互
按钮保留 44px 默认命中高度和现有语义色。按压使用 140ms 的轻量缩放与内阴影反馈；Ghost 默认透明，仅在 hover 或按压时出现弱背景。减少动态效果时不执行空间缩放。
:::

## 基础用法

```vue
<template>
  <VButton>默认按钮</VButton>
  <VButton tone="primary">
    主要按钮
  </VButton>
  <VButton tone="success">
    成功按钮
  </VButton>
  <VButton tone="warning">
    警告按钮
  </VButton>
  <VButton tone="danger">
    危险按钮
  </VButton>
</template>
```

## 变体

```vue
<template>
  <VButton variant="solid">
    实心按钮
  </VButton>
  <VButton variant="outline">
    描边按钮
  </VButton>
  <VButton variant="ghost">
    浅色按钮
  </VButton>
  <VButton variant="text">
    文字按钮
  </VButton>
  <VButton plain>
    朴素按钮
  </VButton>
  <VButton hairline plain>
    细边框按钮
  </VButton>
</template>
```

## 尺寸

```vue
<template>
  <VButton size="sm">
    小号按钮
  </VButton>
  <VButton size="md">
    默认按钮
  </VButton>
  <VButton size="lg">
    大号按钮
  </VButton>
</template>
```

## 形状与块级按钮

```vue
<template>
  <VButton shape="square">
    直角按钮
  </VButton>
  <VButton shape="round">
    圆角按钮
  </VButton>
  <VButton block>
    块级按钮
  </VButton>
</template>
```

## 图标与加载

```vue
<template>
  <VButton icon="+">
    新增
  </VButton>
  <VButton icon="✓" icon-position="right">
    完成
  </VButton>
  <VButton loading>
    提交中
  </VButton>
  <VButton loading loading-text="保存中…" />
</template>
```

## 自定义颜色与原生类型

```vue
<template>
  <VButton color="#07c160">
    自定义颜色
  </VButton>
  <VButton color="var(--brand-action)" foreground-color="#ffffff">
    CSS 变量颜色
  </VButton>
  <VButton native-type="submit">
    提交表单
  </VButton>
  <VButton disabled>
    禁用按钮
  </VButton>
</template>
```

Weapp：将 `native-type="submit"` / `"reset"` 的 `VButton` 放入原生 `<form>`，用 `@submit` / `@reset` 处理结果。[`wx://form-field-button`](https://developers.weixin.qq.com/miniprogram/dev/component/form.html#使用内置-behaviors) 负责关联表单，无需另加 `@click` 提交。

浏览器兼容预览支持表单值、提交和重置；`tap` 取消仅在触摸前的鼠标、触摸、键盘（含触摸后键盘）操作中已验证。不提供微信 `formId` 上报，也不等于开发者工具或真机验证。

::: warning 未修复：触摸后切换物理鼠标
同一预览会话先触摸、再用物理鼠标时，`glass-easel@1.1.0` 会抑制鼠标 `tap`，取消处理器不运行。本应取消的提交或重置仍可能执行，重置会清空已编辑字段；此场景未通过验证。
:::

## Props

| Prop              | 类型                                                           | 默认值      | 描述                                       |
| ----------------- | -------------------------------------------------------------- | ----------- | ------------------------------------------ |
| `variant`         | `'solid' \| 'outline' \| 'ghost' \| 'text'`                    | `'solid'`   | 视觉变体                                   |
| `tone`            | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | 语义色                                     |
| `size`            | `'sm' \| 'md' \| 'lg'`                                         | `'md'`      | 尺寸                                       |
| `shape`           | `'default' \| 'square' \| 'round'`                             | `'default'` | 形状                                       |
| `plain`           | `boolean`                                                      | `false`     | 朴素按钮，等价于描边视觉                   |
| `hairline`        | `boolean`                                                      | `false`     | 细边框标记                                 |
| `block`           | `boolean`                                                      | `false`     | 宽度占满父容器                             |
| `icon`            | `string`                                                       | `undefined` | 图标文本或图标名，由样式层解释             |
| `iconPosition`    | `'left' \| 'right'`                                            | `'left'`    | 图标位置                                   |
| `loading`         | `boolean`                                                      | `false`     | 加载中，自动禁用点击                       |
| `loadingText`     | `string`                                                       | `undefined` | 加载时替换默认内容                         |
| `disabled`        | `boolean`                                                      | `false`     | 禁用按钮                                   |
| `color`           | `string`                                                       | `undefined` | 自定义按钮颜色                             |
| `foregroundColor` | `string`                                                       | `undefined` | 非十六进制实心自定义色必须显式提供的前景色 |
| `nativeType`      | `'button' \| 'submit' \| 'reset'`                              | `undefined` | 原生 button type                           |

## Slots

| Slot      | 描述                                   |
| --------- | -------------------------------------- |
| `default` | 按钮内容                               |
| `icon`    | 自定义图标内容，优先级高于 `icon` prop |

Weapp 的默认插槽和 `icon` 插槽使用 `view` 容器，可以组合原生 `view`、`image` 和组件内容，不限于纯文本。

## Data Attributes

| Attribute       | 描述         |
| --------------- | ------------ |
| `data-variant`  | 当前视觉变体 |
| `data-tone`     | 当前语义色   |
| `data-size`     | 当前尺寸     |
| `data-shape`    | 当前形状     |
| `data-loading`  | 是否加载中   |
| `data-disabled` | 是否禁用     |
| `data-plain`    | 是否朴素     |
| `data-hairline` | 是否细边框   |
| `data-block`    | 是否块级     |
