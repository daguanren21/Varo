# Button

Pressable entry foundation that aligns pressed, disabled, loading, and native activation semantics.

## Runtime ownership

The `usePressableRoot` machine comes from `@varo-ui/headless`; H5 and mini-program primitives own rendering.

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
