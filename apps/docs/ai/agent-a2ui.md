# A2UI 原生界面

`components/agent-a2ui` 是微信小程序的可选 Registry 单元。它使用官方 A2UI Core 管理 surface 和数据绑定，用 Wevu 渲染节点。普通 `blocks/agent-chat` 不安装这个单元。

## 安装

在 [Wevu Registry 项目](../guide/shadcn-mode)中运行：

```bash
pnpm dlx @varo-ui/cli add --target weapp components/agent-a2ui
```

安装 CLI 列出的 npm 依赖，并按 [原生样式配置](../guide/shadcn-mode)全局加载复制的样式。CLI 不会安装 npm 依赖。全新项目如果同时需要聊天和 A2UI，可在同一条 `add` 命令中列出两个单元，共享依赖只复制一次。该单元不支持 H5 或实验性小程序 profile。

如果项目已经安装了共享组件，请在空目录中安装 A2UI，再把缺少的文件合并到项目。不要用 `--force` 覆盖已经定制的组件。

入口在缺少 `Object.hasOwn` 的宿主上安装该标准方法，供锁定版本的 A2UI Core 使用。已有实现保持不变。复制单元时须保留 `core-compat.js`，不能只复制 SFC。

## 渲染和交互

在 `src/pages/index/index.vue` 中使用以下示例。点击按钮后，页面会显示收到的 action，不发送网络请求。

```vue
<script setup lang="ts">
import type { A2uiSurfaceView } from '../../components/agent-a2ui/session'
import { onLoad, onUnload, shallowRef } from 'wevu'
import { A2UI_CATALOG_ID, createA2uiSession } from '../../components/agent-a2ui/session'
import VAgentSurface from '../../components/agent-a2ui/VAgentSurface.vue'

const surfaces = shallowRef<A2uiSurfaceView[]>([])
const receipt = shallowRef('')
const session = createA2uiSession({
  onSurfaces: (views) => { surfaces.value = views },
  onAction: (message) => { receipt.value = JSON.stringify(message) },
})

onLoad(() => session.receive({
  version: '1.0',
  createSurface: {
    surfaceId: 'example',
    catalogId: A2UI_CATALOG_ID,
    components: [
      { id: 'root', component: 'Button', child: 'label', action: { event: { name: 'confirm' } } },
      { id: 'label', component: 'Text', text: '确认' },
    ],
  },
}))
onUnload(() => session.dispose())
</script>

<template>
  <VAgentSurface
    v-for="surface in surfaces"
    :key="surface.id"
    :surface="surface"
    @interaction="session.interact(surface.id, $event)"
  />
  <text>{{ receipt }}</text>
</template>
```

与 AgentChat 配合时，把 `VAgentSurface` 放进 `context` 插槽。应用用现有 TanStack `ChatClient` 连接接收事件，在 `onCustomEvent` 中将约定的 A2UI 消息交给 `session.receive()`。`onAction` 收到标准 A2UI action；由应用决定是否发送，并负责授权、重试和幂等。关闭会话时调用 `dispose()`。组件不要求新的传输方式。

`onAction` 可以返回 Promise；`session.interact()` 会等待它并向调用方传播拒绝。应用应捕获错误并展示发送结果。应用暂时不能接收动作时，给 `VAgentSurface` 传入 `:disabled="true"`，避免可点击按钮丢弃提交。服务端替换组件或对象数据时，节点交互 ID 会失效；把它视为临时视图标识，不要持久化。

## 支持范围

用安装目录下的 `catalog.json` 告知服务端支持的组件。服务端解析时使用支持 A2UI 1.0 的 catalog 加载器。该文件引用官方 A2UI 1.0 的 `common_types.json`，不是独立的 JSON Schema。

这个 catalog 只支持 `Column`、`Card`、`Text`、`TextField` 和 `Button`，不是完整的 Basic Catalog。`Text` 渲染纯文本。`TextField` 只有可写数据绑定时才能回写。`Button` 使用 `Text` 子节点作为标签，只派发事件。单元不执行远程 RPC。
