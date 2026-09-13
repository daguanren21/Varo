# Input

Text-input foundation for controlled values, formatting, readonly, invalid state, length, and textarea autosize.

## Runtime ownership

`useFieldRoot` comes from `@varo-ui/headless`; IME, DOM/WXML, and autosize stay target-owned.

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
