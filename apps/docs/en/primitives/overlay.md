# Overlay

Overlay foundation aligning visibility, click dismiss, layering, duration, and scroll lock.

## Runtime ownership

`useOverlayRoot` and scroll-lock state come from `@varo-ui/headless`; target adapters perform real page locking.

## Demo

<PrimitiveExample name="overlay" locale="en" />

## Parts

| Part          | Role                                          |
| ------------- | --------------------------------------------- |
| `OverlayRoot` | Visibility, click dismiss, and scroll locking |

## State and events

- State：`visible`, `defaultVisible`, `lockScroll`, and `closeOnClickOverlay`
- Events：`update:visible`, `visibleChange`, `close`, and `click`.

::: info Platform notes
H5 locks body; Weapp handles scrolling through page capabilities.
:::
