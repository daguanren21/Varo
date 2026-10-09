# 零售工具 Blocks

六个可独立安装的微信原生页面切片：优惠券、凭证、评价、收藏、移动比较和事务式筛选。它们扩展既有零售模型，不替代或复制购物车、结算和商品详情。

## 安装与目标边界

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-coupons
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-receipt
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-reviews
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-wishlist
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-comparison
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-filters
```

安装后的组件位于 `src/components/blocks/retail-*.vue`，公开数据类型位于对应的 `retail-*.types.ts`。金额复用 `src/lib/retail` 的 `formatRetailMoney`：整数分，显示时除以 100，默认人民币符号 `¥`。不要把元直接传入金额字段。

- 这些条目仅声明稳定 `weapp` 目标，没有 H5 实现，也没有自动准入实验平台。使用 Wevu，不导入 Vue DOM 运行时。
- 数据、库存、权限、资格、业务校验、提交、持久化、导航、支付、退款、客服和文件操作属于应用。事件是意图，不是成功通知；Block 不请求网络、不写存储、不乐观改变业务数据。
- 原生事件携带一个 detail 值；复杂意图使用一个对象，而不是多个 Vue 回调参数。本文事件名保留源码拼写。
- 集合在原生首次绑定前有空数组默认值。`selectedId`、`receipt` 的缺省值保留原生 null；`open` 只有显式 `true` 才打开。业务数据仍应按完整类型注入。
- ID 必须稳定且在各集合内唯一。应用接受动作时应再次查找当前记录、检查权限和版本；异步任务需要立即注入 `busy`，避免重复请求。

### 公共状态

六个 Block 都接受可选 `loading`、`disabled`、`busy`（默认 `false`）及 `error`（默认空字符串）。加载、禁用和忙碌状态阻止动作，但保留已注入的数据、金额、理由和错误供核对。`error` 只呈现应用错误，不自动清空数据，也不暗中执行重试；应用可结合 `disabled` 决定是否允许修改。空数据有明确反馈，长文字自然换行，不使用仅悬停可读内容。

筛选的取消/关闭在加载、禁用和忙碌时仍可使用；应用处理取消意图并关闭 Drawer，同时负责取消在途请求或忽略过期响应。其他五个 Block 没有隐藏的请求生命周期，应用可在自己的容器提供取消动作。

## 优惠券 `retail-coupons`

| Prop         | 类型             | 含义                             |
| ------------ | ---------------- | -------------------------------- |
| `items`      | `RetailCoupon[]` | 必传，首次绑定前默认 `[]`        |
| `selectedId` | `string \| null` | 受控选中项；缺省/null 表示未选中 |

`RetailCoupon` 字段：

| 字段                                     | 类型                                            | 含义                                              |
| ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| `id`, `title`, `description`, `validity` | `string`                                        | 稳定 ID、标题、完整条件说明和应用提供的有效期文字 |
| `amount`                                 | `number`                                        | 整数分面额                                        |
| `status`                                 | `'available' \| 'owned' \| 'used' \| 'expired'` | 应用提供的券状态                                  |
| `eligible`                               | `boolean`                                       | 应用计算的适用资格；Block 不按金额或时间自行推断  |
| `canClaim`, `canSelect`                  | `boolean`                                       | 显式动作授权                                      |
| `reason`                                 | `string?`                                       | 不适用/不可操作的原因                             |
| `disabled`, `busy`                       | `boolean?`                                      | 单券禁用/在途状态                                 |

事件 `claim(id: string)`、`select(id: string)` 都重新按 ID 查找当前券。领取要求 `available + eligible + canClaim`；选择要求 `owned + eligible + canSelect`，且不是已选券。已使用、过期、不适用、禁用或忙碌的动作被阻止。领取后只有应用更新 `status`，选择后只有应用更新 `selectedId`。

```vue
<RetailCoupons
  :items="offers"
  :selected-id="selectedCouponId"
  :busy="claimPending"
  :error="couponError"
  @claim="requestClaim"
  @select="requestSelection"
/>
```

这里的 `requestClaim`/`requestSelection` 是应用处理器，不由 Block 实现；在服务接受之前不要修改券状态或选中值。

## 凭证 `retail-receipt`

`receipt?: RetailReceipt | null` 控制内容；null/缺省显示空态。订单和支付状态是独立注入的事实，不由金额推断。

`RetailReceipt`：

- `id`, `orderId`, `issuedAt: string`：凭证、订单和应用格式化时间。
- `orderStatus: RetailOrderSummary['status']`：`pending-payment`、`pending-delivery`、`pending-receipt`、`completed` 或 `after-sale`，复用既有零售类型。
- `paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'`。
- `lines: { id, product: RetailProduct, quantity: number, total: number }[]`：应用核算的行金额，单位分。
- `totals: { id: string, label: string, amount: number }[]`：应用提供的金额明细；折扣可以为负数。
- `paidTotal: number`：实际支付金额，单位分；Block 不根据行金额重新计算，也不会执行付款。
- `details: { id: string, label: string, value: string }[]`：付款方式、配送、抬头、业务说明等完整凭证信息。
- `grants: Record<'refund' | 'contact' | 'download', boolean>`：三个动作逐项显式授权，只有 `true` 可用。
- `actionReason?: string`：授权限制说明。

