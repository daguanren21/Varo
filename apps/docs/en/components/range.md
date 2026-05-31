# Range

## Basic Usage

<FormComponentDemo example="range" locale="en" />

## Step

Use `step` to control the drag increment.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | `0` | Current value |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step value |
| `disabled` | `boolean` | `false` | Disable range |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `number` | Value changed |
| `change` | `number` | Value changed |
