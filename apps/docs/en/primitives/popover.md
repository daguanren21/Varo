# Popover

Lightweight floating runtime: Root owns open, Trigger opens, Content renders, Close dismisses explicitly.

## Runtime

Available on `@varo/primitives-h5` and `@varo/primitives-weapp`.

## Demo

<PrimitiveExample name="popover" locale="en" />

## Installation

```bash
pnpm add @varo/primitives-h5
# or
pnpm add @varo/primitives-weapp
```

## Basic usage

Use the Demo panel above to switch H5 live preview and mini-program runtime contract/code.

## Dismiss contract

H5 may handle Escape/outside click; mini-programs lack browser `document`, so prefer `PopoverClose`, page masks, or page-level dismiss adapters.

## Parts

| Part | Purpose |
| --- | --- |
| `PopoverRoot` | Open state |
| `PopoverTrigger` | Open entry |
| `PopoverContent` | Floating content |
| `PopoverClose` | Explicit close |

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean \| undefined` | `undefined` | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state |
| `disabled` | `boolean` | `false` | Disabled |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:open` | `boolean` | Controlled sync |
| `openChange` | `boolean` | Open change |

## Accessibility

- Trigger opens the surface.
- Close provides explicit exit.
- Disabled state does not open.

## Platform notes

- H5 and mini-program share open/close contracts.
- Placement, collision, and portal stay in UI wrappers.

## Related docs

- [Primitives overview](/en/primitives/)
- [Components](/en/components/button)
- [Blocks](/en/blocks/profile-edit)