事件 `action({ receiptId, orderId, action })` 中 `action: RetailReceiptAction` 为 `refund`、`contact` 或 `download`。应用负责确认、执行与失败反馈；Block 不假设微信支付、客服或文件 API 存在。禁止把“意图已发出”显示成退款或下载成功。

## 评价 `retail-reviews`

| Prop            | 类型                | 含义                                                                        |
| --------------- | ------------------- | --------------------------------------------------------------------------- |
| `items`         | `RetailReview[]`    | 评价列表，首次绑定前默认 `[]`                                               |
| `draft`         | `RetailReviewDraft` | 受控 `{ rating: number, body: string }`，初始化为 `{ rating: 0, body: '' }` |
| `canSubmit`     | `boolean`           | 应用显式提交授权；初始化为 false                                            |
| `ratingSummary` | `string?`           | 应用计算的评分汇总                                                          |
| `draftError`    | `string?`           | 应用验证/提交错误；不会清除草稿                                             |

`RetailReview` 包含 `id`, `author`, `body`, `createdAt: string`，`rating`, `helpfulCount: number`，`helpfulByViewer`, `canHelpful: boolean`，以及可选 `disabled`, `busy`。

- `draftChange(draft)`：整个草稿值。评分编辑限制为整数 0–5，0 表示未选择；具体提交规则由应用校验。
- `submit(draft)`：当前草稿的快照。只有 `canSubmit` 且未加载/禁用/忙碌才发出；空文案等业务错误由应用返回 `draftError`。
- `helpful(id)`：重新查找当前评价；要求 `canHelpful`、尚未标记且未禁用/忙碌。计数和标记都由应用更新。

没有图片上传、自动审核或伪造的评分。应用在接受评价后更新 `items` 和草稿；拒绝时保留草稿。本地示例要求 1–5 分、至少五个字，这是示例应用规则，不是通用 Block 验证策略。

## 收藏 `retail-wishlist`

`items: RetailWishlistEntry[]` 是收藏成员的唯一权威。每项包含：

- `product: RetailProduct`，复用现有 `category/description/id/image/linePrice/name/price/sales/stock/tags` 契约。
- `canView`, `canRemove`, `canAddToCart: boolean`。
- `reason?: string`, `disabled?: boolean`, `busy?: boolean`。

事件为 `view(productId)`、`remove(productId)`、`addToCart(productId)`。每次激活都重新查找当前成员，检查对应授权；加购还要求真实 `product.stock > 0`。购物袋中已有数量、并发库存变化和购买上限仍由应用决定。Block 不维护一份本地收藏副本。

呈现复用 `blocks/product-list` 的 `product-list-item.vue`，不是复制商品详情。该原生行新增可选 `viewDisabled`、`cartDisabled`，均默认为 false；它们禁用对应控件并在事件处理处拦截。既有库存和 loading 防护保留，H5 API 未改变。权限不会通过伪造 `inventory = 0` 实现：例如无权加购但库存为 2 时，库存仍显示 2。

## 移动比较 `retail-comparison`

| Prop     | 类型                      | 含义                            |
| -------- | ------------------------- | ------------------------------- |
| `items`  | `RetailComparisonEntry[]` | 受控商品成员，初始化 `[]`       |
| `fields` | `RetailComparisonField[]` | 应用选择的全部字段，初始化 `[]` |

`RetailComparisonField = { id: string, label: string }`。每个 entry 包含 `product: RetailProduct`、`values: Record<string, string>`（按字段 ID 提供完整显示值）、`canView`, `canRemove: boolean`，以及可选 `reason`, `disabled`, `busy`。缺失的字段值明确显示“未提供”，不猜测值。

`RETAIL_COMPARISON_LIMIT = 3` 是公开常量。不是桌面横向大表：逐个字段纵向展示所有选中商品的完整值，无需 hover。传入超过三件时显式显示错误，停止字段比较，但列出**所有**选中商品及移出/查看控件；没有静默截取前三件。应用允许的 `remove(productId)` 可恢复到上限内；`view(productId)` 由应用导航。没有字段时保留商品，显示“暂无比较字段”。

## 事务式移动筛选 `retail-filters`

