# Marketing Blocks

Six installable, target-specific page slices: Hero/CTA, articles, pricing/comparison, FAQ, contact and process. H5 uses Vue; native uses Wevu and Varo controls. Shared files contain types only. These Blocks do not call business services, navigate, charge a customer, deliver email, or invent progress.

## Install only what you use

```bash
pnpm dlx @varo-ui/cli add --target h5 blocks/marketing-hero
pnpm dlx @varo-ui/cli add --target weapp blocks/marketing-contact
```

Replace the item name with any row below. Install the npm dependencies reported by the CLI separately. Each item explicitly maps `h5.vue` or `weapp-vite.vue` to `src/components/blocks/marketing-<unit>.vue` and its pure contract to `src/components/blocks/marketing-<unit>.types.ts`.

| Registry item               | Direct Registry dependencies                                   | Public contracts                                                                                      |
| --------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `blocks/marketing-hero`     | `components/button`, `components/image`                        | `MarketingHeroContent`, `MarketingHeroAction`                                                         |
| `blocks/marketing-articles` | `components/button`, `components/image`                        | `MarketingArticle`                                                                                    |
| `blocks/marketing-pricing`  | `components/button`                                            | `MarketingPricingPlan`, `MarketingPricingPeriod`, `MarketingPricingFeature`, `MarketingPricingChoice` |
| `blocks/marketing-faq`      | `components/button`                                            | `MarketingFaqItem`                                                                                    |
| `blocks/marketing-contact`  | `components/button`, `components/input`, `components/textarea` | `MarketingContactValues`, `MarketingContactErrors`, `MarketingContactLabels`                          |
| `blocks/marketing-process`  | `components/button`                                            | `MarketingProcessStep`                                                                                |

The installer resolves each control's declared utility, theme and npm dependencies; no Marketing item imports another Marketing item or the Agent suite. The contact Block deliberately composes input controls directly, not native Form: the known upstream plain-slot Form issue is not bypassed with a compatibility context.

H5 installs the dependency CSS closure. Native applications load the installed CSS globally with `weapp.styles`, `varo.css` first and `include: 'app.vue'`; never import global styles into an `apply-shared` component's WXSS. See [Registry mode](/en/guide/shadcn-mode). Only stable `h5` and `weapp` are admitted. This is not experimental-profile or device certification.

## Ownership and states

The application owns records, permissions, validation decisions, persistence, navigation and every external side effect. Supply stable unique IDs. Activation looks up the current item again, then rejects missing, disabled, ineligible and no-op mutations before emitting. Guards are not server authorization. If work becomes asynchronous, immediately supply the corresponding pending prop, then update controlled state only after the application accepts the result.

Every Block accepts `loading?: boolean`, `error?: string` and `disabled?: boolean` (defaults `false`, `''`, `false`). Existing content remains readable while actions are blocked. A nonempty error blocks actions except in Contact, where editing and resubmission remain possible after a recoverable submission error. Empty collections have visible messages; Contact instead keeps its empty editable draft. Long copy wraps rather than being silently truncated.

All events below carry **one payload** on both targets. No Vue-style multi-argument native event adapter is needed. FAQ expansion, contact values, selected plan and period are required controlled inputs; pass empty arrays/strings explicitly. Native required collection props declare `properties: { …: { type: Array, value: [] } }` so eagerly evaluated projections receive arrays even before host bindings arrive; `withDefaults` alone does not initialize this phase. These defaults do not make the inputs uncontrolled or normalize invalid supplied data.

## Hero / CTA

Required: `content: MarketingHeroContent | null`.

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

Optional: `pendingActionId = ''`, `emptyText = 'No introduction available.'`, plus common state props. The first action is visually primary; the rest are secondary. `action` emits the current `MarketingHeroAction`. Any pending ID blocks all actions and displays loading on the matching action. A null content value displays the empty message. Media uses `VImage` with reserved height, descriptive alt text and loading/error labels.

