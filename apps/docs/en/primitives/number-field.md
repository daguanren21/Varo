# Number Field

Root manages numeric bounds, step, and precision. Compose the input with increment and decrement buttons.

## Runtime ownership

`useNumberFieldRoot` comes from `@varo-ui/headless` with numeric constraints shared across targets. This page's Parts and interactive example are H5-only, from `@varo-ui/h5/primitives`. Native consumers use the Wevu `VInputNumber` SFC; there are no equivalent Vue Parts. The native tab shows source and support evidence only.

## Demo

<PrimitiveExample name="number-field" locale="en" />

## Parts

| Part                   | Role                          |
| ---------------------- | ----------------------------- |
| `NumberFieldRoot`      | Numeric state and constraints |
| `NumberFieldDecrement` | Decreases the value           |
| `NumberFieldInput`     | Native numeric input          |
| `NumberFieldIncrement` | Increases the value           |

## State and events

- State: `value`, `min`, `max`, `step`, `precision`, and `readonly`
- Events: `update:value` and `valueChange`.

::: info Platform notes
Both targets use the same bounds and precision rules. Each runtime adapts its native input events.
:::
