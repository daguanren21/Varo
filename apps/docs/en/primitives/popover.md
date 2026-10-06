# Popover

Lightweight floating runtime: Root owns open, Trigger opens, Content renders, Close dismisses explicitly.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="popover" locale="en" />

## Basic usage

The H5 panel provides the current Parts example and code. The native tab shows source/support evidence only, not a live mini-program preview.

## Dismiss contract

H5 may handle Escape/outside click. Native consumers have no browser `document`; use the native `VPopoverClose` SFC or a page mask, not the H5 Parts on this page.

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

::: info Platform notes

- H5 and mini-program share open/close contracts.
- Placement, collision, and portal stay in UI wrappers.
  :::
