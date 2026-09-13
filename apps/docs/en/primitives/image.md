# Image

Image-state foundation that aligns loading, loaded, error, fit, sizing, and placeholders.

## Runtime ownership

`useImageRoot` comes from `@varo-ui/headless`; H5 renders img while Weapp uses native image.

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
