# Image

Manages image loading, loaded, and error states, along with fit, dimensions, and placeholders.

## Runtime ownership

`useImageRoot` comes from `@varo-ui/headless`. This page's `ImageRoot` and interactive example are H5-only, from `@varo-ui/h5/primitives`, and render an `img` element. Native consumers use the Wevu `VImage` SFC with a native `image` element. The native tab shows source and support evidence only.

## Demo

<PrimitiveExample name="image" locale="en" />

## Parts

| Part        | Role                                                  |
| ----------- | ----------------------------------------------------- |
| `ImageRoot` | Image state, dimensions, fit, and loading/error slots |

## State and events

- State: `src`, `fit`, `width`, `height`, `round`, and `lazyLoad`
- Events: `load`, `error`, and `click`.

::: info Platform notes
Both targets share image state behavior. Each runtime implements its own image element, lazy loading, and fit behavior.
:::
