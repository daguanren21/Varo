# Rate

## Demo

<FormComponentDemo example="rate" locale="en" />

## Readonly

Set `readonly` to display a score without click interaction.

## Props

| Prop         | Type      | Default | Description                                             |
| ------------ | --------- | ------- | ------------------------------------------------------- |
| `value`      | `number`  | `0`     | Current value                                           |
| `count`      | `number`  | `5`     | Icon count                                              |
| `allowClear` | `boolean` | `true`  | Clear the score when its current value is clicked again |
| `disabled`   | `boolean` | `false` | Disable rate                                            |
| `readonly`   | `boolean` | `false` | Readonly state                                          |

## Events

| Event          | Payload  | Description   |
| -------------- | -------- | ------------- |
| `update:value` | `number` | Value changed |
| `change`       | `number` | Value changed |
