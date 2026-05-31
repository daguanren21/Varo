# SideNavbar 侧边栏导航

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VSideNavbar, VSideNavbarItem } from '@varo/ui-h5'

const active = ref('orders')
</script>

<template>
  <VSideNavbar v-model="active">
    <VSideNavbarItem name="orders" title="订单" />
    <VSideNavbarItem name="assets" title="资产" badge="3" />
    <VSideNavbarItem name="settings" title="设置" />
  </VSideNavbar>
</template>
```

## 跨端演示

<PlatformTabsDemo example="side-navbar" locale="zh" />

## VSideNavbar Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `undefined` | 当前选中项 |

## VSideNavbar Events

| Event | Payload | 描述 |
| --- | --- | --- |
| `update:modelValue` | `string \| number` | 选中项变化 |
| `change` | `string \| number` | 选中项变化 |

## VSideNavbarItem Props

| Prop | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `name` | `string \| number` | - | 导航项标识 |
| `title` | `string` | `undefined` | 导航标题 |
| `badge` | `string \| number` | `undefined` | 徽标 |
| `disabled` | `boolean` | `false` | 是否禁用 |

