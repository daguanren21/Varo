# Button

Pressable entry foundation that aligns pressed, disabled, loading, and native activation semantics.

## Runtime ownership

The `usePressableRoot` machine comes from `@varo-ui/headless`; H5 and mini-program primitives own rendering.

## Demo

<PrimitiveExample name="button" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Buttons, icon buttons, and clickable cards need one activation gate.
- UI wrappers add visual tokens instead of rewriting interaction state.

## Parts

| Part         | Role                                              |
| ------------ | ------------------------------------------------- |
| `ButtonRoot` | Native activation, pressed, disabled, and loading |

## State and events

- State：`disabled`, `loading`, `size`, and `variant`
- Events：`click`, plus `data-pressed` / `data-loading` state.

## Platform notes

H5 uses native button and keyboard activation; Weapp adapts tap and pressed feedback.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
