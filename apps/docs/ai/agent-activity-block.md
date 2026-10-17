# Agent Activity Block

可安装的活动轨迹与任务决策组合。复用 `AgentActivity` 展示六种状态，使用 Varo `VButton` 发出开始、批准、重试和取消意图。**数据、权限、有效转换、审批、真实执行、网络与存储全部由应用拥有**；Block 不运行任务，不乐观更新状态，也不把一次点击描述成执行成功。

## 安装与依赖闭包

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-activity
# 原生 Wevu 工程
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-activity
```

CLI 报告的 npm 依赖需要另外安装。该项显式依赖 `components/agent-advanced` 和 `components/button`，不需要安装聚合的 `components/agent-ui`。Activity 属于可选 advanced 源单元，不把它的类型或渲染器搬进基础 conversation/presentation 闭包。

| 安装内容         | H5                                                        | 原生 Wevu                                                      |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| Block            | `src/components/blocks/agent-activity.vue`，来自 `h5.vue` | 同一目标路径，来自 `weapp-vite.vue`                            |
| 类型与纯动作守卫 | `src/components/blocks/agent-activity-actions.ts`         | 相同纯 TypeScript 文件；无 Vue 运行时，与 SFC 使用不同输出名称 |
| 活动展示         | `agent-ui/advanced.ts` 中的 `AgentActivity`               | `agent-ui/AgentActivity.vue`；不复制 `advanced.ts`             |
| 共享展示类型     | advanced 源单元已有的 `agent-ui/advanced-types.ts`        | 同左                                                           |
| 样式             | advanced 自有 CSS、Agent 主题及按钮依赖样式由源文件导入   | Activity 自有 SFC 样式；base/Agent/button 依赖样式全局加载     |

Block 使用已有语义 token 和 utility class，不另建样式系统。原生工程通过 `weapp.styles` 将安装的全局 CSS 加载到 `app.vue`，`varo.css` 在前；不要把全局样式导入 `apply-shared` 组件局部 WXSS。具体配置见 [Wevu Registry](/guide/shadcn-mode)。清单目前只声明 `h5`/`weapp`，不是其他宿主或设备认证。

## 受控输入与事件

```ts
import type { AgentActivityItem, AgentActivityStatus } from '@/components/agent-ui/advanced-types'
import type { AgentActivityAction, AgentActivityTask } from '@/components/blocks/agent-activity-actions'
```

`AgentActivityStatus` 为 `queued | running | waiting | failed | cancelled | completed`，**仅用于展示**。`AgentActivityItem.status` 使用这个类型；原有 waiting/running/failed/completed 调用者保持有效，核心 `AgentPartStatus` 不变。

`AgentActivityTask extends AgentActivityItem`，保留 `id`、`title`、`kind`、`detail?`、`duration?`、`status`，只添加：

- `actions?: readonly AgentActivityAction[]`：应用明确授予的动作；缺省或空数组均不允许操作。
- `disabled?: boolean`：禁用此项的所有操作。

`id` 必须稳定且唯一。`items` 是唯一状态源，Block 不保存本地副本。

| Prop        | 类型                  | 默认值            | 含义                                    |
| ----------- | --------------------- | ----------------- | --------------------------------------- |
| `items`     | `AgentActivityTask[]` | 必填              | 应用注入的当前快照；`[]` 明确显示空状态 |
| `disabled`  | `boolean`             | `false`           | 禁用全部任务动作，包括取消              |
| `title`     | `string`              | `Task activity`   | 活动标题                                |
| `emptyText` | `string`              | `No activity yet` | 空状态提示                              |

`start`、`approve`、`retry`、`cancel` 四个事件均携带**激活时当前 props 中的 `AgentActivityTask`**。两端都是单一 payload，不存在多参数事件。组件按 id 重新查找当前项，再检查当前状态、全局禁用、单项禁用和授予动作；已移除、终态、不适用或不合资格的操作在 emit 前被拒绝。组件不发送 `update:items`，应用拒绝请求时 UI 保持原状。

## 状态 / 动作 / 转换表

| 当前状态    | 显示标签  | 可授予动作          | 演示中应用接受后的转换                   |
| ----------- | --------- | ------------------- | ---------------------------------------- |
| `queued`    | Queued    | `start`、`cancel`   | start → running；cancel → cancelled      |
| `running`   | Running   | `cancel`            | cancel → cancelled                       |
| `waiting`   | Waiting   | `approve`、`cancel` | approve → running；cancel → cancelled    |
| `failed`    | Failed    | `retry`             | retry → queued，不直接宣称成功           |
| `cancelled` | Cancelled | 无                  | 终态；即使误传授予动作也不显示可操作按钮 |
| `completed` | Completed | 无                  | 终态；即使误传授予动作也不显示可操作按钮 |

表中的转换属于**应用示例策略**，不是新的传输协议。Block 只限制当前状态下可请求的动作，不擅自转换状态。running → waiting/failed/completed 由应用注入结果；Block 没有“假完成”执行器。状态适用但未授权的按钮显示为禁用，终态显示 `No actions available`。开始后再次开始、批准后再次批准、重试后再次重试或终态取消都不再是可用动作。

## 最小本地受控示例

此例仅演示本地状态转换，没有服务或执行器。生产应用应在自己的处理器中执行真实权限、审批及服务策略，并根据真实结果更新 `items`。

```vue
<script setup lang="ts">
import type { AgentActivityAction, AgentActivityTask } from '@/components/blocks/agent-activity-actions'
import { shallowRef } from 'vue' // 原生页面改为 wevu
import { canRequestAgentActivityAction } from '@/components/blocks/agent-activity-actions'
import AgentActivityBlock from '@/components/blocks/agent-activity.vue'

