# Select

Composable select runtime: Root owns value/open; Trigger/Value/Content/Item split rendering duties.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="select" locale="en" />

## Basic usage

The H5 panel provides the current Parts example and code. The native tab shows source/support evidence only, not a live mini-program preview.

## Groups, Readonly, And Disabled

Use `SelectGroup/SelectLabel` for grouping. In `readonly`, the component can still open, close, and browse options, while `SelectItem` and `setValue` cannot change value. `disabled` also blocks opening. Placement and motion stay in UI wrappers.

## Parts

| Part            | Purpose               |
| --------------- | --------------------- |
| `SelectRoot`    | value/open state      |
| `SelectTrigger` | Open entry            |
| `SelectValue`   | Current value display |
| `SelectContent` | Options container     |
| `SelectGroup`   | Group                 |
| `SelectLabel`   | Group label           |
| `SelectItem`    | One option            |

## Props

### SelectRoot

| Prop           | Type                   | Default     | Description                     |
| -------------- | ---------------------- | ----------- | ------------------------------- |
| `value`        | `unknown`              | `undefined` | Controlled value                |
| `defaultValue` | `unknown`              | `undefined` | Uncontrolled initial value      |
| `open`         | `boolean \| undefined` | `undefined` | Controlled open state           |
| `defaultOpen`  | `boolean`              | `false`     | Uncontrolled initial open state |
| `options`      | `array`                | `undefined` | Options data                    |
| `placeholder`  | `string`               | `undefined` | Placeholder                     |
| `disabled`     | `boolean`              | `false`     | Disabled                        |
| `readonly`     | `boolean`              | `false`     | Read only                       |
| `multiple`     | `boolean`              | `false`     | Multiple semantics              |

### SelectItem

| Prop     | Type     | Description   |
| -------- | -------- | ------------- |
| `option` | `object` | Option object |

## Events

| Event          | Payload   | Description  |
| -------------- | --------- | ------------ |
| `update:value` | `unknown` | Value sync   |
| `valueChange`  | `unknown` | Value change |
| `update:open`  | `boolean` | Open sync    |
| `openChange`   | `boolean` | Open change  |

## Accessibility

- Trigger opens in regular and readonly states; disabled blocks opening.
- Item performs selection; readonly/disabled must not change value.
- The role owner exposes `aria-readonly` without reporting readonly as disabled.

::: info Platform notes

- H5 can preview open/select live.
- Mini-program placement and portal strategy stay in the wrapper layer.
  :::
