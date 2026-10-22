# Input

Handles controlled text values, formatting, readonly and invalid states, length, and automatic textarea sizing.

## Runtime ownership

`useFieldRoot` comes from `@varo-ui/headless`. This page's `InputRoot` and interactive example are H5-only, from `@varo-ui/h5/primitives`. Native consumers use the Wevu `VInput` SFC; the native tab shows source and support evidence only. Each runtime handles IME, DOM/WXML, and automatic sizing.

`disabled` / `readonly` prevents value changes. Each accepted change emits `update:value` and `valueChange` once; setting the same value or clearing without changing it emits neither.

## Demo

<PrimitiveExample name="input" locale="en" />

## Parts

| Part        | Role                                              |
| ----------- | ------------------------------------------------- |
| `InputRoot` | Value, state, formatting, and native input events |

## State and events

- State: `value`, `defaultValue`, `disabled`, `readonly`, and `invalid`
- Events: `update:value`, `valueChange`, `focus`, and `blur`.

::: info Platform notes
H5 supports textarea autosize; Weapp preserves the public contract on native inputs.
:::
