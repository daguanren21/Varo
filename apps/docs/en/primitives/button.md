# Button

Manages pressed, disabled, and loading states and handles native button activation.

## Runtime ownership

The `usePressableRoot` state machine comes from `@varo-ui/headless`. This page's `ButtonRoot` and H5 example come from `@varo-ui/h5/primitives`. Native consumers use the Wevu `VButton` SFC; there are no equivalent Vue Parts. The Mini-program tab runs its compiled output in the browser. Select Code to inspect the native source. This preview does not replace validation on a WeChat device.

## Demo

<PrimitiveExample name="button" locale="en" />

## Parts

| Part         | Role                                              |
| ------------ | ------------------------------------------------- |
| `ButtonRoot` | Native activation, pressed, disabled, and loading |

## State and events

- State: `disabled`, `loading`, `size`, and `variant`
- Event: `click`. The component also exposes `data-pressed` / `data-loading`.

::: info Platform notes
H5 uses native button and keyboard activation; Weapp adapts tap and pressed feedback.
:::
