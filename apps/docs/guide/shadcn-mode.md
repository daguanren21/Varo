# Wevu Registry 模式

CLI 把适用于 Wevu 小程序的组件源码复制到项目中。安装后直接从 `src/components/ui/*` 导入并按业务修改。

## 安装

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite button form toast
```

把命令末尾的名称替换为需要的组件。安装 Block 或 Agent UI：

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite blocks/profile-edit
pnpm dlx @varo-ui/cli add --target weapp-vite components/agent-ui
```

CLI 默认不覆盖已有文件。确认要替换本地版本时使用 `--force`：

```bash
pnpm dlx @varo-ui/cli add --target weapp-vite --force button
```

## 使用

```vue
<script setup lang="ts">
import { shallowRef } from 'wevu'
import VButton from '@/components/ui/v-button.vue'

const loading = shallowRef(false)
</script>

<template>
  <VButton :loading="loading" @click="loading = true">
    保存
  </VButton>
</template>
```

组件源码、依赖工具和主题文件都位于业务项目中，可以直接修改。
