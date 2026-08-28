# Popover

Lightweight floating runtime: Root owns open, Trigger opens, Content renders, Close dismisses explicitly.

## Runtime

State contracts come from `@varo-ui/headless`; rendered parts come from `@varo-ui/h5/primitives` or `@varo-ui/weapp/primitives`.

## Demo

<PrimitiveExample name="popover" locale="en" />

## Installation

```bash
pnpm add @varo-ui/headless @varo-ui/h5
# or
pnpm add @varo-ui/headless @varo-ui/weapp
```

## Basic usage

Use the Demo panel above to switch H5 live preview and mini-program runtime contract/code.

## Dismiss contract

H5 may handle Escape/outside click; mini-programs lack browser `document`, so prefer `PopoverClose`, page masks, or page-level dismiss adapters.

## Parts

| Part             | Purpose          |
| ---------------- | ---------------- |
| `PopoverRoot`    | Open state       |
| `PopoverTrigger` | Open entry       |
| `PopoverContent` | Floating content |
| `PopoverClose`   | Explicit close   |

## Props

| Prop          | Type                   | Default     | Description                |
| ------------- | ---------------------- | ----------- | -------------------------- |
| `open`        | `boolean \| undefined` | `undefined` | Controlled open state      |
| `defaultOpen` | `boolean`              | `false`     | Uncontrolled initial state |
| `disabled`    | `boolean`              | `false`     | Disabled                   |

## Events

| Event         | Payload   | Description     |
| ------------- | --------- | --------------- |
| `update:open` | `boolean` | Controlled sync |
| `openChange`  | `boolean` | Open change     |

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
