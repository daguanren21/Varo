# Application Blocks

七个可编辑的移动应用区块，提供稳定 H5（Vue）和 Weapp（Wevu）源码。组件负责受控展示；账号、授权、预约和持久化服务需由应用接入。

## 安装与所有权

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/settings-panel
pnpm dlx @varo-ui/cli add --target weapp blocks/step-form
```

可将名称替换为下表任一单元，每项安装 `src/components/blocks/<name>.vue` 和纯类型/函数文件 `<name>-actions.ts`。从安装目录导入，不直接引用仓库 Registry 源码。npm 依赖需按 CLI 报告另行安装。这些 manifest 不自动准入实验性原生 profile。

| 单元                  | 直接组件依赖          |
| --------------------- | --------------------- |
| `settings-panel`      | Button、Switch        |
| `onboarding-flow`     | Button                |
| `step-form`           | Button、Input、Switch |
| `status-timeline`     | Button                |
| `summary-dashboard`   | Button                |
| `appointment-booking` | Button                |
| `people-manager`      | Button                |

组件自身的工具、主题和 headless 依赖由 manifest 递归解析，不引入整套应用、零售或 Agent 组件。原生消费者通过 `weapp.styles` 全局加载安装样式；Block 不在组件局部 WXSS 中导入 H5 或全局 CSS。

应用维护记录、受控选中值、校验结果、权限和 pending 状态，执行导航及外部操作。收到事件后，应用需重新读取当前数据，尤其是在异步校验后；拒绝时保留受控值与错误，接受后以不可变替换更新。事件不表示服务成功。Block 会重新查找当前项，阻止不存在、禁用、忙碌、不支持或无变化的修改，但应用仍须独立鉴权。

所有单元接受可选 `title`。原生集合在绑定前默认为空，调用方仍须传入必填集合，ID 必须稳定且唯一。文本会换行，不截断，也无需悬停查看详情。Block 不请求网络、不持久化数据或编造指标。

## settings-panel

`SettingEntry` 使用判别联合：

```ts
interface SettingOption { value: string, label: string, disabled?: boolean }
type SettingEntry = {
  id: string
  label: string
  description?: string
  disabled?: boolean
  pending?: boolean
  error?: string
} & (
  | { kind: 'boolean', value: boolean }
  | { kind: 'choice', value: string, options: SettingOption[] }
  | { kind: 'readonly', value: string }
)
interface SettingChange { id: string, value: string | boolean }
```

| 属性/事件                 | 契约                                   |
| ------------------------- | -------------------------------------- |
| `entries: SettingEntry[]` | 必填；包含受控值与可选项               |
| `loading`、`disabled`     | 可选，默认 `false`；禁止修改但保留记录 |
| `error`                   | 可选应用级错误；每行 `error` 独立保留  |
| `change(SettingChange)`   | 请求修改值，不表示偏好已保存           |

只读项没有编辑控件。pending/disabled 项及禁用选项不能触发修改，选择当前值是 no-op。应用可复用纯函数 `canChangeSetting(entry, value, blocked?)`。

```vue
<script setup lang="ts">
import type { SettingChange, SettingEntry } from './components/blocks/settings-panel-actions'
import { shallowRef } from 'vue'
import { canChangeSetting } from './components/blocks/settings-panel-actions'
import SettingsPanel from './components/blocks/settings-panel.vue'

const entries = shallowRef<SettingEntry[]>([
  { id: 'alerts', kind: 'boolean', label: '本地提醒', value: false },
])
function accept(change: SettingChange) {
  const entry = entries.value.find(item => item.id === change.id)
  if (!entry || !canChangeSetting(entry, change.value)) { return }
  if (entry.kind !== 'boolean' || typeof change.value !== 'boolean') { return }
  entries.value = [{ ...entry, value: change.value }]
}
</script>

<template>
  <SettingsPanel :entries="entries" @change="accept" />
