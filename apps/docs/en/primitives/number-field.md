# Number Field

Numeric-input foundation where Root owns bounds, step, and precision while controls stay composable.

## Runtime ownership

`useNumberFieldRoot` comes from `@varo-ui/headless` with reusable numeric constraints. This page's Parts and interactive example are H5-only, from `@varo-ui/h5/primitives`. Native consumers use the Wevu `VInputNumber` SFC, not equivalent Vue Parts; the native tab shows source/evidence only.

## Demo

<PrimitiveExample name="number-field" locale="en" />

## Parts

| Part                   | Role                          |
| ---------------------- | ----------------------------- |
| `NumberFieldRoot`      | Numeric state and constraints |
| `NumberFieldDecrement` | Decrease action               |
| `NumberFieldInput`     | Native numeric input          |
| `NumberFieldIncrement` | Increase action               |

## State and events

- State：`value`, `min`, `max`, `step`, `precision`, and `readonly`
- Events：`update:value` and `valueChange`.

::: info Platform notes
Bounds and precision align across targets; native input events stay runtime-owned.
:::
