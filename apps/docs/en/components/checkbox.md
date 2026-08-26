# Checkbox

## Demo

<FormComponentDemo example="checkbox" locale="en" />

## Checkbox Group

Use `VCheckboxGroup` to manage selected values, max count, and layout direction.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `undefined` | Checked state for standalone usage |
| `value` | `string \| number \| boolean` | `true` | Checkbox value |
| `label` | `string` | `undefined` | Label text |
| `disabled` | `boolean` | `false` | Disable checkbox |

## CheckboxGroup Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `Array<string \| number \| boolean>` | `[]` | Selected values |
| `max` | `number` | `undefined` | Maximum selected count |
| `direction` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout direction |
| `disabled` | `boolean` | `false` | Disable the group |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:checked` | `boolean` | Checked state changed |
| `update:value` | `Array<string \| number \| boolean>` | Group value changed |
| `change` | `boolean \| Array<string \| number \| boolean>` | Value changed |