筛选组合现有 `VDrawer`、`VCheckbox`、`VInputNumber`、`VButton`，沿用 `order-filter` 的选择和金额控件模式。没有把订单状态伪装成商品分类：现有 order-filter 的一次性 `initialValue` 和内置状态/金额重置并不表达商品的受控事务，因此这里不嵌入它，也不另建泛用过滤引擎。

```ts
interface RetailFilterValue {
  sort: 'recommended' | 'price-asc' | 'price-desc' | 'newest'
  categories: string[]
  minPrice: number // 整数分
  maxPrice: number // 整数分
  availability: 'all' | 'in-stock'
}
```

| Prop         | 类型                                                         | 含义                                             |
| ------------ | ------------------------------------------------------------ | ------------------------------------------------ |
| `open`       | `boolean`                                                    | 必传受控打开状态，只有 true 打开                 |
| `draft`      | `RetailFilterValue`                                          | 应用拥有的草稿，不是已提交筛选                   |
| `categories` | `{ id, label: string, disabled?: boolean }[]`                | 显式分类选项，默认 `[]`                          |
| `sorts`      | `{ value: RetailSort, label: string, disabled?: boolean }[]` | 显式排序选项，默认 `[]`                          |
| `priceLimit` | `number`                                                     | 最大允许整数分，初始化为 0；应用必须提供真实上限 |
| `canApply`   | `boolean`                                                    | 是否有可提交的变化/权限，初始化 false            |
| `canReset`   | `boolean`                                                    | 草稿是否允许重置，初始化 false                   |

事件：

- `draftChange(value)`：选择/价格变化；未变值、已禁用选项不发事件。
- `apply(value)`：草稿快照；价格必须为允许范围内的整数，最低不得超过最高，所选分类/排序必须仍然存在且可选，且 `canApply` 为 true。应用仍须执行业务校验与最终接受。
- `reset()`：请求重置**草稿**。默认筛选由应用持有；Block 不自行改变已提交结果。
- `cancel()`：取消按钮或遮罩关闭请求。Block 不擅自改变受控 `open`；应用应关闭、丢弃草稿，并处理在途请求。

推荐事务：打开时从 `committed` 复制草稿 → 按 `draftChange` 替换草稿 → reset 只恢复草稿默认值 → apply 由应用再次校验并接受 → 接受后更新 `committed` 并关闭 → 拒绝时保持 Drawer、草稿和旧结果 → cancel 丢弃草稿。相同筛选应由应用设置 `canApply=false`，默认草稿应设置 `canReset=false`。需要异步接受时注入 `busy=true`；取消出口仍然开放。

## 完整本地示例与验收入口

原生路由 `/blocks-lab/retail/index`，源码在 `apps/playground-weapp/src/blocks-lab/retail/`。页面明确标为“本地数据”，切换六个示例重新初始化内存状态；不调用真实服务。

| 单元   | 正向流程                                                    | 负向与恢复                                                                         |
| ------ | ----------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 优惠券 | 请求领取 → 应用接受 → 选择新券                              | 会员/过期/已使用禁用；待处理时撤销资格 → 拒绝；取消不改变券                        |
| 凭证   | 查看明细 → 联系说明；本地售后申请 → 接受                    | 下载默认无授权；拒绝售后保持原订单；授权下载后只呈现未接入适配器的意图，不宣称成功 |
| 评价   | 输入评分/正文 → 应用接受 → 真正加入本地列表；有帮助计数更新 | 空草稿校验失败；拒绝保留输入；待处理/无授权/重复帮助禁用                           |
| 收藏   | 查看本地商品内容、加购物袋、移出成员                        | 缺货、无权限按钮禁用；应用拒绝、库存上限错误；库存展示不造假                       |
| 比较   | 阅读全部字段、查看/移出商品                                 | 第四件触发显式上限，移出恢复；锁定成员不可操作                                     |
| 筛选   | 真实分类、排序、价格、有货条件作用于本地商品                | 取消不提交、reset 只改草稿、无效价格阻止提交、应用拒绝配送分类、无结果状态         |

每个示例都有加载、空数据、错误、禁用、忙碌和长内容控件。真实 native E2E 场景定义于 `apps/e2e/tests/weapp-native/retail-tools.e2e.ts`，使用已公开 fixture、真实按钮/输入/Drawer 和页面结果，不使用 `setData`、页面方法代替操作或源码文本断言。

运行依赖集成者先完成 Registry 生成、原生页面路由登记与新产物构建；本页不声明测试已通过。`weapp-headless` 是受支持的原生运行时自动化表面，不代替微信 IDE/真机证明。`weapp-devtools` 还需要开发者工具、合法 AppID、CLI/自动化权限和新构建产物。生产应用必须另行提供业务 API、认证/资格/库存再校验、支付/退款适配、客服渠道、凭证文件下载能力及所需域名与宿主权限。
