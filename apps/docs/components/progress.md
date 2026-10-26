<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# Progress 进度条

使用线形或环形展示确定的完成进度。

## 交互演示

<FoundationComponentDemo component="progress" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VProgress } from '@varo-ui/h5'
</script>

<template>
  <VProgress :percentage="60" status="active" aria-label="Upload" />
  <VProgress type="circle" :percentage="100" status="success" />
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性          | 类型                                                      | 默认值      | 说明                     |
| ------------- | --------------------------------------------------------- | ----------- | ------------------------ |
| `percentage`  | `number`                                                  | `0`         | 完成百分比，限制到 0–100 |
| `type`        | `'line' / 'circle'`                                       | `'line'`    | 形状                     |
| `status`      | `'default' / 'active' / 'success' / 'warning' / 'danger'` | `'default'` | 视觉状态                 |
| `showText`    | `boolean`                                                 | `true`      | 显示数值或默认插槽       |
| `size`        | `number / string`                                         | `96`        | 环形直径                 |
| `strokeWidth` | `number`                                                  | `8`         | 轨道粗细，单位像素       |

## 事件与插槽

无组件事件。默认插槽接收 `{ value }`（限制范围后的百分比），在 `showText` 为 true 时替换数值文本。

## 行为与平台限制

组件不会上传文件或计算进度。请从任务中传入有限数值。`active` 仅改变外观，不代表不确定进度模式。H5 请提供可访问名称。
