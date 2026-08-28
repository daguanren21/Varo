# AgentComposer

自动增长输入、建议词、键盘提交与发送状态。

## 案例

<AgentComponentDemo component="composer" locale="zh" />

## 安装

```bash
pnpm dlx @varo-ui/cli add --target h5 components/agent-ui
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

该组件属于 `components/agent-ui` 套件，CLI 会复制真实源码，不是运行时黑盒。

## 基础用法

```vue
<script setup lang="ts">
import { AgentComposer } from '@/components/agent-ui'
</script>

<template>
  <AgentComposer v-model="prompt" :suggestions="suggestions" @submit="send" />
</template>
```

## Props

| Prop          | Type       | Default | 说明         |
| ------------- | ---------- | ------- | ------------ |
| `busy`        | `boolean`  | `false` | 处理中       |
| `disabled`    | `boolean`  | `false` | 禁用；小程序 |
| `maxLength`   | `number`   | `4000`  | 最大长度；H5 |
| `modelValue`  | `string`   | `''`    | 输入内容     |
| `placeholder` | `string`   | `—`     | 占位文案     |
| `suggestions` | `string[]` | `[]`    | 提示建议     |

## Events

| Event               | Payload  | 说明       |
| ------------------- | -------- | ---------- |
| `update:modelValue` | `string` | 更新输入   |
| `submit`            | `string` | 提交提示词 |

## Slots

| Slot       | 说明         |
| ---------- | ------------ |
| `leading`  | 前置操作；H5 |
| `trailing` | 后置操作；H5 |

## 平台差异

| Target     | Import                                    |
| ---------- | ----------------------------------------- |
| H5         | Named export from `@/components/agent-ui` |
| weapp-vite | `@/components/agent-ui/AgentComposer.vue` |

组件 API 在两个目标保持一致；DOM/WXML、调度和原生事件由目标实现负责。
