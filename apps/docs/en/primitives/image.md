# Image

Image-state foundation that aligns loading, loaded, error, fit, sizing, and placeholders.

## Runtime ownership

`useImageRoot` comes from `@varo-ui/headless`; H5 renders img while Weapp uses native image.

## Demo

<PrimitiveExample name="image" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Avatars, product media, and generated images need stable load and failure states.
- Wrappers or slots own placeholder and error visuals.

## Parts

| Part        | Role                                                  |
| ----------- | ----------------------------------------------------- |
| `ImageRoot` | Image state, dimensions, fit, and loading/error slots |

## State and events

- State：`src`, `fit`, `width`, `height`, `round`, and `lazyLoad`
- Events：`load`, `error`, and `click`.

## Platform notes

State aligns across targets; image elements, lazy loading, and fit stay runtime-owned.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
