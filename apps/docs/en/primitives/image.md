# Image

Image-state foundation that aligns loading, loaded, error, fit, sizing, and placeholders.

## Runtime ownership

`useImageRoot` comes from `@varo-ui/headless`. This page's `ImageRoot` and interactive example are H5-only, from `@varo-ui/h5/primitives`, using `img`. Native consumers use the Wevu `VImage` SFC and native `image`; the native tab shows source/evidence only.

## Demo

<PrimitiveExample name="image" locale="en" />

## Parts

| Part        | Role                                                  |
| ----------- | ----------------------------------------------------- |
| `ImageRoot` | Image state, dimensions, fit, and loading/error slots |

## State and events

- State：`src`, `fit`, `width`, `height`, `round`, and `lazyLoad`
- Events：`load`, `error`, and `click`.

::: info Platform notes
State aligns across targets; image elements, lazy loading, and fit stay runtime-owned.
:::
