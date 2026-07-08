# Select 选择器

`VSelect` 是 Base Kit 的低层选择组件，用于表单、筛选和业务组件二次封装。组件默认使用 `picker` 模式，适合 H5、小程序和 App 的移动端体验。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'

const city = ref<string | number>()
const cities = [
  { label: '上海', value: 'shanghai' },
  { label: '杭州', value: 'hangzhou' }
]
</script>

<template>
  <VSelect v-model="city" :options="cities" placeholder="请选择城市" />
</template>
```

## 多选与确认

```vue
<script setup lang="ts">
import { ref } from 'vue'

const values = ref<Array<string | number>>([])
const options = [
  { label: '待处理', value: 'pending' },
  { label: '已完成', value: 'done' },
  { label: '已取消', value: 'cancelled' }
]
</script>

<template>
  <VSelect v-model="values" multiple :options="options" placeholder="请选择状态" />
  <VSelect v-model="values" multiple :confirmable="false" :options="options" />
</template>
```

## 搜索与 Dropdown

```vue
<template>
  <VSelect v-model="city" searchable :options="cities" />
  <VSelect v-model="city" mode="dropdown" :options="cities" />
</template>
```

## 二次封装边界

分组、远程搜索、异步分页属于二次封装组件能力，不属于 Base Kit。业务组件应基于 `VSelect` 封装 `UserSelect`、`DepartmentSelect`、`CitySelect`、`ProductSelect`。

## Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| Array<string \| number>` | `undefined` | 当前选中值 |
| `options` | `VSelectOption[]` | `[]` | 选项 |
| `mode` | `'picker' \| 'dropdown'` | `'picker'` | 展示模式 |
| `placeholder` | `string` | `'请选择'` | 占位文本 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `clearable` | `boolean` | `false` | 可清空 |
| `multiple` | `boolean` | `false` | 多选 |
| `max` | `number` | `undefined` | 最多选择数量 |
| `searchable` | `boolean` | `false` | 本地搜索 |
| `confirmable` | `boolean` | `true` | 多选时是否确认提交 |
| `filterOption` | `(query, option) => boolean` | `undefined` | 自定义本地过滤 |
| `loading` | `boolean` | `false` | 加载状态展示 |
| `emptyText` | `string` | `'暂无数据'` | 空状态文案 |

## Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:modelValue` | `string \| number \| Array<string \| number> \| undefined` | 选中值更新 |
| `change` | `string \| number \| Array<string \| number> \| undefined` | 选中值变化 |
| `clear` | `void` | 清空 |
| `open` | `void` | 打开 |
| `close` | `void` | 关闭 |
| `confirm` | `Array<string \| number>` | 多选确认 |
| `cancel` | `void` | 取消 |
| `search` | `string` | 搜索输入变化 |
| `limit` | `{ max: number }` | 超过最大选择数量 |
