# Switch

Switch runtime: Root owns checked plus loading/disabled; Thumb only consumes context.

## Runtime

Available on `@varo/primitives-h5` and `@varo/primitives-weapp`.

## Demo

<PrimitiveExample name="switch" locale="en" />

## Installation

```bash
pnpm add @varo/primitives-h5
# or
pnpm add @varo/primitives-weapp
```

## Basic usage

Use the Demo panel above to switch H5 live preview and mini-program runtime contract/code.

## Loading

Both `loading` and `disabled` close interaction; loading fits short async locks.

## Parts

| Part | Purpose |
| --- | --- |
| `SwitchRoot` | State and toggle |
| `SwitchThumb` | Thumb part |

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `checked` | `boolean \| undefined` | `undefined` | Controlled checked state |
| `defaultChecked` | `boolean` | `false` | Uncontrolled initial state |
| `disabled` | `boolean` | `false` | Disabled |
| `loading` | `boolean` | `false` | Loading; not toggleable |
| `as` | `string` | `'button'` | Root element tag |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:checked` | `boolean` | Controlled sync |
| `checkedChange` | `boolean` | State change |

## Accessibility

- Root defaults to button semantics.
- Loading/disabled states are not toggleable.

## Platform notes

- Both runtimes share checked/loading contracts.
- Track visuals and motion belong to UI wrappers.

## Related docs

- [Primitives overview](/en/primitives/)
- [Components](/en/components/button)
- [Blocks](/en/blocks/profile-edit)
