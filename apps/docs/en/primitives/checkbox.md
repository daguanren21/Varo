# Checkbox

Composable checkbox runtime: Root owns checked state; Indicator only renders when checked.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="checkbox" locale="en" />

## Basic usage

The H5 panel provides the current Parts example and code. The native tab shows source/support evidence only, not a live mini-program preview.

## Disabled state

When `disabled` is set, `checkedChange` no longer fires. Indicator may still reflect the current checked value, but interaction is closed.

## Parts

| Part                | Purpose                         |
| ------------------- | ------------------------------- |
| `CheckboxRoot`      | State and toggle interaction    |
| `CheckboxIndicator` | Indicator rendered when checked |

## Props

| Prop             | Type                   | Default     | Description                        |
| ---------------- | ---------------------- | ----------- | ---------------------------------- |
| `checked`        | `boolean \| undefined` | `undefined` | Controlled checked state           |
| `defaultChecked` | `boolean`              | `false`     | Uncontrolled initial checked state |
| `disabled`       | `boolean`              | `false`     | Disables interaction               |
| `as`             | `string`               | `'button'`  | Root element tag                   |

## Events

| Event            | Payload   | Description                   |
| ---------------- | --------- | ----------------------------- |
| `update:checked` | `boolean` | Sync controlled checked state |
| `checkedChange`  | `boolean` | Fires when checked changes    |

## Accessibility

- Root defaults to button semantics for toggling.
- Indicator is not the click target.
- Disabled state must not emit checked changes.

::: info Platform notes

- H5 can be previewed live in docs.
- Mini-program keeps the same `v-model:checked` and part composition; focus details stay page-owned.
  :::
