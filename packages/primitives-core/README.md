# @varo-ui/headless

Platform-neutral state machines, events, controlled-state contracts, form hooks, and runtime-free utilities shared across H5, app, and mini-program targets.

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

This package does not render DOM, native, or mini-program elements. Target render adapters are available through `@varo-ui/h5/primitives` and `@varo-ui/weapp/primitives`.

[Primitives documentation](https://daguanren21.github.io/Varo/primitives/) · [Repository](https://github.com/daguanren21/Varo)
