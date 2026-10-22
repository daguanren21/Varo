# Marketing Blocks

Six independently installable Blocks cover Hero/CTA, articles, pricing/comparison, FAQ, contact forms and process instructions. H5 uses Vue; native uses Wevu and Varo controls. Shared files contain only types. The application handles business services, navigation, payments and email, and supplies progress.

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

The installer resolves controls' utility, theme and npm dependencies recursively. Marketing items do not depend on each other or install the Agent suite. Contact composes input controls without native Form. The upstream plain-slot issue remains unresolved, with no compatibility context added.

H5 installs the dependency CSS closure. Native applications load the installed CSS globally with `weapp.styles`, `varo.css` first and `include: 'app.vue'`; never import global styles into an `apply-shared` component's WXSS. See [Registry mode](/en/guide/shadcn-mode). Only stable `h5` and `weapp` are admitted. This is not experimental-profile or device certification.

## Ownership and states

The application supplies records and permissions and handles validation, persistence, navigation and external operations. IDs must be stable and unique. Components look up current items by ID and block missing, disabled, unauthorized or unchanged actions. Servers must still check authorization. Supply pending state as asynchronous work starts, then update controlled values after accepting the result.

Every Block accepts `loading?: boolean`, `error?: string` and `disabled?: boolean` (defaults `false`, `''`, `false`). Loading, error and disabled states retain content. Nonempty errors block actions, except Contact permits edits and resubmission after recoverable errors. Empty collections display a message; Contact retains its editable empty draft without treating blank fields as data errors. Long text wraps without truncation.

Events carry **one payload** on both targets, without adapting Vue callbacks with multiple arguments. FAQ expansion, contact values, selected plan and period are required controlled inputs; supply empty arrays or strings explicitly. Native collections use `properties: { …: { type: Array, value: [] } }` for derived calculations before host binding; `withDefaults` cannot initialize this phase. Defaults neither change controlled mode nor correct invalid external data.

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

An action ID is **not a URL**. H5 applications can map it to routing or in-page actions; native applications to registered pages, permitted host APIs or in-page panels. Shared/native handlers must not use `window.location`, `mailto:` or browser history. Check destinations and host permissions before execution and report actual errors afterward. Events do not confirm navigation or delivery.

## Articles

Required: `items: MarketingArticle[]`.

Each article has `id`, `title`, `summary`, `category`, `readingTime`, `canOpen`, optional `disabled`, and optional `image: { src, alt }`. Optional props are `title = 'From the Varo journal'`, `pendingId = ''`, `emptyText = 'No articles available.'` and common states.

`open` emits the current article. Each local page displays **three cards**, Previous/Next controls and a page count. Every supplied article is reachable, and data changes bring the page within valid bounds. Supply a limited collection or implement server paging outside the Block.

The application supplies content and decides how to open it. The demo shows complete local articles; Close article remains available while the list loads or is disabled. `canOpen: false` disables the action but retains the card. `pendingId` blocks paging and repeated opening without removing content.

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

`update:expandedIds` emits a new expanded ID array. Expansion changes when the application accepts it by replacing its own array. Multiple questions can stay open, and the next accepted toggle removes IDs that no longer exist. Answers display as plain text without executing HTML.

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

This H5 example validates input, then appends it to an in-memory receipt list without sending email. The full playground also provides a manual pending, accept, reject and cancel flow.

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

For a native page, use `wevu` instead of `vue`, native `view`/`text` for the receipt list and the installed native SFC. Bind literal Boolean props explicitly (`:can-submit="true"`). Sending email requires an application backend, privacy and consent policy, abuse protection and transport error handling. The local example only saves receipts and must not display “email sent”.

## Process / How it works

Required: `steps: MarketingProcessStep[]`. Each step has `id`, `title`, `description`, `state: 'upcoming' | 'active' | 'completed'` and optional `action: { label, allowed, disabled? }`. Optional: `title = 'How it works'`, `pendingId = ''`, common states.

`action` checks permission and emits the current step. Display order matches input order. Applications supply state; the Block does not infer it from an index, timer or click. Eligibility is separate from display state, so applications may allow revisiting completed steps. The demo advances after opening instructions: “completed” means **local instructions were opened**, not software installation or message delivery.

## Demonstrations and acceptance scenarios

- H5: `/?demo=marketing-blocks` → `apps/playground-h5/src/features/MarketingBlocksDemo.vue` and `useMarketingBlocksDemo.ts`.
- Native: `/blocks-lab/marketing/index` → `apps/playground-weapp/src/blocks-lab/marketing/`.
- E2E: `apps/e2e/tests/h5/marketing-blocks.e2e.ts` and `apps/e2e/tests/weapp-native/marketing-blocks.e2e.ts`.

Varo created the source-flow illustration and articles without Pro assets. Ready, Loading, Empty, Error, Disabled and Long content controls change supplied props. Users manually accept or reject plan and contact requests; no timer simulates a service result.

Both E2E suites use real controls and cover:

1. Hero grants, local guide opening, forbidden action and an available close exit.
2. Three-card pagination, current detail content, an unpublished card and loading rejection.
3. Period changes, mobile comparison content, pending plan choice, rejection, acceptance and no-op prevention.
4. FAQ expansion/collapse, stable IDs, disabled question and long answer; H5 includes Enter/Space.
5. Actual contact typing, invalid email, field errors, pending input lock, rejection, cancellation and an in-memory receipt with a no-email acknowledgement.
6. Eligible process actions and instruction-only completion, with unavailable/no-op actions blocked.
7. Loading/error/disabled evidence retention, empty messages and recovery.

Generate current projections, register routes, compile both targets and run the suites before judging results. Native headless/DevTools fixtures require a supported engine setup; DevTools and devices also need a valid local AppID and connected host. Check SVGs, long-text layout, text scaling and native accessibility on the actual host. H5 screenshots or compilation cannot establish device behavior.
