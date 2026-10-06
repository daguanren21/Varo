# @varo-ui/headless

Framework- and DOM-neutral state machines, events, controlled-state contracts, form hooks, and utilities shared by Varo renderers. This package does not render DOM, native, or mini-program elements and does not import Vue or Wevu.

## Install

```bash
pnpm add @varo-ui/headless
```

## Usage

```ts
import { useAccordionRoot } from '@varo-ui/headless'

const accordion = useAccordionRoot({ type: 'single', collapsible: true })
accordion.api.toggle('details')
```

Without an injected runtime, this example uses plain value refs and lazy computed getters. To participate in an application's reactivity, pass a `ReactiveRuntime`:

```ts
import type { ReactiveRuntime } from '@varo-ui/headless'
import { useAccordionRoot } from '@varo-ui/headless'
import { computed, shallowRef } from 'vue'

const runtime: ReactiveRuntime = { computed, ref: shallowRef }
const accordion = useAccordionRoot({ type: 'single', collapsible: true, runtime })
accordion.api.toggle('details')
```

That is an H5 application binding; native application code binds the same contract with `computed` and `shallowRef` from `wevu`. The framework import belongs in the adapter/consumer, not in headless. In this repository, `packages/shared` is the single owner of `ReactiveRuntime`, `Ref`, and `MaybeRef`; headless re-exports the public contract so consumers do not import private workspace packages.

## Renderer migration

- H5 render primitives and DOM behavior belong to `@varo-ui/h5/primitives`. The former headless `useBodyScrollLock` export has moved there; migrate its H5 callers rather than importing DOM functionality into neutral code.
- Native consumers use Wevu `.vue` SFCs from `@varo-ui/weapp` or editable `@varo-ui/cli add --target weapp` installations. The former Vue-Weapp renderer and `@varo-ui/weapp/primitives` export are removed. There is no native DOM-lock substitute or compatibility renderer.
- Native Registry `src/lib/varo-primitives.ts` only binds the reactive runtime; custom native components import neutral behavior directly from `@varo-ui/headless`.

## Named form and event contracts

```ts
import type { SubmitPayload } from '@varo-ui/headless'

type CheckoutSubmission = SubmitPayload<{ email: string }>
```

`SubmitPayload` contains `values`, `errors`, and optional `event: unknown`. Form source APIs name the same contract `FormSubmitPayload`; it is not inferred from a concrete function's return type or treated as a raw DOM event. Narrow the event in a platform-specific consumer only when that platform's payload is known.

Render adapters must reject disabled/readonly mutations and suppress no-op change notifications. Drawer `openChange` cancellation is synchronous and precedes state/model/close transitions. Native and H5 adapters may expose different platform event objects without changing the neutral state contract.

Repository ownership is checked with `pnpm check:architecture`; generated renderers are checked separately by `pnpm check:generated`. Neither substitutes for behavioral or consumer verification.

[Primitives documentation](https://varo.weapp.dev/primitives/) · [Repository](https://github.com/daguanren21/Varo)
