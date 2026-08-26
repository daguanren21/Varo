# Radio

## Demo

<FormComponentDemo example="radio" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean` | `undefined` | Checked state for standalone usage |
| `value` | `string \| number \| boolean` | Required | Radio value |
| `label` | `string` | `undefined` | Label text |
| `disabled` | `boolean` | `false` | Disable radio |

## RadioGroup Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| boolean` | `undefined` | Selected value |
| `direction` | `'horizontal' \| 'vertical'` | `'vertical'` | Layout direction |
| `disabled` | `boolean` | `false` | Disable the group |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:checked` | `boolean` | Checked state changed |
| `update:value` | `string \| number \| boolean` | Group value changed |
| `change` | `string \| number \| boolean` | Value changed |
