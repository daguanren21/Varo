# Button

`VButton` 是官方 H5 封装层里的基础按钮组件，建立在 `ButtonRoot` primitive 之上。

## 何时使用

- 触发页面级或局部动作
- 表单提交、确认、取消等主次操作
- 需要统一尺寸、状态与主题 token 的场景

## Anatomy

<div class="component-anatomy">
  <strong>Button 由一个可交互根节点组成。</strong>
  <ul>
    <li><code>ButtonRoot</code> 负责按压、禁用、加载与语义状态。</li>
    <li><code>VButton</code> 在此基础上补齐默认 class、尺寸和视觉变体。</li>
  </ul>
</div>

## H5 示例

```vue
<script setup lang="ts">
import { VButton } from '@varo/ui-h5'
</script>

<template>
  <VButton variant="solid" size="md">提交</VButton>
  <VButton variant="outline" size="sm">次要操作</VButton>
  <VButton variant="ghost" :disabled="true">禁用态</VButton>
</template>
```

## 小程序示例

```vue
<script setup lang="ts">
import { VButton } from '@varo/ui-weapp'
</script>

<template>
  <view class="stack">
    <VButton size="lg">提交</VButton>
    <VButton variant="outline">取消</VButton>
  </view>
</template>
```

## Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | 按钮视觉变体 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| `loading` | `boolean` | `false` | 加载中时禁止交互 |
| `disabled` | `boolean` | `false` | 禁用按钮 |

## Data Attributes

| Attribute | 说明 |
| --- | --- |
| `data-variant` | 当前视觉变体 |
| `data-size` | 当前尺寸规格 |
| `data-loading` | 是否处于加载中 |
| `data-disabled` | 是否处于禁用态 |

## 行为说明

- `loading` 与 `disabled` 都会让按钮进入不可交互状态
- 官方 wrappers 会基于 theme token 生成 class，不直接把业务样式写死在组件内部
- 业务如果只需要交互能力，可以直接下沉到 primitives 层，不必依赖官方视觉封装

## 组合建议

<div class="component-note">
  <strong>推荐组合方式</strong>
  <ul>
    <li>业务项目：直接使用 <code>@varo/ui-h5</code> / <code>@varo/ui-weapp</code>。</li>
    <li>企业设计系统：复用 <code>ButtonRoot</code> 行为，自行接入品牌样式与权限体系。</li>
    <li>对按钮 loading 的视觉表达有更强要求时，优先改 token 或 wrapper class，不要改核心交互逻辑。</li>
  </ul>
</div>

## 相关文档

- [Input](/components/input)
- [Dialog](/components/dialog)
- [主题配置](/guide/theme)
- [H5 示例](/examples/h5)