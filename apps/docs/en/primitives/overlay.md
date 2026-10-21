# Overlay

Manages overlay visibility, click-to-close behavior, layering, duration, and scroll locking.

## Runtime ownership

`useOverlayRoot` from `@varo-ui/headless` manages platform-neutral state. This page's `OverlayRoot` and interactive example come from `@varo-ui/h5/primitives`, where the H5 adapter handles DOM scroll locking. Headless does not export that logic. Native consumers use Wevu SFCs; the native tab shows source and support evidence only.

## Demo

<PrimitiveExample name="overlay" locale="en" />

## Parts

| Part          | Role                                             |
| ------------- | ------------------------------------------------ |
| `OverlayRoot` | Visibility, closing on click, and scroll locking |

## State and events

- State: `visible`, `defaultVisible`, `lockScroll`, and `closeOnClickOverlay`
- Events: `update:visible`, `visibleChange`, `close`, and `click`.

::: info Platform notes
H5 can lock `body`. Native hosts have no `body`, so application pages must manage scrolling through host capabilities. The shared `lockScroll` setting expresses intent; it does not guarantee that native page scrolling is locked.
:::
