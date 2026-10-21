# Select

A composable selector that manages selection and open state.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="select" locale="en" />

## Basic usage

The H5 panel provides interactive Parts and their code. The native tab shows source and support evidence, without a live mini-program preview.

## Groups, Readonly, And Disabled

Use `SelectGroup/SelectLabel` for grouping. With `readonly`, users can still open, close, and browse options, but `SelectItem` and `setValue` cannot change value. `disabled` also blocks opening. UI wrappers handle placement and animation.

## Parts

| Part            | Purpose               |
| --------------- | --------------------- |
| `SelectRoot`    | value/open state      |
| `SelectTrigger` | Opens the selector    |
| `SelectValue`   | Current value display |
| `SelectContent` | Options container     |
| `SelectGroup`   | Group                 |
| `SelectLabel`   | Group label           |
| `SelectItem`    | One option            |

## Props

### SelectRoot

| Prop           | Type                   | Default     | Description                                           |
| -------------- | ---------------------- | ----------- | ----------------------------------------------------- |
| `value`        | `unknown`              | `undefined` | Controlled value                                      |
| `defaultValue` | `unknown`              | `undefined` | Uncontrolled initial value                            |
| `open`         | `boolean \| undefined` | `undefined` | Controlled open state                                 |
| `defaultOpen`  | `boolean`              | `false`     | Uncontrolled initial open state                       |
| `options`      | `array`                | `undefined` | Options data                                          |
| `placeholder`  | `string`               | `undefined` | Placeholder text                                      |
| `disabled`     | `boolean`              | `false`     | Prevent opening and selection changes                 |
| `readonly`     | `boolean`              | `false`     | Allow browsing options without changing the selection |
| `multiple`     | `boolean`              | `false`     | Allow multiple selections                             |

### SelectItem

| Prop     | Type     | Description   |
| -------- | -------- | ------------- |
| `option` | `object` | Option object |

## Events

| Event          | Payload   | Description                           |
| -------------- | --------- | ------------------------------------- |
| `update:value` | `unknown` | Sync the selected value               |
| `valueChange`  | `unknown` | Fires when the selected value changes |
| `update:open`  | `boolean` | Sync the open state                   |
| `openChange`   | `boolean` | Fires when the open state changes     |

## Accessibility

- Trigger opens and Item selects, following the readonly and disabled rules above.
- The element with the selection role exposes `aria-readonly`; readonly is not reported as disabled.

::: info Platform notes

- H5 can preview open/select live.
- Mini-program placement and portal strategy stay in the wrapper layer.
  :::
