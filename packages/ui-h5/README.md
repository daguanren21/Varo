# @varo-ui/h5

Tree-shakeable Vue components for mobile H5 products, backed by Varo Headless contracts and theme tokens.

## Install

```bash
pnpm add vue @varo-ui/h5
```

## Usage

```ts
import { VButton } from '@varo-ui/h5'
import '@varo-ui/h5/style.css'
```

Target render primitives are available from `@varo-ui/h5/primitives`. Components are emitted as preserved ESM modules so bundlers can remove unused components.

## Public entrypoints and source migration

| Import                         | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `@varo-ui/h5`                  | Published styled Vue components and their public types |
| `@varo-ui/h5/primitives`       | H5 DOM render primitives and DOM behavior              |
| `@varo-ui/h5/style.css`        | Built package stylesheet                               |
| `@varo-ui/h5/source/style.css` | CSS-only source stylesheet                             |

The TypeScript `@varo-ui/h5/source` export is removed: it exposed private workspace dependencies rather than a self-contained consumer entrypoint. Replace those imports with the root or `/primitives` entry above. The CSS-only `/source/style.css` path remains supported; it is not a TypeScript source API.

For editable renderers, install source instead:

```bash
pnpm dlx @varo-ui/cli add --target h5 button input card
```

The CLI reports required npm dependencies; install them explicitly. Installed H5 source imports its complete dependency CSS closure. `themes/base` provides tokens/foundation only, ordinary component styles have manifest owners, and Agent styles are optional `themes/agent` dependencies. Do not replace the installed closure with just the base stylesheet.

## Behavior and ownership

- `@varo-ui/headless` owns neutral state and form contracts. H5 owns DOM rendering, focus, keyboard handling, and body-scroll locking. Migrate `useBodyScrollLock` imports from headless to `@varo-ui/h5/primitives`.
- Form submit/failed handlers receive `SubmitPayload` from `@varo-ui/headless`, also exported as `FormSubmitPayload` by the H5 form API. The payload contains `values`, `errors`, and optional `event`; it is not the raw submit event. The shared event type is `unknown`; only H5 adapters may make DOM-specific claims.
- Disabled/readonly inputs reject mutation. Accepted changes notify once; no-op changes do not notify. Drawer `openChange` is synchronously cancelable before state mutation, model updates, or close notifications.
- Repository renderer sources live in `registry/components/**`, and canonical styles in `registry/themes/**`. `pnpm sync:registry` projects these into this package; edit the Registry owner, not generated files in `packages/ui-h5/src`.

Repository checks are `pnpm check:generated` and `pnpm check:architecture`; after synchronization and package builds, `pnpm check:consumers` exercises packed and source-installed H5 consumers. These commands are verification entrypoints, not a claim that a particular revision has passed independent verification.

[Component documentation](https://varo.weapp.dev/components/) · [Repository](https://github.com/daguanren21/Varo)
