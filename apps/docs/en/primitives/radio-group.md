# Radio Group

A radio group composed from Group, Item, and Indicator.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="radio-group" locale="en" />

## Basic usage

The H5 panel provides interactive Parts and their code. The native tab shows source and support evidence, without a live mini-program preview.

## Disabled item

Set `disabled` on `RadioItem` to disable that option without changing how the group value works.

## Parts

| Part             | Purpose                                         |
| ---------------- | ----------------------------------------------- |
| `RadioGroup`     | Manages the selected value and provides context |
| `RadioItem`      | One option                                      |
| `RadioIndicator` | Selected indicator                              |

## Props

### RadioGroup

| Prop           | Type                            | Default     | Description                |
| -------------- | ------------------------------- | ----------- | -------------------------- |
| `value`        | `string \| number \| undefined` | `undefined` | Controlled selected value  |
| `defaultValue` | `string \| number`              | `undefined` | Uncontrolled initial value |
| `disabled`     | `boolean`                       | `false`     | Disables the whole group   |
| `as`           | `string`                        | `'div'`     | Root element tag           |

### RadioItem

| Prop       | Type               | Default    | Description         |
| ---------- | ------------------ | ---------- | ------------------- |
| `value`    | `string \| number` | required   | Option value        |
| `disabled` | `boolean`          | `false`    | Disables one option |
| `as`       | `string`           | `'button'` | Option element tag  |

## Events

| Event          | Payload            | Description                           |
| -------------- | ------------------ | ------------------------------------- |
| `update:value` | `string \| number` | Sync the controlled selected value    |
| `valueChange`  | `string \| number` | Fires when the selected value changes |

## Accessibility

- The group value determines the selected item; Indicator only displays that state.
- Disabled items cannot be selected.

::: info Platform notes

- H5 and mini-program share the value/disabled contract.
- The page manages keyboard focus in mini-programs.
  :::
