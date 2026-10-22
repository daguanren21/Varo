# Agent Activity Block

组合活动轨迹和任务操作。`AgentActivity` 展示六种状态，Varo `VButton` 发出开始、批准、重试和取消请求。数据、权限、状态转换、审批、执行、网络和存储由应用处理；Block 不运行任务或乐观更新状态，点击不代表执行成功。

## 安装与依赖闭包

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/agent-activity
# 原生 Wevu 工程
pnpm dlx @varo-ui/cli add --target weapp blocks/agent-activity
```

CLI 列出的 npm 依赖需要另外安装。该项依赖 `components/agent-advanced` 和 `components/button`，无需安装完整的 `components/agent-ui`。Activity 的类型和渲染器随可选的 advanced 单元提供，不包含在基础 conversation/presentation 单元中。

| 安装内容         | H5                                                        | 原生 Wevu                                                      |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| Block            | `src/components/blocks/agent-activity.vue`，来自 `h5.vue` | 同一目标路径，来自 `weapp-vite.vue`                            |
| 类型与纯动作守卫 | `src/components/blocks/agent-activity-actions.ts`         | 相同纯 TypeScript 文件；无 Vue 运行时，与 SFC 使用不同输出名称 |
| 活动展示         | `agent-ui/advanced.ts` 中的 `AgentActivity`               | `agent-ui/AgentActivity.vue`；不复制 `advanced.ts`             |
| 共享展示类型     | advanced 源单元已有的 `agent-ui/advanced-types.ts`        | 同左                                                           |
| 样式             | advanced 自有 CSS、Agent 主题及按钮依赖样式由源文件导入   | Activity 自有 SFC 样式；base/Agent/button 依赖样式全局加载     |

Block 使用现有的语义 token 和 utility class。原生工程通过 `weapp.styles` 将安装的全局 CSS 加载到 `app.vue`，先加载 `varo.css`；不要把全局样式导入 `apply-shared` 组件的局部 WXSS。具体配置见 [Wevu Registry](/guide/shadcn-mode)。清单目前只声明支持 `h5`/`weapp`，不能据此认定其他宿主或设备已通过验证。

## 受控输入与事件

```ts
import type { AgentActivityItem, AgentActivityStatus } from '@/components/agent-ui/advanced-types'
import type { AgentActivityAction, AgentActivityTask } from '@/components/blocks/agent-activity-actions'
```

`AgentActivityStatus` 包含 `queued | running | waiting | failed | cancelled | completed`，仅用于展示。`AgentActivityItem.status` 使用这个类型；已有的 waiting/running/failed/completed 用法仍然有效，核心 `AgentPartStatus` 不变。

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

`start`、`approve`、`retry`、`cancel` 均以激活时当前 props 中的 `AgentActivityTask` 为单一载荷。发出事件前，组件按 id 查找当前项，检查状态、全局和单项禁用及动作授权；项目已移除、已结束，或动作不适用、未获授权时，不会发出事件。组件不发送 `update:items`，应用拒绝请求则 UI 不变。

## 状态 / 动作 / 转换表

| 当前状态    | 显示标签  | 可授予动作          | 演示中应用接受后的转换                   |
| ----------- | --------- | ------------------- | ---------------------------------------- |
| `queued`    | Queued    | `start`、`cancel`   | start → running；cancel → cancelled      |
| `running`   | Running   | `cancel`            | cancel → cancelled                       |
| `waiting`   | Waiting   | `approve`、`cancel` | approve → running；cancel → cancelled    |
| `failed`    | Failed    | `retry`             | retry → queued，不直接宣称成功           |
| `cancelled` | Cancelled | 无                  | 终态；即使误传授予动作也不显示可操作按钮 |
| `completed` | Completed | 无                  | 终态；即使误传授予动作也不显示可操作按钮 |

表中的转换由示例应用处理，不定义新的传输协议。Block 仅限制可请求的动作，不转换状态或模拟完成。running → waiting/failed/completed 需由应用传入。状态适用但未授权的按钮禁用，终态显示 `No actions available`。运行中不能再次开始或批准，重试后处于 queued 时不能再重试，终态不可取消。

## 最小本地受控示例

此例仅演示本地状态转换，没有连接服务或执行器。实际使用时，应用的事件处理器需要检查权限、处理审批和服务请求，再根据结果更新 `items`。

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

异步请求发出后，应用应立即更新 `disabled` / `actions` 或任务状态，并在等待结果期间保持这些限制。Block 没有内置的请求锁、自动重试或成功缓存，界面上的动作检查也不能代替服务端授权。

## 交互演示与验证边界

H5 playground 的 `/?demo=activity` 与原生 `pages/agent-activity-demo/index` 使用明确标记的确定性本地数据。依次操作 `Start Draft report` → `Require local approval` → `Approve Draft report` → `Mark local failure` → `Retry Draft report` → `Start Draft report` → `Mark local complete`，可以查看应用如何控制整个流程；另一条运行项可取消。

`Restrict start` / `Allow start`、全局禁用、单项锁定和终态展示当前 props 如何影响可用操作。`Reject next request` 让应用拒绝下一次合法请求，状态保持不变；`Clear activity` 传入受控空数组。六种标签、按钮、结果和请求计数均通过实际页面交互观察。

E2E 文件为 `apps/e2e/tests/h5/activity.e2e.ts` 和 `apps/e2e/tests/weapp-native/activity.e2e.ts`。原生按钮依赖尚未发布的 Wevu plain-slot 协议，宿主也有观测限制；验证时须保留这些限制，模拟文本、DOM 几何或编译成功不能代替实际设备验证。