const items = shallowRef<AgentActivityTask[]>([
  { id: 'local', title: '本地示例，无服务', kind: 'tool', status: 'queued', actions: ['start', 'cancel'] },
])

function acceptLocal(action: AgentActivityAction, requested: AgentActivityTask) {
  const current = items.value.find(item => item.id === requested.id)
  if (!current || !canRequestAgentActivityAction(current, action)) { return }
  const status = action === 'cancel' ? 'cancelled' : action === 'retry' ? 'queued' : 'running'
  const actions: AgentActivityAction[] = status === 'cancelled' ? [] : status === 'queued' ? ['start', 'cancel'] : ['cancel']
  items.value = items.value.map(item => item.id === current.id ? { ...item, status, actions } : item)
}
</script>

<template>
  <AgentActivityBlock
    :items="items"
    title="本地状态演示，无服务连接"
    @start="acceptLocal('start', $event)"
    @approve="acceptLocal('approve', $event)"
    @retry="acceptLocal('retry', $event)"
    @cancel="acceptLocal('cancel', $event)"
  />
</template>
```

异步请求发出后，应用应立即注入最新的 `disabled` / `actions` 或任务状态，直到获得真实结果；Block 不持有隐藏的请求锁、重试器或成功缓存。不要把 UI 守卫当成服务端授权。

## 交互演示与验证边界

H5 playground 的 `/?demo=activity` 与原生 `pages/agent-activity-demo/index` 使用清楚标记的确定性本地数据。`Start Draft report` → `Require local approval` → `Approve Draft report` → `Mark local failure` → `Retry Draft report` → `Start Draft report` → `Mark local complete` 展示完整应用控制流程；另一条运行项可取消。

`Restrict start` / `Allow start`、全局禁用、单项锁定和终态展示当前 props 的资格变化。`Reject next request` 由应用拒绝下一次合法意图，状态不乐观变化；`Clear activity` 注入受控空数组。六种标签、按钮、结果和意图计数均由真实页面交互观察。

对应 E2E 文件为 `apps/e2e/tests/h5/activity.e2e.ts` 和 `apps/e2e/tests/weapp-native/activity.e2e.ts`。原生按钮仍依赖当前 Wevu plain-slot 支持；已知未发布 plain-slot 协议和宿主观测限制必须作为验收边界保留，不能以假文本、DOM 几何或编译成功替代实际设备证据。
