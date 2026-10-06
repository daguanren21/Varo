# Sticky

Sticky foundation exposing fixed state, offset, and scroll information while wrappers own visuals.

## Runtime ownership

This page's `StickyRoot` and interactive example are H5-only, from `@varo-ui/h5/primitives`. Native consumers use the Wevu `VSticky` SFC, not equivalent Vue Parts; the native tab shows source/evidence only. Each runtime owns its real scrolling source.

## Demo

<PrimitiveExample name="sticky" locale="en" />

## Parts

| Part         | Role                                                    |
| ------------ | ------------------------------------------------------- |
| `StickyRoot` | Sticky positioning, fixed slot state, and scroll events |

## State and events

- State：`offsetTop`, `zIndex`, `disabled`, and `data-fixed`
- Events：`change` and `scroll`.

::: info Platform notes
H5 observes window scroll; Weapp binds page or scroll-container state.
:::
