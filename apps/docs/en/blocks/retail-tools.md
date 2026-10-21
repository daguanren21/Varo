# Retail Tools Blocks

Six independently installable native Weapp Blocks cover coupons, receipts, reviews, wishlists, mobile comparison and filters users edit before applying. They reuse the existing retail model without replacing cart, checkout or product detail.

## Installation and target boundaries

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-coupons
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-receipt
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-reviews
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-wishlist
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-comparison
pnpm dlx @varo-ui/cli add --target weapp blocks/retail-filters
```

Installed components live in `src/components/blocks/retail-*.vue`; public data contracts live in the corresponding `retail-*.types.ts`. Amounts reuse `formatRetailMoney` from `src/lib/retail`: integer minor units, divided by 100 for display, with the default RMB symbol `¥`. Do not pass major currency units into money fields.

- These entries support stable `weapp` only. There is no H5 implementation; experimental profiles require separate admission. Components use Wevu and do not import the Vue DOM runtime.
- The application handles data, stock, permissions, eligibility, business validation, submission, persistence, navigation, payments, refunds, support and files. Events request actions without confirming success. Blocks make no network/storage calls or optimistic business-data changes.
- Native events carry one detail value. Requests with several fields use one object instead of multiple Vue callback arguments. Event names below match the source.
- Collections default to empty arrays before the host first binds props. Absent `selectedId` and `receipt` retain native null; `open` opens only when explicitly true. Applications must still supply complete typed business data.
- IDs must be stable and unique within each collection. Look up the current record and recheck its permissions and version before accepting an action. Set `busy` immediately when handling asynchronous requests to prevent duplicate submissions.

### Shared states

All six Blocks accept optional `loading`, `disabled`, `busy` (default false) and `error` (default empty string). Loading, disabled and busy states block actions while keeping records, amounts, reasons and errors visible. `error` neither discards data nor retries; add `disabled` to prevent edits. Empty collections display a message, and long text wraps without requiring hover.

Filter cancel and close remain available while loading, disabled or busy. The application closes the Drawer and cancels pending work or ignores stale responses. The other five Blocks do not manage requests; applications can provide cancellation controls in their containers.

## Coupons: `retail-coupons`

| Prop         | Type             | Meaning                                      |
| ------------ | ---------------- | -------------------------------------------- |
| `items`      | `RetailCoupon[]` | Required; defaults to `[]` before binding    |
| `selectedId` | `string \| null` | Controlled selection; absent/null means none |

`RetailCoupon` fields:

| Field                                    | Type                                            | Meaning                                                                       |
| ---------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------- |
| `id`, `title`, `description`, `validity` | `string`                                        | Stable identity, title, complete terms and application-formatted validity     |
| `amount`                                 | `number`                                        | Face value in minor units                                                     |
| `status`                                 | `'available' \| 'owned' \| 'used' \| 'expired'` | Application-supplied status                                                   |
| `eligible`                               | `boolean`                                       | Eligibility decided by the application, never inferred from dates or spending |
| `canClaim`, `canSelect`                  | `boolean`                                       | Explicit action grants                                                        |
| `reason`                                 | `string?`                                       | Explanation of unavailable eligibility/actions                                |
| `disabled`, `busy`                       | `boolean?`                                      | Per-coupon disabled/pending state                                             |

Events `claim(id: string)` and `select(id: string)` look up the current coupon at activation. Claiming requires `available + eligible + canClaim`; selection requires `owned + eligible + canSelect` and a different selected ID. Used, expired, ineligible, disabled and busy actions are blocked. Only the application updates `status` after a claim or `selectedId` after a selection.

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

Implement `requestClaim` and `requestSelection` in the application, and update coupon status or selection only after the request is accepted.

## Receipt: `retail-receipt`

`receipt?: RetailReceipt | null` controls the content; absent/null produces an empty state. Order and payment states are independent injected facts, not inferred from totals.

`RetailReceipt` contains:

- `id`, `orderId`, `issuedAt: string`: receipt/order identifiers and application-formatted time.
- `orderStatus: RetailOrderSummary['status']`: `pending-payment`, `pending-delivery`, `pending-receipt`, `completed` or `after-sale`, reusing the existing retail contract.
- `paymentStatus: 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'`.
- `lines: { id, product: RetailProduct, quantity: number, total: number }[]`: application-calculated line totals in minor units.
- `totals: { id: string, label: string, amount: number }[]`: injected amount breakdown; discounts may be negative.
- `paidTotal: number`: the actual paid amount in minor units. The Block neither recomputes it from lines nor executes payment.
- `details: { id: string, label: string, value: string }[]`: complete payment-method, delivery, billing and other receipt details.
- `grants: Record<'refund' | 'contact' | 'download', boolean>`: each action requires an explicit true grant.
- `actionReason?: string`: grant restrictions or other action guidance.

