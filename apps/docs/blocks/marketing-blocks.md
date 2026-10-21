# Marketing Blocks

六个可独立安装的 Block，用于 Hero/CTA、文章、定价/比较、FAQ、联系表单和流程说明。H5 使用 Vue，原生使用 Wevu 和 Varo 控件，共享文件只含类型。业务服务、导航、扣款和邮件发送由应用执行，进度也由应用提供。

## 按需安装与依赖闭包

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/marketing-hero
pnpm dlx @varo-ui/cli add --target weapp blocks/marketing-contact
```

将条目名替换为下表任一项即可。CLI 报告的 npm 依赖需要另外安装。每个清单将 `h5.vue` 或 `weapp-vite.vue` 显式映射到 `src/components/blocks/marketing-<unit>.vue`，纯类型映射到 `src/components/blocks/marketing-<unit>.types.ts`。

| Registry 条目               | 直接 Registry 依赖                                             | 公共类型                                                                                              |
| --------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `blocks/marketing-hero`     | `components/button`、`components/image`                        | `MarketingHeroContent`、`MarketingHeroAction`                                                         |
| `blocks/marketing-articles` | `components/button`、`components/image`                        | `MarketingArticle`                                                                                    |
| `blocks/marketing-pricing`  | `components/button`                                            | `MarketingPricingPlan`、`MarketingPricingPeriod`、`MarketingPricingFeature`、`MarketingPricingChoice` |
| `blocks/marketing-faq`      | `components/button`                                            | `MarketingFaqItem`                                                                                    |
| `blocks/marketing-contact`  | `components/button`、`components/input`、`components/textarea` | `MarketingContactValues`、`MarketingContactErrors`、`MarketingContactLabels`                          |
| `blocks/marketing-process`  | `components/button`                                            | `MarketingProcessStep`                                                                                |

安装器递归解析控件的工具、主题与 npm 依赖。Marketing 单元互不依赖，也不安装 Agent 聚合包。联系表单直接组合输入控件，不依赖原生 Form；上游 plain-slot 问题仍未解决，也未添加兼容上下文。

H5 安装完整依赖 CSS。原生通过 `weapp.styles` 全局加载安装的样式，`varo.css` 在前，`include: 'app.vue'`；不要在 `apply-shared` 组件的局部 WXSS 中导入全局样式。配置见 [Registry 模式](/guide/shadcn-mode)。当前仅准入稳定 `h5`、`weapp`，不代表实验 profile 或真机认证。

## 状态与所有权

应用提供数据和权限，负责验证、持久化、导航及外部操作。ID 必须稳定且唯一。组件按 ID 重新查找当前条目，阻止已移除、禁用、未授权或无变化的操作。服务端仍须检查授权。异步工作开始时传入 pending，接受结果后再更新受控值。

所有 Block 都接受 `loading?: boolean`、`error?: string`、`disabled?: boolean`，默认分别为 `false`、`''`、`false`。加载、错误或禁用时保留内容。非空 error 阻止操作，但 Contact 遇到可恢复的提交错误后仍可修改和重提。空集合显示提示，Contact 保留可编辑空草稿，不把空字段视为数据错误。长文换行，不截断。

两端事件均携带**一个 payload**，无需将 Vue 多参数回调转换为原生 tuple。FAQ 展开数组、联系字段、所选方案和周期均为必填受控输入，需显式传入空数组或空字符串。原生集合用 `properties: { …: { type: Array, value: [] } }` 初始化，供宿主绑定前的派生计算使用；`withDefaults` 无法覆盖这一阶段。默认值不改变受控模式，也不修正无效外部数据。

## Hero / CTA

必填：`content: MarketingHeroContent | null`。

```ts
interface MarketingHeroAction {
  id: string
  label: string
  allowed: boolean
  disabled?: boolean
  description?: string
}
interface MarketingHeroContent {
  eyebrow: string
  title: string
  description: string
  image?: { src: string, alt: string }
  actions: MarketingHeroAction[]
}
```

可选：`pendingActionId = ''`、`emptyText = 'No introduction available.'` 以及公共状态。第一个动作为主操作，其余为次要操作。`action` 事件携带当前 `MarketingHeroAction`。任何 pending ID 都锁定全部动作，匹配的按钮展示等待状态。`content: null` 显示空提示。媒体复用 `VImage`，保留高度、替代文本与加载/错误提示。

动作 ID **不是 URL**。H5 应用可映射到路由或页内操作；原生应用可映射到已注册页面、获准宿主 API 或页内面板。共享及原生逻辑不能使用 `window.location`、`mailto:` 或浏览器历史。执行前检查目标和宿主权限，执行后报告实际错误；事件不表示页面已打开或信息已送达。

## 文章

必填：`items: MarketingArticle[]`。

每项包含 `id`、`title`、`summary`、`category`、`readingTime`、`canOpen`，可选 `disabled` 和 `image: { src, alt }`。可选 props：`title = 'From the Varo journal'`、`pendingId = ''`、`emptyText = 'No articles available.'` 以及公共状态。

`open` 携带当前文章。每页展示**三张卡片**，有上一页、下一页和页码，全部文章均可翻页查看。数据变化后页码会调整到有效范围。分页只在本地执行，应用应传入有限集合，或在 Block 外实现服务端分页。

应用提供正文和打开方式。演示显示完整本地文章，列表加载或禁用时仍可 Close article。`canOpen: false` 禁用动作但保留卡片；`pendingId` 阻止翻页和重复打开，不移除内容。

## 定价 / 比较

必填 props：

- `plans: MarketingPricingPlan[]`：`id`、`name`、`description`、`prices: Record<periodId, string>`、`features: Record<featureId, string>`、`canChoose`、可选 `disabled`。
- `features: MarketingPricingFeature[]`：比较字段顺序，每项 `{ id, label }`。
- `periods: MarketingPricingPeriod[]`：`{ id, label, disabled? }`。
- `periodId: string`、`selectedPlanId: string`：应用控制的周期与方案，`''` 表示尚未选方案。

可选：`title = 'Compare your options'`、`pending = false` 及公共状态。事件：`periodChange(id: string)`、`choose({ planId, periodId }: MarketingPricingChoice)`。

每个方案按相同字段顺序逐项展示标签和值，窄屏无需 hover 即可比较。所有注入的方案与字段都渲染。缺失字段显示 “Not specified”；缺失或空价格显示 “Not offered for this period”，不能选用。无效/禁用周期、未授权方案、pending、重复选择当前方案都不会发出选择事件。价格是应用传入的展示文本；Block 不计算折扣、税额或扣费。

切换周期是否清空方案由应用决定，演示明确清空。请求方案后，旧选择在本地决定前保持不变；Accept 才存入本地选择，Reject 保留旧选择并显示错误。示例价格**不是 Varo 商业报价**，也不会创建订阅。

## FAQ

必填：实例内外不冲突的 `idPrefix: string`、`items: MarketingFaqItem[]`、`expandedIds: string[]`。每项包含 `id`、`question`、`answer`，可选 `disabled`。可选：`title = 'Questions, answered'` 及公共状态。

`update:expandedIds` 发出新的展开数组，应用替换自己的数组后才会更新展开状态。可以同时展开多个问题；下一次接受切换时，会移除已不存在的条目 ID。答案按纯文本显示，不执行 HTML。

H5 的 Varo 按钮带 `aria-expanded`、稳定的 `aria-controls`/答案 ID 与有名称的 region；原生使用真实 Varo 点击控件，以 Expand/Collapse 可访问名称和 pressed 状态说明展开状态，不承诺浏览器 focus API。已展开答案即使被禁用仍保持可读。演示包含真实长答案及禁用问题。

## Contact 联系表单

必填：`values: MarketingContactValues`、`canSubmit: boolean`。

```ts
interface MarketingContactValues { name: string, email: string, message: string }
type MarketingContactErrors = Partial<Record<keyof MarketingContactValues, string>>
interface MarketingContactLabels {
  name: string
  email: string
  message: string
  submit: string
  pending: string
}
```

可选：`errors = {}`、`labels`（默认 Name/Email/Message/Submit contact request/Awaiting acknowledgement…）、`title = 'Talk with us'`、`description = ''`、`pending = false`、`acknowledgement = ''` 与公共状态。

事件：

- `update:values(values)`：提议完整草稿，不发出相同值或被阻止的编辑。
- `submit(values)`：仅在 canSubmit 且非 loading/pending/disabled 时发送草稿快照。**Block 不决定输入是否有效。**
- `cancel()`：pending 时可用，即使其他操作禁用也保留取消。应用必须自行取消或忽略真实未完成请求。

`VInput`/`VTextarea` 提供标签、字段错误和 invalid 状态。pending 禁用编辑及重复提交，但保留草稿。H5 使用语义 form 与 submit 按钮；原生使用 Varo 控件的点击处理，不假设浏览器 form 事件或邮件 URL。通用提交错误不会清空字段。`acknowledgement` 必须对应真实的应用结果。

### 完整的本地联系示例

下面的 H5 示例验证输入后，将数据追加到内存收据列表，不发送邮件。完整 playground 还提供手动 pending、接受、拒绝和取消流程。

```vue
<script setup lang="ts">
import type { MarketingContactErrors, MarketingContactValues } from '@/components/blocks/marketing-contact.types'
import { shallowRef } from 'vue'
import MarketingContact from '@/components/blocks/marketing-contact.vue'

