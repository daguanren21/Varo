# Button

Pressable entry foundation that aligns pressed, disabled, loading, and native activation semantics.

## Runtime ownership

The `usePressableRoot` machine comes from `@varo-ui/headless`. This page's `ButtonRoot` and interactive example are H5-only, from `@varo-ui/h5/primitives`. Native consumers use the Wevu `VButton` SFC, not equivalent Vue Parts; the native tab shows source/evidence only.

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
