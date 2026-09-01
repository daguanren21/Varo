# shadcn 模式

CLI 把组件源码复制到项目中。安装后直接从 `src/components/ui/*` 导入并按业务修改。

## 安装

### H5

```bash
pnpm dlx @varo-ui/cli add --target h5 button form toast
```

### Wevu 小程序

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

### H5

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'
import { VButton } from '@/components/ui/button'

const loading = shallowRef(false)
</script>

<template>
  <VButton :loading="loading" @click="loading = true">
    保存
  </VButton>
</template>
```

### Wevu 小程序

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

H5 与小程序使用相同的组件 Props、Events 和 Slots；只有导入的目标源码不同。