An action ID is **not a URL**. H5 applications may choose a router or in-page interaction. Native applications must map approved IDs to a registered mini-program page, an allowed host API, or an in-page panel. Do not use `window.location`, `mailto:` or browser history in shared/native handlers. Recheck host permissions and report real host errors; the Block cannot guarantee that navigation or delivery occurred.

## Articles

Required: `items: MarketingArticle[]`.

Each article has `id`, `title`, `summary`, `category`, `readingTime`, `canOpen`, optional `disabled`, and optional `image: { src, alt }`. Optional props are `title = 'From the Varo journal'`, `pendingId = ''`, `emptyText = 'No articles available.'` and common states.

`open` emits the current article. The Block renders **three cards per local page**, with Previous/Next controls and a page count. Every supplied article remains reachable; there is no silent slice limit. Pagination clamps to the available page range after data changes. It is not a remote pagination API. Applications should supply a bounded editorial collection or implement server paging outside the Block.

The application owns detail content and presentation. The lab opens full locally authored article bodies and provides a Close article control that remains available while the list is loading or disabled. `canOpen: false` displays the card but disables its action. `pendingId` blocks navigation and detail-open requests without removing existing evidence.

## Pricing / comparison

Required props:

- `plans: MarketingPricingPlan[]`: `id`, `name`, `description`, `prices: Record<periodId, string>`, `features: Record<featureId, string>`, `canChoose`, optional `disabled`.
- `features: MarketingPricingFeature[]`: the ordered comparison fields, each `{ id, label }`.
- `periods: MarketingPricingPeriod[]`: `{ id, label, disabled? }`.
- `periodId: string`, `selectedPlanId: string`: application-owned selection; `''` means no selected plan.

Optional: `title = 'Compare your options'`, `pending = false`, common states. Events: `periodChange(id: string)` and `choose({ planId, periodId }: MarketingPricingChoice)`.

Every plan repeats the same field labels in a vertical comparison, so differences remain readable on a narrow screen without hover. All supplied plans and features are rendered. A missing feature reads “Not specified”; a missing/empty price reads “Not offered for this period” and cannot be selected. Missing or disabled periods, ungranted plans, pending work and the already-selected plan cannot emit a new choice. Price strings are application-supplied: the Block does not calculate discounts, taxes or charges.

The host decides whether changing periods clears a plan. The lab clears it explicitly. A chosen plan remains unselected while a local decision is pending; Accept stores the local choice, Reject preserves the old selection and shows an error. These example prices are **not Varo commercial offers** and no subscription is created.

## FAQ

Required: `idPrefix: string` unique to this instance, `items: MarketingFaqItem[]`, `expandedIds: string[]`. Items contain `id`, `question`, `answer`, optional `disabled`. Optional: `title = 'Questions, answered'`, common states.

`update:expandedIds` proposes the new expanded ID array; the application accepts it by replacing its own array. Multiple questions can remain open. IDs that are no longer present are removed on the next accepted toggle. Content is plain text, not HTML.

H5 uses Varo buttons with `aria-expanded`, stable `aria-controls`/answer IDs and labelled regions; native uses actual Varo tap controls with an explicit Expand/Collapse accessible label and pressed state. Native does not promise browser focus APIs. An expanded disabled answer stays readable. The lab includes a long answer and a disabled question.

## Contact

Required: `values: MarketingContactValues`, `canSubmit: boolean`.

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

Optional props: `errors = {}`, `labels` (Name/Email/Message/Submit contact request/Awaiting acknowledgement…), `title = 'Talk with us'`, `description = ''`, `pending = false`, `acknowledgement = ''`, common states.

Events:

- `update:values(values)`: proposes a complete new draft; identical and blocked edits do not emit.
- `submit(values)`: emits a draft snapshot only when `canSubmit` and not loading/pending/disabled. **The Block does not decide validity.**
- `cancel()`: available during pending work, even when other actions are disabled. The application must cancel/ignore its own outstanding operation.

`VInput`/`VTextarea` expose labels, field errors and invalid state. Pending disables edits and duplicate submissions while keeping the draft visible. H5 uses a semantic form and submit button; native uses Varo controls and a tap handler, not a browser form event or email URL. General submission errors do not erase field values. Only show `acknowledgement` text backed by an actual application result.

