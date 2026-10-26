<script setup>
import FoundationComponentDemo from '../src/components/FoundationComponentDemo.vue'
</script>

# Empty 空状态

说明无内容的原因，并提供恢复操作。

## 交互演示

<FoundationComponentDemo component="empty" locale="zh" />

## 用法

```vue
<script setup lang="ts">
import { VButton, VEmpty } from '@varo-ui/h5'
import { ref } from 'vue'

const filters = ref(['sale'])
function resetFilters() {
  filters.value = []
}
</script>

<template>
  <VEmpty title="No results" description="Try another keyword." icon="search">
    <VButton @click="resetFilters">
      Reset filters
    </VButton>
  </VEmpty>
</template>
```

示例使用 `@varo-ui/h5` 的 H5 组件名。请在页面中绑定状态并实现业务处理函数。上方演示提供可操作的控件，切换小程序标签可查看原生场景。

## 属性

| 属性          | 类型                 | 默认值       | 说明                 |
| ------------- | -------------------- | ------------ | -------------------- |
| `title`       | `string`             | `—`          | 可选标题             |
| `description` | `string`             | `'暂无数据'` | 说明                 |
| `icon`        | `string`             | `'info'`     | 默认图标             |
| `image`       | `string`             | `—`          | 图片地址，优先于图标 |
| `size`        | `'sm' / 'md' / 'lg'` | `'md'`       | 尺寸                 |

## 事件与插槽

无组件事件。插槽为 `image`、`title`、`description` 和默认插槽（恢复操作）。具名插槽替换对应属性内容。

## 行为与平台限制

组件不会请求数据或重置筛选，请由页面实现。内置插图为装饰内容，自定义图片插槽应自行提供可访问语义。英文页面需显式设置说明，默认文本为中文。
