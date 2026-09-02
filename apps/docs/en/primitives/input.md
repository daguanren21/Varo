# Input

Text-input foundation for controlled values, formatting, readonly, invalid state, length, and textarea autosize.

## Runtime ownership

`useFieldRoot` comes from `@varo-ui/headless`; IME, DOM/WXML, and autosize stay target-owned.

## Demo

<PrimitiveExample name="input" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Every form field needs one value and invalid contract.
- Business wrappers can reuse formatter timing without replacing the primitive.

## Parts

| Part        | Role                                              |
| ----------- | ------------------------------------------------- |
| `InputRoot` | Value, state, formatting, and native input events |

## State and events

- State：`value`, `defaultValue`, `disabled`, `readonly`, and `invalid`
- Events：`update:value`, `valueChange`, `focus`, and `blur`.

## Platform notes

H5 supports textarea autosize; Weapp preserves the public contract on native inputs.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
