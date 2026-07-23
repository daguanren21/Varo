# Select

Composable select runtime: Root owns value/open; Trigger/Value/Content/Item split rendering duties.

## Runtime

Available on `@varo/primitives-h5` and `@varo/primitives-weapp`.

## Demo

<PrimitiveExample name="select" locale="en" />

## Installation

```bash
pnpm add @varo/primitives-h5
# or
pnpm add @varo/primitives-weapp
```

## Basic usage

Use the Demo panel above to switch H5 live preview and mini-program runtime contract/code.

## Groups and readonly

Use `SelectGroup/SelectLabel` for grouping; `readonly` blocks changes while still showing the current value. Placement and motion stay in UI wrappers.

## Parts

| Part | Purpose |
| --- | --- |
| `SelectRoot` | value/open state |
| `SelectTrigger` | Open entry |
| `SelectValue` | Current value display |
| `SelectContent` | Options container |
| `SelectGroup` | Group |
| `SelectLabel` | Group label |
| `SelectItem` | One option |

## Props

### SelectRoot

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `unknown` | `undefined` | Controlled value |
| `defaultValue` | `unknown` | `undefined` | Uncontrolled initial value |
| `open` | `boolean \| undefined` | `undefined` | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial open state |
| `options` | `array` | `undefined` | Options data |
| `placeholder` | `string` | `undefined` | Placeholder |
| `disabled` | `boolean` | `false` | Disabled |
| `readonly` | `boolean` | `false` | Read only |
| `multiple` | `boolean` | `false` | Multiple semantics |

### SelectItem

| Prop | Type | Description |
| --- | --- | --- |
| `option` | `object` | Option object |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `unknown` | Value sync |
| `valueChange` | `unknown` | Value change |
| `update:open` | `boolean` | Open sync |
| `openChange` | `boolean` | Open change |

## Accessibility

- Trigger opens the surface.
- Item performs selection.
- disabled/readonly must not change value.

## Platform notes

- H5 can preview open/select live.
- Mini-program placement and portal strategy stay in the wrapper layer.

## Related docs

- [Primitives overview](/en/primitives/)
- [Components](/en/components/button)
- [Blocks](/en/blocks/profile-edit)
