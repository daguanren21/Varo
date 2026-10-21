# Switch

Root manages checked, loading, and disabled states. Thumb reads state from context.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="switch" locale="en" />

## Basic usage

The H5 panel provides interactive Parts and their code. The native tab shows source and support evidence, without a live mini-program preview.

## Loading

Both `loading` and `disabled` prevent interaction. Use loading to pause toggling during an asynchronous submission.

## Parts

| Part          | Purpose                            |
| ------------- | ---------------------------------- |
| `SwitchRoot`  | Manages state and handles toggling |
| `SwitchThumb` | Displays the thumb                 |

## Props

| Prop             | Type                   | Default     | Description                        |
| ---------------- | ---------------------- | ----------- | ---------------------------------- |
| `checked`        | `boolean \| undefined` | `undefined` | Controlled checked state           |
| `defaultChecked` | `boolean`              | `false`     | Uncontrolled initial checked state |
| `disabled`       | `boolean`              | `false`     | Prevent toggling                   |
| `loading`        | `boolean`              | `false`     | Loading; prevents toggling         |
| `as`             | `string`               | `'button'`  | Root element tag                   |

## Events

| Event            | Payload   | Description                          |
| ---------------- | --------- | ------------------------------------ |
| `update:checked` | `boolean` | Sync the controlled checked state    |
| `checkedChange`  | `boolean` | Fires when the checked state changes |

## Accessibility

- Root defaults to a button and cannot toggle while loading or disabled.

::: info Platform notes

- Both runtimes share checked/loading contracts.
- Track visuals and motion belong to UI wrappers.
  :::
