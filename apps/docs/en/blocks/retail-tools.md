# Retail Tools Blocks

Six independently installable native page slices: coupons, receipts, reviews, wishlists, bounded mobile comparison and transactional filters. They extend the existing retail model rather than cloning cart, checkout or product detail.

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

- These entries admit stable `weapp` only. There is no H5 implementation or automatic experimental-profile admission. Native code uses Wevu, not the Vue DOM runtime.
- The application owns data, stock, permissions, eligibility, business validation, submission, persistence, navigation, payments, refunds, support and file operations. Events request actions; they do not confirm success. Blocks make no network/storage calls and never optimistically change business data.
- Native events carry a single detail value. Compound intents use one object, not multiple Vue callback arguments. Event names below preserve source spelling.
- Collections have empty-array defaults for the host's pre-binding phase. Absent `selectedId` and `receipt` preserve native null; `open` opens only when explicitly true. Applications must still inject complete typed business data.
- IDs must be stable and unique within each collection. Re-read current records and recheck permission/version when accepting actions. Set `busy` immediately while handling asynchronous requests to prevent duplicate submissions.

### Shared states

All six Blocks accept optional `loading`, `disabled`, `busy` (default false) and `error` (default empty string). Loading, disabled and busy states block actions while retaining supplied records, amounts, reasons and errors for inspection. `error` only displays application feedback; it does not discard data or trigger retries. The application may combine it with `disabled` when further interaction is inappropriate. Empty collections have explicit feedback; long text wraps without hover-only disclosure.

Filter cancel/close remains available while loading, disabled or busy. The application handles that intent, closes the Drawer, and cancels pending work or ignores stale responses. The other five Blocks have no hidden request lifecycle; their application containers can expose cancellation controls.

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

`requestClaim` and `requestSelection` are application handlers, not Block implementations. Do not change coupon status or selection before the application accepts the request.

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

The `action({ receiptId, orderId, action })` event uses `RetailReceiptAction`: `refund`, `contact` or `download`. Confirmation, execution and failure feedback belong to the application. The Block does not assume that WeChat payment, support or file APIs are configured. Never turn an emitted intent into a claimed refund/download success.

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

There is no image upload, automatic moderation or fabricated rating. Update the list and clear the draft only after accepting it; preserve rejected input. The local example requires a 1–5 rating and at least five characters. This is an example application rule, not a hidden Block validation policy.

## Wishlist: `retail-wishlist`

`items: RetailWishlistEntry[]` is the sole authority for membership. Each entry includes:

- `product: RetailProduct`, reusing `category/description/id/image/linePrice/name/price/sales/stock/tags`.
- `canView`, `canRemove`, `canAddToCart: boolean`.
- `reason?: string`, `disabled?: boolean`, `busy?: boolean`.

Events are `view(productId)`, `remove(productId)` and `addToCart(productId)`. Every activation looks up the current member and corresponding grant. Cart requests additionally require actual `product.stock > 0`. Existing cart quantity, concurrent inventory changes and purchase limits remain application decisions. The Block maintains no local membership copy.

Presentation reuses `product-list-item.vue` from `blocks/product-list`, not a duplicated product-detail implementation. The native row adds optional `viewDisabled` and `cartDisabled` props, both default false. They disable the relevant controls and guard emission; existing stock/loading checks remain. H5 behavior is unchanged. Permission denial never falsifies inventory: an item with stock 2 still displays stock 2 even when adding is forbidden.

## Mobile comparison: `retail-comparison`

| Prop     | Type                      | Meaning                                                |
| -------- | ------------------------- | ------------------------------------------------------ |
| `items`  | `RetailComparisonEntry[]` | Controlled product selection; initialized `[]`         |
| `fields` | `RetailComparisonField[]` | All fields chosen by the application; initialized `[]` |

`RetailComparisonField = { id: string, label: string }`. Each entry has `product: RetailProduct`, `values: Record<string, string>` (complete display values keyed by field ID), `canView`, `canRemove: boolean`, and optional `reason`, `disabled`, `busy`. Missing field values explicitly render “未提供” (not provided); they are never invented.

`RETAIL_COMPARISON_LIMIT = 3` is a public constant. This is a field-by-field vertical mobile comparison, not a wide desktop grid. Every selected value is readable without hover. More than three products produces an explicit limit error and suspends the field comparison while retaining **every** selected product and its remove/view controls. It does not silently slice to the first three. An application-accepted `remove(productId)` restores the bounded comparison; `view(productId)` delegates navigation. An empty field list retains products with “暂无比较字段” (no comparison fields).

## Transactional filters: `retail-filters`

The mobile filter composes existing `VDrawer`, `VCheckbox`, `VInputNumber` and `VButton`, following order-filter's selection/amount control patterns. It does not disguise order statuses as categories. The existing order-filter's one-time `initialValue` and built-in status/price reset do not express a controlled product transaction, so it is not embedded and no parallel generic filtering engine is introduced.

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

Recommended transaction: copy committed state on open → replace the draft on `draftChange` → reset only the draft → revalidate `apply` in the application → update committed state and close only on acceptance → retain the Drawer, draft and previous results on rejection → discard the draft on cancel. Set `canApply=false` for an unchanged transaction and `canReset=false` for a default draft. Inject `busy=true` during asynchronous acceptance; cancellation remains available.

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

Each example exposes loading, empty, error, disabled, busy and long-content controls. Real native scenarios are authored in `apps/e2e/tests/weapp-native/retail-tools.e2e.ts`. They use public fixtures, actual buttons/inputs/Drawer and observable page results, not `setData`, page-method substitutes or implementation-text assertions.

Execution requires integration-owned Registry generation, route registration and fresh native build output first; this page does not claim tests have passed. `weapp-headless` is a supported native automation surface, not proof of WeChat IDE/device behavior. `weapp-devtools` also requires Developer Tools, a legitimate AppID, CLI/automation permission and current build artifacts. Production applications must separately supply business APIs, authentication/eligibility/inventory rechecks, payment/refund adapters, support channels, receipt file handling and required domain/host permissions.