### Complete local-only contact example

This H5 example validates and appends to an actual in-memory receipt list. It intentionally has **no email transport**. The full playground adds a manual pending/accept/reject/cancel decision.

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
  if (!draft.name.trim()) { next.name = 'Enter your name.' }
  if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(draft.email.trim())) { next.email = 'Enter a valid email address.' }
  if (draft.message.trim().length < 10) { next.message = 'Write at least 10 characters.' }
  errors.value = next
  acknowledgement.value = ''
  if (Object.keys(next).length) { return }
  receipts.value = [...receipts.value, { ...draft }]
  acknowledgement.value = `Local receipt ${receipts.value.length} saved. No email was sent.`
}
function update(next: MarketingContactValues) {
  values.value = next
  errors.value = {}
  acknowledgement.value = ''
}
</script>

<template>
  <MarketingContact
    :values="values" :can-submit="true" :errors="errors"
    :acknowledgement="acknowledgement" @update:values="update" @submit="submit"
  />
  <ul aria-label="Local receipts">
    <li v-for="(receipt, index) in receipts" :key="index">
      {{ receipt.name }}: {{ receipt.message }}
    </li>
  </ul>
</template>
```

For a native page, use `wevu` instead of `vue`, native `view`/`text` for the receipt list and the installed native SFC. Bind literal Boolean props explicitly (`:can-submit="true"`). Real delivery needs an application-owned backend, privacy/consent policy, abuse protection and honest transport error handling. Do not label this local example “email sent”.

## Process / How it works

Required: `steps: MarketingProcessStep[]`. Each step has `id`, `title`, `description`, `state: 'upcoming' | 'active' | 'completed'` and optional `action: { label, allowed, disabled? }`. Optional: `title = 'How it works'`, `pendingId = ''`, common states.

`action` emits the current step after checking its current action grant. Input order is display order. State is injected, never inferred from an index, elapsed time or a click. The application may allow revisiting a completed step; action eligibility is separate from display state. The lab advances only after opening actual instruction content: “completed” means those **local instructions were opened**, not that software was installed or a message was delivered.

## Demonstrations and acceptance scenarios

- H5: `/?demo=marketing-blocks` → `apps/playground-h5/src/features/MarketingBlocksDemo.vue` and `useMarketingBlocksDemo.ts`.
- Native: `/blocks-lab/marketing/index` → `apps/playground-weapp/src/blocks-lab/marketing/`.
- E2E: `apps/e2e/tests/h5/marketing-blocks.e2e.ts` and `apps/e2e/tests/weapp-native/marketing-blocks.e2e.ts`.

The source-flow illustration and article copy are authored for Varo, not copied from Pro assets. The Ready, Loading, Empty, Error, Disabled and Long content controls supply actual props. Plan and contact decisions are explicitly manual: no timer pretends that a service completed.

Both E2E suites use real controls and cover:

1. Hero grants, local guide opening, forbidden action and an available close exit.
2. Three-card pagination, current detail content, an unpublished card and loading rejection.
3. Period changes, mobile comparison content, pending plan choice, rejection, acceptance and no-op prevention.
4. FAQ expansion/collapse, stable IDs, disabled question and long answer; H5 includes Enter/Space.
5. Actual contact typing, invalid email, field errors, pending input lock, rejection, cancellation and an in-memory receipt with a no-email acknowledgement.
6. Eligible process actions and instruction-only completion, with unavailable/no-op actions blocked.
7. Loading/error/disabled evidence retention, empty messages and recovery.

These files define checks, not passing evidence. The integration owner must generate current projections, wire the routes, compile both targets and run the suites. Native headless/DevTools fixtures require the repository's supported engine setup; DevTools/device validation additionally requires a valid local AppID and connected host. SVG rendering, long-content layout, text scaling and native accessibility must be observed on the actual host; H5 screenshots and successful compilation do not certify native behavior.
