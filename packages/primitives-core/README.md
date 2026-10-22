# @varo-ui/headless

State machines, events, controlled-state interfaces, form hooks, and utilities shared by Varo renderers. The package has no Vue, Wevu, or DOM dependency and does not render DOM, native, or mini-program elements.

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

This example connects an H5 application's reactivity. In native applications, import `computed` and `shallowRef` from `wevu` instead. Framework imports stay in the adapter or application. The shared `ReactiveRuntime`, `Ref`, and `MaybeRef` types are defined in `packages/shared` and re-exported by headless, so consumers can use them without importing private workspace packages.

## Renderer migration

- H5 render primitives and DOM behavior belong to `@varo-ui/h5/primitives`. The former headless `useBodyScrollLock` export has moved there; migrate its H5 callers rather than importing DOM functionality into neutral code.
- Native consumers use Wevu `.vue` SFCs from `@varo-ui/weapp` or editable `@varo-ui/cli add --target weapp` installations. The former Vue-Weapp renderer and `@varo-ui/weapp/primitives` export are removed. There is no native DOM-lock substitute or compatibility renderer.
- Native Registry `src/lib/varo-primitives.ts` only binds the reactive runtime; custom native components import neutral behavior directly from `@varo-ui/headless`.

## Named form and event contracts

```ts
import type { SubmitPayload } from '@varo-ui/headless'

type CheckoutSubmission = SubmitPayload<{ email: string }>
```

`SubmitPayload` contains `values`, `errors`, and optional `event: unknown`. Form APIs export the same named type as `FormSubmitPayload`; it is not inferred from a specific function's return type. The payload is not a raw DOM event. Narrow its event type only when you know the platform's event shape.

Render adapters must reject edits while disabled or readonly and send no notification for unchanged values. To cancel Drawer `openChange`, do so synchronously before state/model/close transitions. Native and H5 adapters may provide different event objects with the same shared state interface.

Run `pnpm check:architecture` to check import boundaries and `pnpm check:generated` to check generated renderers. Behavior and consumer integration need separate checks.

[Primitives documentation](https://varo.weapp.dev/primitives/) · [Repository](https://github.com/daguanren21/Varo)
