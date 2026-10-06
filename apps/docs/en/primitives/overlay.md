# Overlay

Overlay foundation aligning visibility, click dismiss, layering, duration, and scroll lock.

## Runtime ownership

`useOverlayRoot` from `@varo-ui/headless` owns neutral state only. DOM scroll locking belongs to H5 and is not exported by headless. This page's `OverlayRoot` and interactive example are H5-only, from `@varo-ui/h5/primitives`; native consumers use Wevu SFCs, with source/evidence only in the native tab.

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
H5 can lock `body`. Native hosts have no `body`; application pages must manage scrolling through host capabilities. A shared `lockScroll` intent is not proof of native page locking.
:::
