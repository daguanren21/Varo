# Marketing Blocks

六个可独立安装、按目标实现的页面切片：Hero/CTA、文章、定价/比较、FAQ、联系表单与流程说明。H5 使用 Vue，原生使用 Wevu 和 Varo 控件；共享文件仅包含类型。Block 不调用业务服务，不自动导航、扣款、发送邮件或虚构进度。

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

安装器继续解析控件声明的工具、主题与 npm 依赖；各 Marketing 单元互不依赖，也不安装 Agent 聚合包。联系表单直接组合输入控件，不依赖原生 Form；已知上游 Form plain-slot 问题仍是原问题，没有添加兼容上下文来掩盖它。

H5 安装完整依赖 CSS。原生通过 `weapp.styles` 全局加载安装的样式，`varo.css` 在前，`include: 'app.vue'`；不要在 `apply-shared` 组件的局部 WXSS 中导入全局样式。配置见 [Registry 模式](/guide/shadcn-mode)。当前仅准入稳定 `h5`、`weapp`，不代表实验 profile 或真机认证。

## 状态与所有权

应用拥有数据、权限、验证决定、持久化、导航和全部外部副作用。条目 ID 必须稳定且唯一。组件在激活时按 ID 重新查找当前条目，拒绝已移除、禁用、未授权或无变化的操作，再发出意图。UI 守卫不是服务端授权。异步工作开始后，应用应立即注入 pending 状态，并仅在接受真实结果后更新受控值。

所有 Block 都接受 `loading?: boolean`、`error?: string`、`disabled?: boolean`，默认分别为 `false`、`''`、`false`。加载、错误或禁用期间保留已有内容。非空 error 会阻止操作；Contact 是例外，可恢复的提交错误仍允许修改和重新提交。空集合有明确提示；Contact 保留可编辑的空草稿，不把空字段伪装为数据错误。长文自然换行，不静默截断。

以下事件在两端均为**一个 payload**，不需要 Vue 多参数回调到原生 tuple 的转换。FAQ 展开数组、联系字段、所选方案与周期都是必填受控输入；请明确传入空数组或空字符串。原生必填集合显式声明 `properties: { …: { type: Array, value: [] } }`，确保宿主绑定前立即求值的派生数据也能读取数组；仅有 `withDefaults` 不能初始化这一阶段。这些默认值不会使输入变成非受控模式，也不用于归一化无效的外部数据。

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

动作 ID **不是 URL**。H5 应用自行选择路由或页内操作；原生应用将获准 ID 映射到已注册的小程序页面、具备权限的宿主 API 或页内面板。不要在共享/原生逻辑中使用 `window.location`、`mailto:` 或浏览器历史。执行前重新检查目标与宿主权限，并反馈真实宿主错误；Block 不能保证页面已打开或信息已送达。

## 文章

必填：`items: MarketingArticle[]`。

每项包含 `id`、`title`、`summary`、`category`、`readingTime`、`canOpen`，可选 `disabled` 和 `image: { src, alt }`。可选 props：`title = 'From the Varo journal'`、`pendingId = ''`、`emptyText = 'No articles available.'` 以及公共状态。

`open` 携带激活时的当前文章。组件每个本地页面展示**三张卡片**，提供上一页、下一页和页码。所有注入文章均可到达，不静默丢弃尾部数据。数据改变后页码收敛到有效范围。这不是远程分页 API；应用应提供有界的编辑集合，或在 Block 外实现服务端分页。

详情正文与打开方式由应用拥有。演示打开实际本地撰写的完整正文，提供 Close article；列表加载或禁用时关闭入口仍可用。`canOpen: false` 保留卡片但禁用动作。`pendingId` 阻止翻页与重复打开，不清除已有内容。

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

`update:expandedIds` 提议新的展开数组；应用替换自己的数组才表示接受。允许同时展开多个问题。下一次接受切换时移除已经不存在的条目 ID。答案作为纯文本显示，不执行 HTML。

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

下面的 H5 示例真实验证输入并追加到内存收据列表，**没有邮件传输**。完整 playground 还提供手动 pending/接受/拒绝/取消流程。

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

原生页面改用 `wevu`，收据列表使用原生 `view`/`text` 与已安装的原生 SFC。Boolean 字面量必须显式绑定，例如 `:can-submit="true"`。真实发送需要应用自己的后端、隐私/同意策略、滥用防护和真实传输错误处理，不能将本地示例标成“邮件发送成功”。

## Process / How it works

必填：`steps: MarketingProcessStep[]`。每项包含 `id`、`title`、`description`、`state: 'upcoming' | 'active' | 'completed'`，可选 `action: { label, allowed, disabled? }`。可选：`title = 'How it works'`、`pendingId = ''` 及公共状态。

`action` 检查当前动作授权后发送当前步骤。输入顺序就是展示顺序。状态完全由应用注入，不由下标、计时器或一次点击推断。应用可以允许重新访问已完成步骤，资格与展示状态相互独立。演示仅在真正打开说明内容后推进：“完成”只表示**本地说明已打开**，不表示软件安装或外部信息送达。

## 演示与可拒绝的验收场景

- H5：`/?demo=marketing-blocks`，实现位于 `apps/playground-h5/src/features/MarketingBlocksDemo.vue` 和 `useMarketingBlocksDemo.ts`。
- 原生：`/blocks-lab/marketing/index`，实现位于 `apps/playground-weapp/src/blocks-lab/marketing/`。
- E2E：`apps/e2e/tests/h5/marketing-blocks.e2e.ts`、`apps/e2e/tests/weapp-native/marketing-blocks.e2e.ts`。

源代码流向插图与文章文案为 Varo 自有创作，不使用 Pro 素材。Ready、Loading、Empty、Error、Disabled、Long content 按钮真实改变传入的 props。方案与联系请求由手动明确决定接受/拒绝，不通过计时器伪装服务完成。

两端 E2E 都通过真实控件覆盖：

1. Hero 授权、实际打开本地指南、禁止动作、保留关闭出口。
2. 每页三张卡片、当前详情、未发布卡片、加载期间禁止操作。
3. 周期切换、窄屏比较内容、方案待定、拒绝、接受、重复选择禁止。
4. FAQ 展开/收起、稳定 ID、禁用问题、长答案；H5 还覆盖 Enter/Space。
5. 实际输入、错误邮箱、字段错误、pending 锁定、拒绝、取消、本地收据与没有发送邮件的说明。
6. 合资格流程动作与仅限说明阅读的完成状态，以及未授权/无变化动作。
7. 加载/错误/禁用保留证据，空状态与恢复。

测试文件定义检查，不代表已经通过。集成 owner 需生成最新投影、接入路由、编译两端并执行测试。原生 headless/DevTools fixture 依赖仓库支持的引擎环境；DevTools/真机还需要有效的本地 AppID 与连接的宿主。SVG 呈现、长内容布局、文本缩放和原生可访问性必须在实际宿主观察；H5 截图或编译成功不能作为原生设备认证。
