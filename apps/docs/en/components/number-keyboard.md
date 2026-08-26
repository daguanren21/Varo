# NumberKeyboard

## Demo

<FormComponentDemo example="number-keyboard" locale="en" />

## Extra Key

Use `extraKey` for business keys such as a decimal point.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `visible` | `boolean` | `false` | Whether the keyboard is visible |
| `extraKey` | `string` | `''` | Extra key |
| `deleteText` | `string` | `'Delete'` | Delete key text |
| `closeText` | `string` | `'Done'` | Close key text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `input` | `string` | Click number or extra key |
| `delete` | `void` | Click delete |
| `close` | `void` | Click close |
