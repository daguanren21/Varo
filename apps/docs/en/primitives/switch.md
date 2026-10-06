# Switch

Switch runtime: Root owns checked plus loading/disabled; Thumb only consumes context.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="switch" locale="en" />

## Basic usage

The H5 panel provides the current Parts example and code. The native tab shows source/support evidence only, not a live mini-program preview.

## Loading

Both `loading` and `disabled` close interaction; loading fits short async locks.

## Parts

| Part          | Purpose          |
| ------------- | ---------------- |
| `SwitchRoot`  | State and toggle |
| `SwitchThumb` | Thumb part       |

## Props

| Prop             | Type                   | Default     | Description                |
| ---------------- | ---------------------- | ----------- | -------------------------- |
| `checked`        | `boolean \| undefined` | `undefined` | Controlled checked state   |
| `defaultChecked` | `boolean`              | `false`     | Uncontrolled initial state |
| `disabled`       | `boolean`              | `false`     | Disabled                   |
| `loading`        | `boolean`              | `false`     | Loading; not toggleable    |
| `as`             | `string`               | `'button'`  | Root element tag           |

## Events

| Event            | Payload   | Description     |
| ---------------- | --------- | --------------- |
| `update:checked` | `boolean` | Controlled sync |
| `checkedChange`  | `boolean` | State change    |

## Accessibility

- Root defaults to button semantics.
- Loading/disabled states are not toggleable.

::: info Platform notes

- Both runtimes share checked/loading contracts.
- Track visuals and motion belong to UI wrappers.
  :::