const values = shallowRef<MarketingContactValues>({ name: '', email: '', message: '' })
const errors = shallowRef<MarketingContactErrors>({})
const receipts = shallowRef<MarketingContactValues[]>([])
const acknowledgement = shallowRef('')
function submit(draft: MarketingContactValues) {
  const next: MarketingContactErrors = {}
  if (!draft.name.trim()) { next.name = '请输入姓名。' }
  if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(draft.email.trim())) { next.email = '请输入有效邮箱。' }
  if (draft.message.trim().length < 10) { next.message = '请至少输入 10 个字符。' }
  errors.value = next
  acknowledgement.value = ''
  if (Object.keys(next).length) { return }
  receipts.value = [...receipts.value, { ...draft }]
  acknowledgement.value = `已保存第 ${receipts.value.length} 条本地收据，没有发送邮件。`
}
function update(next: MarketingContactValues) {
  values.value = next
  errors.value = {}
  acknowledgement.value = ''
}
const labels = { name: '姓名', email: '邮箱', message: '留言', submit: '提交本地请求', pending: '等待确认' }
</script>

<template>
  <MarketingContact
    :values="values" :can-submit="true" :errors="errors" :labels="labels"
    :acknowledgement="acknowledgement" @update:values="update" @submit="submit"
  />
  <ul aria-label="本地收据">
    <li v-for="(receipt, index) in receipts" :key="index">
      {{ receipt.name }}：{{ receipt.message }}
    </li>
  </ul>
