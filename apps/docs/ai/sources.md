# AgentSourceList

外链、引用与来源列表。

## 案例

<AgentComponentDemo component="sources" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentSourceList } from '@/components/agent-ui'
</script>

<template>
  <AgentSourceList title="来源" :sources="sources" />
</template>
```

## Props

| Prop      | Type                | Default | 说明     |
| --------- | ------------------- | ------- | -------- |
| `sources` | `AgentSourceItem[]` | `[]`    | 来源列表 |
| `title`   | `string`            | `来源`  | 标题     |

## Events

| Event  | Payload           | 说明     |
| ------ | ----------------- | -------- |
| `open` | `AgentSourceItem` | 打开来源 |

## 平台差异

| Target | Import                                      |
| ------ | ------------------------------------------- |
| H5     | Named export from `@/components/agent-ui`   |
| weapp  | `@/components/agent-ui/AgentSourceList.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
