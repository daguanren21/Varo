# @varo-ui/h5

Vue components for mobile H5 applications, with Varo Headless behavior and theme tokens.

## Install

```bash
pnpm add vue @varo-ui/h5
```

## Usage

```ts
import { VButton } from '@varo-ui/h5'
import '@varo-ui/h5/style.css'
```

Import H5 render primitives from `@varo-ui/h5/primitives`. The package preserves individual ESM modules so bundlers can remove components you do not use.

## Public entrypoints and source migration

| Import                         | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| `@varo-ui/h5`                  | Published styled Vue components and their public types |
| `@varo-ui/h5/primitives`       | H5 DOM render primitives and DOM behavior              |
| `@varo-ui/h5/style.css`        | Built package stylesheet                               |
| `@varo-ui/h5/source/style.css` | CSS-only source stylesheet                             |

The TypeScript `@varo-ui/h5/source` export was removed because it exposed private workspace dependencies. Replace those imports with the package root or `/primitives`. The CSS-only `/source/style.css` export remains available; it does not export TypeScript source.

For editable renderers, install source instead:

```bash
pnpm dlx @varo-ui/cli add --target h5 button input card
```

Install the npm dependencies reported by the CLI. H5 source imports the CSS for each component and its dependencies. `themes/base` supplies tokens and foundation styles, each component manifest declares its own styles, and Agent styles come from the optional `themes/agent` dependency. Keep all installed styles; the base stylesheet alone does not cover the components.

## Behavior and ownership

- `@varo-ui/headless` defines shared state and form interfaces. H5 handles DOM rendering, focus, keyboard input, and body-scroll locking. Move existing `useBodyScrollLock` imports from headless to `@varo-ui/h5/primitives`.
- Form submit/failed handlers receive `SubmitPayload` from `@varo-ui/headless`, also exported as `FormSubmitPayload` by the H5 form API. It contains `values`, `errors`, and optional `event`, rather than the raw submit event. The shared event type is `unknown`; narrow it to a DOM event only in an H5 adapter.
- Inputs reject edits while disabled or readonly. Accepted changes notify once; unchanged values do not notify. Cancel Drawer `openChange` synchronously to prevent the state change, model update, and close notification.
- Edit component source in `registry/components/**` and styles in `registry/themes/**`. Run `pnpm sync:registry` to update the generated files in `packages/ui-h5/src`.

Run `pnpm check:generated` and `pnpm check:architecture` to check generated files and import boundaries. After synchronization and package builds, run `pnpm check:consumers` for packed and source-installed H5 consumers.

[Component documentation](https://varo.weapp.dev/components/) · [Repository](https://github.com/daguanren21/Varo)
