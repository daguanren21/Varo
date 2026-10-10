# Application Blocks

七个可编辑的移动应用区块，分别提供稳定 **H5（Vue）** 与 **Weapp（Wevu）** 源码。它们是受控展示组件，不是账号、授权、预约或持久化服务。

## 安装与所有权

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/settings-panel
pnpm dlx @varo-ui/cli add --target weapp blocks/step-form
```

可将名称替换为下表任一单元。每项安装 `src/components/blocks/<name>.vue` 与纯类型/函数文件 `<name>-actions.ts`。消费者从安装树导入，不直接引用仓库 Registry 源码。CLI 会报告 npm 依赖，但不会代为安装。这些 manifest 不自动准入实验性原生 profile。

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

**记录、受控选中值、校验决策、权限授予、pending 状态、外部导航和副作用全部归应用所有。** 事件只是请求，绝不表示服务已执行成功。接受请求时必须重新读取应用当前数据，异步校验后尤其如此。拒绝时保留受控值与错误，接受后用不可变替换更新。Block 在操作触发时重新查找当前项，拒绝不存在、禁用、忙碌、不支持或无变化的修改；这只是交互保护，不能作为授权边界。

所有单元支持可选 `title`。集合有原生绑定前安全空值，调用方仍应传入必填集合。集合内 ID 必须稳定且唯一。文本自然换行，无仅悬停才能访问的详情、静默截断、内置网络、持久化或虚构指标。

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

第一步不能后退；非最后一步才有 next，最后一步才有 finish；两者均要求当前步骤 `canContinue`。越界位置显示空态，不虚构有效步骤。close 在 busy/disabled 和空态中仍可使用；没有当前步骤时 `stepId` 为 `''`。应用决定是否隐藏、接受导航或记录完成，组件不会自行推进。`canNavigateOnboarding` 提供相同纯校验规则。

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

**原生 Form 边界：** 本 Block 沿用已有 login/profile 的宿主 form 容器 + VInput/VSwitch 组合，不使用 VForm 校验 provider，也不验证或修复独立的原生 **VForm plain-slot** 问题。该集成仍然阻塞；没有上下文桥、slot 配置修改或模拟宿主几何。H5 使用语义 `<form>` 并阻止浏览器默认提交；原生使用宿主 `<form>` 与 VButton 已支持的 submit 行为。

另一个独立限制：当前 `@weapp-vite/miniprogram-automator` 1.2.23 的 headless `tap()` 不执行原生 form submit 默认动作，多步表单的必需 E2E 因未触发校验而失败。保留真实 `<form>` 提交与失败断言，不通过调用页面方法、直接触发 submit 或增加仅为 headless 服务的 click 提交来绕过。需在具备该默认动作的公开驱动或授权 DevTools/设备上完成此流程；这与 VForm provider 上下文问题不是同一个故障。

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

注入顺序就是显示顺序；时间和状态文案由应用提供，Block 不排序、不测量、不推算进度或编造时间。pending/error 保留原有证据。retry 同时要求 `status === 'error'` 与 `canRetry === true`；detail 要求 `canDetail === true`；二者均受 busy/disabled/loading 保护。`canRequestTimeline` 提供纯守卫。重试执行及历史变化归应用所有。

## summary-dashboard

```ts
interface SummaryMetric { id: string, label: string, value: string, context: string }
interface SummaryRow { id: string, title: string, detail: string }
interface SummaryPeriod { id: string, label: string, disabled?: boolean }
type SummaryIntent = { action: 'period', id: string } | { action: 'retry' }
```

必填：`metrics`、`summaries`、`periods`、`period: string`。可选：`loading`、`disabled`、`error`、`canRetry`、`title`；布尔值均默认 false。事件：`intent(SummaryIntent)`。

指标值是应用格式化后的字符串，必须附带上下文。没有图表、聚合引擎或虚构趋势。受控 period 可表示应用定义的时间范围/筛选条件；当前和禁用选项不能重复选择。retry 要求非空错误与显式 canRetry，loading/disabled 时不可用。加载/错误期间保留原有行与指标。`canSelectSummaryPeriod` 提供选择守卫。原生指标纵向排列，H5 在宽视口可使用两列。

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

请传入**应用限制大小的分页集合**；示例每页两条，此移动布局建议每页不超过 20 条。所有传入记录都会显示，不静默截断。hasMore 暴露受控 more 请求；分页、筛选和获取数据归应用所有，不冒充虚拟化。内联详情只对当前存在且 canDetail 为真的记录显示。关闭操作在 pending 或所选记录消失后仍然可用。

应用提供精确的可选角色/状态与 approval/removal 授权，Block 不从角色名推断权限，也不决定哪些状态可审批。相同 role/status 值与不存在/disabled/busy 记录均被拒绝。`canRequestPerson` 是对应纯守卫。应用接受审批后应撤销 canApprove，防止重复审批。破坏性确认归应用：示例先打开本地确认，再次检查记录后才从本地列表删除。筛选变化时应清除不再属于当前页的详情和待确认操作。

## 完整本地演示与 E2E

- H5：`/?demo=application-blocks`，由 `ApplicationBlocksDemo.vue` 和 `useApplicationBlocksDemo.ts` 组成。
- 原生：`/blocks-lab/application/index`，由原生页面与 `use-application-demo.ts` 组成。
- 场景：`apps/e2e/tests/{h5,weapp-native}/application-blocks.e2e.ts`。

两端都有七个区块入口与明确标注的 disabled/pending/empty 注入控件。切换区块保留本地状态，重载重置。多步表单等待本地校验、拒绝保留/重复姓名、保留往返输入，并在接受同意后真正插入一条内存记录。时间线 retry 校验姓名后导入另一条记录；摘要统计这些**实际记录**与实际人员列表。预约维护独立本地账本，构造真正的本地冲突，然后接受/取消另一个时段。人员管理提供分页、筛选、授权修改/审批及可取消删除确认。没有模拟网络、邮件、认证、支付或预约服务成功。

两端对应场景覆盖受控设置拒绝、引导边界与退出、表单无效/返回/成功路径、时间线重试、真实衍生摘要与筛选/错误、预约冲突/接受/取消、人员授权/分页/编辑/审批/删除，以及空态/pending/disabled 下的证据保留。测试通过实际控件操作并读取可观察状态，不使用 setData、页面方法代替操作、实现文本断言或虚构几何。

源码交付与集成验收是不同阶段：路由注册、Registry 生成、样式、类型/构建及上述真实 E2E 必须针对集成后的产物执行。原生 headless 成功不代表设备/视觉认证；原生 DevTools 场景需要可用微信开发者工具、授权的本地 AppID/项目配置与仓库真实 fixture。真实账户存储、预约服务、授权和异步服务端校验属于应用外部前提，不是 Block 提供的服务。