The `action({ receiptId, orderId, action })` event uses `RetailReceiptAction`: `refund`, `contact` or `download`. The application handles confirmation, execution, failures and any required WeChat payment, support or file APIs. Events do not guarantee API availability; show refund or download success only after completion.

## Reviews: `retail-reviews`

| Prop            | Type                | Meaning                                                                                 |
| --------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `items`         | `RetailReview[]`    | Review list; defaults to `[]` before binding                                            |
| `draft`         | `RetailReviewDraft` | Controlled `{ rating: number, body: string }`; initialized to `{ rating: 0, body: '' }` |
| `canSubmit`     | `boolean`           | Explicit application grant; initialized false                                           |
| `ratingSummary` | `string?`           | Application-calculated rating summary                                                   |
| `draftError`    | `string?`           | Validation/submission feedback; does not clear the draft                                |

`RetailReview` has `id`, `author`, `body`, `createdAt: string`; `rating`, `helpfulCount: number`; `helpfulByViewer`, `canHelpful: boolean`; and optional `disabled`, `busy`.

- `draftChange(draft)` emits the complete draft. Rating editing permits integers 0–5; 0 means unselected. The application defines submission rules.
- `submit(draft)` emits a current snapshot only when `canSubmit` and not loading/disabled/busy. The application returns business errors such as empty content through `draftError`.
- `helpful(id)` rechecks the current review, requiring `canHelpful`, not already marked and not disabled/busy. The application owns the count and viewer marker.

Reviews support neither image uploads nor automatic moderation, and the Block does not fabricate ratings. Acceptance updates the list and clears the draft; rejection preserves input. The local example requires a rating from 1 to 5 and at least five characters. The reusable Block does not enforce these application rules.

## Wishlist: `retail-wishlist`

`items: RetailWishlistEntry[]` determines which products appear in the wishlist. Each entry includes:

- `product: RetailProduct`, reusing `category/description/id/image/linePrice/name/price/sales/stock/tags`.
- `canView`, `canRemove`, `canAddToCart: boolean`.
- `reason?: string`, `disabled?: boolean`, `busy?: boolean`.

Events are `view(productId)`, `remove(productId)` and `addToCart(productId)`. Every activation looks up the current member and corresponding grant. Cart requests additionally require actual `product.stock > 0`. Existing cart quantity, concurrent inventory changes and purchase limits remain application decisions. The Block maintains no local membership copy.

The wishlist reuses `product-list-item.vue` from `blocks/product-list` without copying product detail. Its native `viewDisabled` and `cartDisabled` props default to false, disable the respective controls and block events. Stock/loading checks and H5 behavior remain unchanged. Permission denial does not alter displayed stock: stock 2 remains 2 even when adding is forbidden.

## Mobile comparison: `retail-comparison`

| Prop     | Type                      | Meaning                                                |
| -------- | ------------------------- | ------------------------------------------------------ |
| `items`  | `RetailComparisonEntry[]` | Controlled product selection; initialized `[]`         |
| `fields` | `RetailComparisonField[]` | All fields chosen by the application; initialized `[]` |

`RetailComparisonField = { id: string, label: string }`. Each entry has `product: RetailProduct`, `values: Record<string, string>` (complete display values keyed by field ID), `canView`, `canRemove: boolean`, and optional `reason`, `disabled`, `busy`. Missing field values explicitly render “未提供” (not provided); they are never invented.

The public constant `RETAIL_COMPARISON_LIMIT = 3` limits the comparison. Full values appear vertically by field, without a wide grid or hover. More than three products displays an error and stops field comparison while retaining **every** product and its remove/view controls. The application accepts `remove(productId)` to bring the selection within the limit and handles `view(productId)` navigation. An empty field list retains products and displays “暂无比较字段” (no comparison fields).

## Transactional filters: `retail-filters`

