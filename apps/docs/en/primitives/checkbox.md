# Checkbox

Composable checkbox runtime: Root owns checked state; Indicator only renders when checked.

## Runtime

Available on `@varo/primitives-h5` and `@varo/primitives-weapp`.

## Demo

<PrimitiveExample name="checkbox" locale="en" />

## Installation

```bash
pnpm add @varo/primitives-h5
# or
pnpm add @varo/primitives-weapp
```

## Basic usage

Use the Demo panel above to switch H5 live preview and mini-program runtime contract/code.

## Disabled state

When `disabled` is set, `checkedChange` no longer fires. Indicator may still reflect the current checked value, but interaction is closed.

## Parts

| Part | Purpose |
| --- | --- |
| `CheckboxRoot` | State and toggle interaction |
| `CheckboxIndicator` | Indicator rendered when checked |

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean \| undefined` | `undefined` | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial checked state |
| `disabled` | `boolean` | `false` | Disables interaction |
| `as` | `string` | `'button'` | Root element tag |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:checked` | `boolean` | Sync controlled checked state |
| `checkedChange` | `boolean` | Fires when checked changes |

## Accessibility

- Root defaults to button semantics for toggling.
- Indicator is not the click target.
- Disabled state must not emit checked changes.

## Platform notes

- H5 can be previewed live in docs.
- Mini-program keeps the same `v-model:checked` and part composition; focus details stay page-owned.

## Related docs

- [Primitives overview](/en/primitives/)
- [Components](/en/components/button)
- [Blocks](/en/blocks/profile-edit)
