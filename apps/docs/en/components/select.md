# Select

`VSelect` is the low-level Base Kit select component for forms, filters, and secondary business wrappers. It uses `picker` mode by default so H5, mini-program, and App outputs share a mobile-first interaction.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'

const city = ref<string | number>()
const cities = [
  { label: 'Shanghai', value: 'shanghai' },
  { label: 'Hangzhou', value: 'hangzhou' }
]
</script>

<template>
  <VSelect v-model="city" :options="cities" placeholder="Select city" />
</template>
```

## Multiple Selection

```vue
<script setup lang="ts">
import { ref } from 'vue'

const values = ref<Array<string | number>>([])
const options = [
  { label: 'Pending', value: 'pending' },
  { label: 'Done', value: 'done' },
  { label: 'Cancelled', value: 'cancelled' }
]
</script>

<template>
  <VSelect v-model="values" multiple :options="options" placeholder="Select status" />
  <VSelect v-model="values" multiple :confirmable="false" :options="options" />
</template>
```

## Search And Dropdown

```vue
<template>
  <VSelect v-model="city" searchable :options="cities" />
  <VSelect v-model="city" mode="dropdown" :options="cities" />
</template>
```

## Wrapper Boundary

Grouped options, remote search, and async paging belong in secondary wrappers. Business components should wrap `VSelect` to create `UserSelect`, `DepartmentSelect`, `CitySelect`, and `ProductSelect`.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| number \| Array<string \| number>` | `undefined` | Selected value |
| `options` | `VSelectOption[]` | `[]` | Options |
| `mode` | `'picker' \| 'dropdown'` | `'picker'` | Presentation mode |
| `placeholder` | `string` | `'请选择'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `readonly` | `boolean` | `false` | Readonly state |
| `clearable` | `boolean` | `false` | Shows a clear action |
| `multiple` | `boolean` | `false` | Enables multiple selection |
| `max` | `number` | `undefined` | Maximum selected count |
| `searchable` | `boolean` | `false` | Enables local search |
| `confirmable` | `boolean` | `true` | Confirms draft changes in multiple mode |
| `filterOption` | `(query, option) => boolean` | `undefined` | Custom local filter |
| `loading` | `boolean` | `false` | Loading display |
| `emptyText` | `string` | `'暂无数据'` | Empty state text |
