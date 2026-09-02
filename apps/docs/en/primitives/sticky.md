# Sticky

Sticky foundation exposing fixed state, offset, and scroll information while wrappers own visuals.

## Runtime ownership

H5 and Weapp adapters align state and event names; each runtime owns its scrolling source.

## Demo

<PrimitiveExample name="sticky" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Filter bars, section headers, and action bars often need sticky behavior.
- The fixed state can drive borders, shadows, and analytics.

## Parts

| Part         | Role                                                    |
| ------------ | ------------------------------------------------------- |
| `StickyRoot` | Sticky positioning, fixed slot state, and scroll events |

## State and events

- State：`offsetTop`, `zIndex`, `disabled`, and `data-fixed`
- Events：`change` and `scroll`.

## Platform notes

H5 observes window scroll; Weapp binds page or scroll-container state.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
