# SideNavbar

## Demo

<PlatformTabsDemo example="side-navbar" locale="en" />

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { VSideNavbar, VSideNavbarItem } from '@varo/ui-h5'

const active = ref('orders')
</script>

<template>
  <VSideNavbar v-model="active">
    <VSideNavbarItem name="orders" title="Orders" />
    <VSideNavbarItem name="assets" title="Assets" badge="3" />
    <VSideNavbarItem name="settings" title="Settings" />
  </VSideNavbar>
</template>
```

## VSideNavbar Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `modelValue` | `string \| number` | `undefined` | Selected item |

## VSideNavbar Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:modelValue` | `string \| number` | Selected item changed |
| `change` | `string \| number` | Selected item changed |

## VSideNavbarItem Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `name` | `string \| number` | - | Item name |
| `title` | `string` | `undefined` | Item title |
| `badge` | `string \| number` | `undefined` | Badge |
| `disabled` | `boolean` | `false` | Disabled state |
