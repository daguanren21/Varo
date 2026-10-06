# Input

Text-input foundation for controlled values, formatting, readonly, invalid state, length, and textarea autosize.

## Runtime ownership

`useFieldRoot` comes from `@varo-ui/headless`. This page's `InputRoot` and interactive example are H5-only, from `@varo-ui/h5/primitives`. Native consumers use the Wevu `VInput` SFC; the native tab shows source/evidence only. IME, DOM/WXML, and autosize remain target-owned.

`disabled` / `readonly` reject value mutation. Each accepted actual change emits `update:value` and `valueChange` once; unchanged values and no-op clears do not emit change events.

## Demo

<PrimitiveExample name="input" locale="en" />

## Parts

| Part        | Role                                              |
| ----------- | ------------------------------------------------- |
| `InputRoot` | Value, state, formatting, and native input events |

## State and events

- State：`value`, `defaultValue`, `disabled`, `readonly`, and `invalid`
- Events：`update:value`, `valueChange`, `focus`, and `blur`.

::: info Platform notes
H5 supports textarea autosize; Weapp preserves the public contract on native inputs.
:::
