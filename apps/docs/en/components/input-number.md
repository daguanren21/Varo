# InputNumber

## Basic Usage

<FormComponentDemo example="input-number" locale="en" />

## Decimal

Use `step` for increments and `precision` for decimal formatting.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | `0` | Current value |
| `min` | `number` | `-Infinity` | Minimum value |
| `max` | `number` | `Infinity` | Maximum value |
| `step` | `number` | `1` | Step value |
| `precision` | `number` | `undefined` | Decimal precision |
| `disabled` | `boolean` | `false` | Disable component |
| `readonly` | `boolean` | `false` | Readonly state |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `number` | Value changed |
| `change` | `number` | Value changed |
| `focus` | `FocusEvent` | Input focused |
| `blur` | `FocusEvent` | Input blurred |
