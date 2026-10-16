# Button

Pressable entry foundation that aligns pressed, disabled, loading, and native activation semantics.

## Runtime ownership

The `usePressableRoot` machine comes from `@varo-ui/headless`. This page's `ButtonRoot` and H5 example belong to `@varo-ui/h5/primitives`. Native consumers use the Wevu `VButton` SFC, not equivalent Vue Parts; the Mini-program tab runs its compiled artifact in the browser. Select Code to inspect the native source. This preview does not establish WeChat device validation.

## Demo

<PrimitiveExample name="button" locale="en" />

## Parts

| Part         | Role                                              |
| ------------ | ------------------------------------------------- |
| `ButtonRoot` | Native activation, pressed, disabled, and loading |

## State and events

- State：`disabled`, `loading`, `size`, and `variant`
- Events：`click`, plus `data-pressed` / `data-loading` state.

::: info Platform notes
H5 uses native button and keyboard activation; Weapp adapts tap and pressed feedback.
:::
