# Radio Group

Single-select runtime: Group owns value, Item represents options, Indicator renders the selected mark.

## Runtime

State contracts come from `@varo-ui/headless`; rendered parts come from `@varo-ui/h5/primitives` or `@varo-ui/weapp/primitives`.

## Demo

<PrimitiveExample name="radio-group" locale="en" />

## Basic usage

Use the Demo panel above to switch H5 and Weapp primitive preview/code; each runtime renders only the current entry.

## Disabled item

Set `disabled` on `RadioItem` to keep the group value contract while blocking one option.

## Parts

| Part             | Purpose                 |
| ---------------- | ----------------------- |
| `RadioGroup`     | Group value and context |
| `RadioItem`      | One option              |
| `RadioIndicator` | Selected indicator      |

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

| Event          | Payload            | Description              |
| -------------- | ------------------ | ------------------------ |
| `update:value` | `string \| number` | Sync controlled value    |
| `valueChange`  | `string \| number` | Fires when value changes |

## Accessibility

- Group value determines the selected item.
- Disabled items cannot be selected.
- Indicator reflects state only.

::: info Platform notes

- H5 and mini-program share the value/disabled contract.
- Mini-program keyboard focus stays page-owned.
  :::
