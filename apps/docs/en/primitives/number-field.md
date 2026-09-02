# Number Field

Numeric-input foundation where Root owns bounds, step, and precision while controls stay composable.

## Runtime ownership

`useNumberFieldRoot` comes from `@varo-ui/headless`; H5 and Weapp share numeric constraints.

## Demo

<PrimitiveExample name="number-field" locale="en" />

## Install

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Why this is foundational

- Quantity, currency, and rating controls need reliable min/max/step behavior.
- Separate parts allow product-specific layouts and icons.

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

## Platform notes

Bounds and precision align across targets; native input events stay runtime-owned.

## Related docs

- [Primitives overview](/en/primitives/)
- [Component docs](/en/components/button)
