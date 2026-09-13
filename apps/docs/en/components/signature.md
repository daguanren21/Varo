# Signature

`VSignature` uses normalized stroke data as its cross-target controlled value. H5 uses pointer canvas input; mini-program uses native canvas touch events.

## Demo

<SignatureDemo locale="en" />

## Props

| Prop         | Type                | Default           | Description               |
| ------------ | ------------------- | ----------------- | ------------------------- |
| `value`      | `SignatureStroke[]` | `[]`              | Controlled signature      |
| `disabled`   | `boolean`           | `false`           | Disable drawing and clear |
| `height`     | `number`            | `200`             | Canvas height             |
| `lineColor`  | `string`            | `'#172033'`       | Stroke color              |
| `lineWidth`  | `number`            | `2`               | Stroke width              |
| `background` | `string`            | `'#ffffff'`       | Canvas background         |
| `showClear`  | `boolean`           | `true`            | Show the clear action     |
| `clearText`  | `string`            | `'清除签名'`      | Clear action label        |
| `ariaLabel`  | `string`            | `'Signature pad'` | Canvas accessible name    |

## Events

| Event          | Payload             | Description         |
| -------------- | ------------------- | ------------------- |
| `update:value` | `SignatureStroke[]` | Commit strokes      |
| `change`       | `SignatureStroke[]` | Signature changed   |
| `start`        | `void`              | Stroke started      |
| `end`          | `SignatureStroke`   | Stroke completed    |
| `clear`        | `void`              | All strokes cleared |
