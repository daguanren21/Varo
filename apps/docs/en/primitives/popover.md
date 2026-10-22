# Popover

Compose Root, Trigger, Content, and Close to create a popover.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="popover" locale="en" />

## Basic usage

The H5 panel provides interactive Parts and their code. The native tab shows source and support evidence, without a live mini-program preview.

## Dismiss contract

H5 may handle Escape and outside clicks. Native consumers have no browser `document`; use the native `VPopoverClose` SFC or a page mask to close.

## Parts

| Part             | Purpose            |
| ---------------- | ------------------ |
| `PopoverRoot`    | Manages open state |
| `PopoverTrigger` | Opens the popover  |
| `PopoverContent` | Floating content   |
| `PopoverClose`   | Explicit close     |

## Props

| Prop          | Type                   | Default     | Description                     |
| ------------- | ---------------------- | ----------- | ------------------------------- |
| `open`        | `boolean \| undefined` | `undefined` | Controlled open state           |
| `defaultOpen` | `boolean`              | `false`     | Uncontrolled initial open state |
| `disabled`    | `boolean`              | `false`     | Prevent opening the popover     |

## Events

| Event         | Payload   | Description                       |
| ------------- | --------- | --------------------------------- |
| `update:open` | `boolean` | Sync the controlled open state    |
| `openChange`  | `boolean` | Fires when the open state changes |

## Accessibility

- Trigger cannot open the popover when disabled; Close provides explicit dismissal.

::: info Platform notes

- H5 and mini-program share open/close contracts.
- Placement, collision, and portal stay in UI wrappers.
  :::