</template>
```

Weapp 调用方使用 `wevu` 而不是 `vue`；事件同样只携带一个对象。

## onboarding-flow

```ts
interface OnboardingStep {
  id: string
  title: string
  description: string
  canContinue: boolean
}
interface OnboardingIntent {
  action: 'back' | 'next' | 'finish' | 'close'
  stepId: string
  position: number
}
```

必填：`steps: OnboardingStep[]`、从零开始的 `position: number`。可选：`busy`、`disabled`（均默认 `false`）、`error`、`title`。事件：`intent(OnboardingIntent)`。

第一步不能后退；最后一步之前提供 next，最后一步提供 finish，两者均要求当前步骤 `canContinue`。越界位置显示空态。close 在 busy/disabled 和空态中仍可使用；无当前步骤时 `stepId` 为 `''`。应用决定是否隐藏组件、切换步骤或记录完成，组件不自行推进。`canNavigateOnboarding` 提供相同的校验规则。

## step-form

```ts
interface StepFormOption { value: string, label: string, disabled?: boolean }
type StepFormField = {
  id: string
  label: string
  description?: string
  disabled?: boolean
} & (
  | { kind: 'text', placeholder?: string, maxLength?: number }
  | { kind: 'choice', options: StepFormOption[] }
  | { kind: 'boolean' }
)
interface StepFormStep {
  id: string
  title: string
  description?: string
  fields: StepFormField[]
  disabled?: boolean
}
type StepFormValues = Record<string, string | boolean>
type StepFormIntent
  = | { action: 'change', stepId: string, fieldId: string, value: string | boolean }
    | { action: 'previous' | 'next' | 'submit', stepId: string, position: number, values: StepFormValues }
```

必填：`steps`、从零开始的 `position`、`values`。字段 ID 需跨步骤唯一，以便往返时保留值。可选：`errors: Record<string, string>`（默认 `{}`）、提交错误 `error`、`busy`、`disabled`、`title`。事件：`intent(StepFormIntent)`。

文本事件携带字符串，布尔字段携带布尔值，choice 必须匹配启用选项；只能修改当前步骤内字段。previous/next 不越界，只有最后一步可 submit。步骤的 `disabled` 阻止编辑与前进，但允许返回上一步；全局 busy/disabled 禁止全部表单操作。注入校验错误不清空字段，也不乐观推进。导航事件附带值快照，应用需确认其仍属于当前数据版本。纯函数：`canChangeStepField`、`canNavigateStepForm`。

应用处理流程：

1. 接受 change 时更新受控值映射。
2. next/submit 时设置 busy，等待真正的校验回调；拒绝则注入字段/提交错误。
3. await 后重新确认步骤和数据版本，`finally` 清理 busy。
4. 校验通过后才更新 position。通过应用服务或本地数据所有者执行提交，不把收到事件当成成功。

本 Block 沿用 login/profile 的宿主 form 容器与 VInput/VSwitch 组合，不使用 VForm 校验 provider。独立 VForm 的 plain-slot 上下文已在受支持的 7.5.0 编译配置下验证，但与这里的宿主 form 默认动作无关。H5 使用语义 `<form>` 并阻止浏览器默认提交；原生使用宿主 `<form>` 和 VButton submit，不增加上下文桥或模拟宿主几何。

仓库的原生 E2E 使用针对 `@weapp-vite/miniprogram-automator` 1.3.0 的 pnpm patch，在模拟器的原生默认动作层执行 form submit，并保留多步表单的校验与本地提交断言。补丁范围和升级验证要求见[安装指南](/guide/installation#确定性-e2e-与证据边界)；微信开发者工具与设备验收仍是独立步骤。

## status-timeline

```ts
interface TimelineEntry {
  id: string
  title: string
  detail: string
  timeLabel: string
  status: 'pending' | 'active' | 'complete' | 'error'
  statusLabel: string
  canRetry?: boolean
  canDetail?: boolean
  disabled?: boolean
  busy?: boolean
}
interface TimelineIntent { action: 'retry' | 'detail', id: string }
```

必填：`entries`。可选：`loading`、`disabled`、`error`、`title`。事件：`intent(TimelineIntent)`。

组件按传入顺序显示记录，时间和状态文案由应用提供，不排序、测量、推算进度或生成时间。pending/error 时保留已有内容。retry 要求 `status === 'error'` 和 `canRetry === true`；detail 要求 `canDetail === true`；busy/disabled/loading 均会阻止这两项操作。应用可复用 `canRequestTimeline` 检查，并负责执行重试和更新历史。

## summary-dashboard

```ts
interface SummaryMetric { id: string, label: string, value: string, context: string }
interface SummaryRow { id: string, title: string, detail: string }
interface SummaryPeriod { id: string, label: string, disabled?: boolean }
type SummaryIntent = { action: 'period', id: string } | { action: 'retry' }
```

必填：`metrics`、`summaries`、`periods`、`period: string`。可选：`loading`、`disabled`、`error`、`canRetry`、`title`；布尔值均默认 false。事件：`intent(SummaryIntent)`。

应用传入格式化的指标字符串及其上下文；Block 不提供图表、聚合计算或趋势推算。受控 period 可表示应用定义的时间范围或筛选条件，当前值和禁用项不可选择。retry 要求非空错误和显式 canRetry，loading/disabled 时不可用。加载或错误时保留行与指标。`canSelectSummaryPeriod` 提供选择检查。原生指标纵向排列，H5 在宽视口可使用两列。

## appointment-booking

```ts
interface BookingDate { id: string, label: string, disabled?: boolean }
interface BookingSlot {
  id: string
  dateId: string
  label: string
  detail?: string
  available: boolean
  busy?: boolean
}
type BookingIntent
  = | { action: 'date', dateId: string }
    | { action: 'slot' | 'submit', dateId: string, slotId: string }
    | { action: 'cancel' }