</template>
```

原生页面改用 `wevu`，收据列表使用原生 `view`/`text` 和已安装的原生 SFC。Boolean 字面量必须显式绑定，例如 `:can-submit="true"`。发送邮件需要应用提供后端、隐私与同意策略、滥用防护及传输错误处理。本地示例只保存收据，不能显示“邮件发送成功”。

## Process / How it works

必填：`steps: MarketingProcessStep[]`。每项包含 `id`、`title`、`description`、`state: 'upcoming' | 'active' | 'completed'`，可选 `action: { label, allowed, disabled? }`。可选：`title = 'How it works'`、`pendingId = ''` 及公共状态。

`action` 检查授权后发送当前步骤，显示顺序与输入一致。应用提供状态，Block 不按下标、时间或点击推断。操作资格与展示状态独立，因此应用可允许重访已完成步骤。演示打开说明后才推进；“完成”仅表示**本地说明已打开**，不表示软件安装或信息送达。

## 演示与可拒绝的验收场景

- H5：`/?demo=marketing-blocks`，实现位于 `apps/playground-h5/src/features/MarketingBlocksDemo.vue` 和 `useMarketingBlocksDemo.ts`。
- 原生：`/blocks-lab/marketing/index`，实现位于 `apps/playground-weapp/src/blocks-lab/marketing/`。
- E2E：`apps/e2e/tests/h5/marketing-blocks.e2e.ts`、`apps/e2e/tests/weapp-native/marketing-blocks.e2e.ts`。

源代码流向插图和文章由 Varo 创作，未使用 Pro 素材。Ready、Loading、Empty、Error、Disabled、Long content 按钮改变传入 props。方案和联系请求由使用者手动接受或拒绝，不用计时器模拟服务结果。

两端 E2E 都通过真实控件覆盖：

1. Hero 授权、实际打开本地指南、禁止动作、保留关闭出口。
2. 每页三张卡片、当前详情、未发布卡片、加载期间禁止操作。
3. 周期切换、窄屏比较内容、方案待定、拒绝、接受、重复选择禁止。
4. FAQ 展开/收起、稳定 ID、禁用问题、长答案；H5 还覆盖 Enter/Space。
5. 实际输入、错误邮箱、字段错误、pending 锁定、拒绝、取消、本地收据与没有发送邮件的说明。
6. 合资格流程动作与仅限说明阅读的完成状态，以及未授权/无变化动作。
7. 加载/错误/禁用保留证据，空状态与恢复。

集成后需生成最新投影、接入路由、编译两端并运行测试，才能判断用例是否通过。原生 headless/DevTools fixture 需要受支持的引擎环境；DevTools 和真机还需有效本地 AppID 及连接的宿主。SVG、长文布局、文本缩放和原生可访问性需在实际宿主检查，H5 截图或编译成功不能证明设备表现。
