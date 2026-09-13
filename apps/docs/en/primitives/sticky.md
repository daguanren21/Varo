# Sticky

Sticky foundation exposing fixed state, offset, and scroll information while wrappers own visuals.

## Runtime ownership

H5 and Weapp adapters align state and event names; each runtime owns its scrolling source.

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