```

必填：`dates`、`slots`、受控 `dateId`、`slotId`、`statusLabel`、`canSubmit`。未选中使用 `''`。可选：`canCancel`、`loading`、`busy`、`disabled`、`error`、`title`；布尔值均默认 false。事件：`intent(BookingIntent)`。

只展示选定日期的时段。禁用日期、不可用/忙碌时段不能选择或提交，提交还必须有 canSubmit。重复日期/时段选择不发事件。应用接受日期变化时应清空或替换 slotId。`canSelectBookingSlot` 只检查当前注入数据，不代表服务端实时可用；提交时需重新查询权威预约数据，冲突则注入拒绝，成功后更新时段可用性。只要 canCancel 为真，即使其他控件处于 busy/disabled，cancel 仍可触发；这只是退出/取消请求，不表示退款或服务取消已完成。应用实际操作完成后才能通过 statusLabel 提供确认。

## people-manager

```ts
interface PersonChoice { value: string, label: string, disabled?: boolean }
interface ManagedPerson {
  id: string
  name: string
  detail: string
  role: string
  roleLabel: string
  status: string
  statusLabel: string
  roleChoices: PersonChoice[]
  statusChoices: PersonChoice[]
  canDetail: boolean
  canApprove: boolean
  canRemove: boolean
  disabled?: boolean
  busy?: boolean
  error?: string
}
interface PeopleFilter { id: string, label: string, disabled?: boolean }
type PersonMutation
  = | { action: 'role' | 'status', id: string, value: string }
    | { action: 'approve' | 'remove' | 'detail', id: string }
type PeopleIntent = PersonMutation
  | { action: 'filter', id: string }
  | { action: 'close' } | { action: 'more' }
```

必填：`people`、`filters`、受控 `filter`、`detailId`（`''` 表示关闭详情）。可选：`hasMore`、`loading`、`disabled`、`error`、`title`。事件：`intent(PeopleIntent)`。

应用应按页传入数据；示例每页两条，移动布局建议每页不超过 20 条。组件显示全部传入记录，不截断。hasMore 控制 more 请求，应用负责分页、筛选和获取数据；这里不提供虚拟化。详情仅显示当前存在且 canDetail 为真的记录，pending 或记录消失时仍可关闭。

应用提供允许的角色、状态选项及审批、删除权限。Block 不根据角色名推断权限或可审批状态；相同 role/status 值及不存在、disabled、busy 的记录均不能修改。`canRequestPerson` 提供相同检查。接受审批后应撤销 canApprove，防止重复审批。应用负责删除确认：示例确认后重新检查记录，再从本地列表删除。筛选变化时，清除已不属于当前页的详情和待确认操作。

## 完整本地演示与 E2E

- H5：`/?demo=application-blocks`，由 `ApplicationBlocksDemo.vue` 和 `useApplicationBlocksDemo.ts` 组成。
- 原生：`/blocks-lab/application/index`，由原生页面与 `use-application-demo.ts` 组成。
- 场景：`apps/e2e/tests/{h5,weapp-native}/application-blocks.e2e.ts`。

两端均有七个区块入口，以及标明为注入状态的 disabled/pending/empty 控件。切换区块保留本地状态，重载则重置。多步表单等待本地校验，拒绝保留姓名和重复姓名，保留往返输入，同意后插入内存记录。时间线 retry 校验姓名后导入另一条记录，摘要统计这些记录和人员列表。预约使用独立本地账本演示冲突，再接受或取消另一个时段。人员管理提供分页、筛选、获准的修改与审批，以及可取消的删除确认。这些演示不模拟网络、邮件、认证、支付或预约服务成功。

两端对应场景覆盖受控设置拒绝、引导边界与退出、表单无效/返回/成功路径、时间线重试、真实衍生摘要与筛选/错误、预约冲突/接受/取消、人员授权/分页/编辑/审批/删除，以及空态/pending/disabled 下的证据保留。测试通过实际控件操作并读取可观察状态，不使用 setData、页面方法代替操作、实现文本断言或虚构几何。

集成后需完成路由注册、Registry 生成、样式和类型/构建检查，并对产物运行上述 E2E。原生 headless 通过不能证明设备或视觉表现；DevTools 场景需要可用微信开发者工具、获授权的本地 AppID/项目配置及仓库 fixture。真实账户存储、预约、授权和异步服务端校验需由应用接入。
