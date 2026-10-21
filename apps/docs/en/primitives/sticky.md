# Sticky

Exposes fixed state, offset, and scroll information. Wrappers handle styling.

## Runtime ownership

This page's `StickyRoot` and interactive example are H5-only, from `@varo-ui/h5/primitives`. Native consumers use the Wevu `VSticky` SFC; there are no equivalent Vue Parts. The native tab shows source and support evidence only. Each runtime connects to its own scroll source.

## Demo

<PrimitiveExample name="sticky" locale="en" />

## Parts

| Part         | Role                                                    |
| ------------ | ------------------------------------------------------- |
| `StickyRoot` | Sticky positioning, fixed slot state, and scroll events |

## State and events

- State: `offsetTop`, `zIndex`, `disabled`, and `data-fixed`
- Events: `change` and `scroll`.

::: info Platform notes
H5 observes window scroll; Weapp binds page or scroll-container state.
:::
