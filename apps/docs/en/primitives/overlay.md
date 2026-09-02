# Overlay

Overlay foundation aligning visibility, click dismiss, layering, duration, and scroll lock.

## Runtime ownership

`useOverlayRoot` and scroll-lock state come from `@varo-ui/headless`; target adapters perform real page locking.

## Demo

<PrimitiveExample name="overlay" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Popups, drawers, and modals all need one overlay behavior.
- A standalone Overlay prevents duplicated dismiss logic.

## Parts

| Part          | Role                                          |
| ------------- | --------------------------------------------- |
| `OverlayRoot` | Visibility, click dismiss, and scroll locking |

## State and events

- State：`visible`, `defaultVisible`, `lockScroll`, and `closeOnClickOverlay`
- Events：`update:visible`, `visibleChange`, `close`, and `click`.

## Platform notes

H5 locks body; Weapp handles scrolling through page capabilities.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