The filter composes `VDrawer`, `VCheckbox`, `VInputNumber` and `VButton` using order-filter's selection and amount patterns. Product categories differ from order statuses, and order-filter's one-time `initialValue` and built-in status/price reset cannot manage a controlled product-filter draft and submission. This Block uses the controls directly without embedding order-filter or adding a generic filter engine.

```ts
interface RetailFilterValue {
  sort: 'recommended' | 'price-asc' | 'price-desc' | 'newest'
  categories: string[]
  minPrice: number // integer minor units
  maxPrice: number // integer minor units
  availability: 'all' | 'in-stock'
}
```

| Prop         | Type                                                         | Meaning                                                                    |
| ------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `open`       | `boolean`                                                    | Required controlled visibility; only true opens                            |
| `draft`      | `RetailFilterValue`                                          | Application-owned draft, not committed filters                             |
| `categories` | `{ id, label: string, disabled?: boolean }[]`                | Explicit category choices; default `[]`                                    |
| `sorts`      | `{ value: RetailSort, label: string, disabled?: boolean }[]` | Explicit sort choices; default `[]`                                        |
| `priceLimit` | `number`                                                     | Maximum permitted minor-unit integer, initialized 0; inject the real limit |
| `canApply`   | `boolean`                                                    | Whether an authorized change can be submitted; initialized false           |
| `canReset`   | `boolean`                                                    | Whether the draft can be reset; initialized false                          |

Events:

- `draftChange(value)`: changed choices/prices. Unchanged values and disabled options do not emit.
- `apply(value)`: a draft snapshot. Prices must be integral and within the allowed range, minimum cannot exceed maximum, selected category/sort choices must still exist and be enabled, and `canApply` must be true. Final business validation and acceptance still belong to the application.
- `reset()`: requests a **draft-only** reset. The application owns defaults; the Block never updates committed results itself.
- `cancel()`: explicit cancel or overlay-close request. The Block does not mutate controlled `open`. Close, discard the draft and handle pending work in the application.

On open, copy committed state into a draft and replace that draft on `draftChange`. Reset changes only the draft. Revalidate `apply` in the application: on acceptance, update committed state and close; on rejection, keep the Drawer, draft and previous results. Cancel discards the draft. Set `canApply=false` when filters are unchanged and `canReset=false` when the draft already has the default values. Set `busy=true` during asynchronous handling; cancellation remains available.

## Complete local demo and acceptance entry

Native route: `/blocks-lab/retail/index`. Authored example source: `apps/playground-weapp/src/blocks-lab/retail/`. The page explicitly labels every workflow as local in-memory data. Switching examples reinitializes them. No real service is called.

| Unit       | Positive workflow                                                                                    | Negative path and recovery                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Coupons    | Claim request → application acceptance → select the claimed coupon                                   | Member/expired/used actions disabled; revoke eligibility while pending → reject; cancel preserves coupon                               |
| Receipt    | Read evidence, open contact guidance; request/accept local after-sale                                | Download initially ungranted; rejection preserves order; granting download only produces a clearly unconnected intent, never success   |
| Reviews    | Type rating/content → application acceptance → actually append local review; increment helpful count | Invalid draft feedback; rejection retains input; pending, forbidden and repeated helpful actions disabled                              |
| Wishlist   | Open local product content, add to local bag, remove member                                          | Stock/permission denial; application rejection; cart stock-limit error; displayed stock remains accurate                               |
| Comparison | Read every field, view/remove products                                                               | Fourth product visibly exceeds the limit; removal restores comparison; locked member blocked                                           |
| Filters    | Category, sort, price and stock choices filter actual local products                                 | Cancel does not commit; reset affects draft only; invalid prices block apply; application rejects delivery category; zero-result state |

Each example has loading, empty, error, disabled, busy and long-content controls. Native E2E scenarios in `apps/e2e/tests/weapp-native/retail-tools.e2e.ts` use public fixtures, real buttons, inputs and Drawer controls, and page results. They do not replace user flows with `setData`, page methods or source-text assertions.

Generate the Registry, register native routes and rebuild before running the scenarios; written tests are not passing results. `weapp-headless` supports native automation but does not establish WeChat IDE/device behavior. `weapp-devtools` also needs Developer Tools, a legitimate AppID, CLI/automation permission and fresh builds. Production applications must provide business APIs, authentication/eligibility/inventory rechecks, payment/refund adapters, support, receipt downloads and required domain/host permissions.
