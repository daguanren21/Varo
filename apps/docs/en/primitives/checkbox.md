# Checkbox

A checkbox composed from Root and Indicator.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="checkbox" locale="en" />

## Basic usage

The H5 panel provides interactive Parts and their code. The native tab shows source and support evidence, without a live mini-program preview.

## Disabled state

`disabled` prevents interaction and `checkedChange` events. Indicator can still show the current checked state.

## Parts

| Part                | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `CheckboxRoot`      | Manages checked state and handles toggling |
| `CheckboxIndicator` | Indicator rendered when checked            |

## Props

| Prop             | Type                   | Default     | Description                        |
| ---------------- | ---------------------- | ----------- | ---------------------------------- |
| `checked`        | `boolean \| undefined` | `undefined` | Controlled checked state           |
| `defaultChecked` | `boolean`              | `false`     | Uncontrolled initial checked state |
| `disabled`       | `boolean`              | `false`     | Disables interaction               |
| `as`             | `string`               | `'button'`  | Root element tag                   |

## Events

| Event            | Payload   | Description                          |
| ---------------- | --------- | ------------------------------------ |
| `update:checked` | `boolean` | Sync the controlled checked state    |
| `checkedChange`  | `boolean` | Fires when the checked state changes |

## Accessibility

- Root defaults to a button for toggling; Indicator is not a click target.

::: info Platform notes

- The `v-model:checked` and Parts composition shown here apply to H5. Native consumers use Registry Wevu SFCs, with focus managed by the page container.
  :::
