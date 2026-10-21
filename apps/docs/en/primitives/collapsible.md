# Collapsible

Compose Root, Trigger, and Content to show or hide a single area.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="collapsible" locale="en" />

## Basic usage

The H5 panel provides interactive Parts and their code. The native tab shows source and support evidence, without a live mini-program preview.

## Controlled open

Use `v-model:open` to synchronize the open state with routing or analytics. Handle height animation in a UI wrapper.

## Parts

| Part                 | Purpose                            |
| -------------------- | ---------------------------------- |
| `CollapsibleRoot`    | Manages open state                 |
| `CollapsibleTrigger` | Toggles the content open or closed |
| `CollapsibleContent` | Expandable content                 |

## Props

| Prop          | Type                   | Default     | Description                     |
| ------------- | ---------------------- | ----------- | ------------------------------- |
| `open`        | `boolean \| undefined` | `undefined` | Controlled open state           |
| `defaultOpen` | `boolean`              | `false`     | Uncontrolled initial open state |
| `disabled`    | `boolean`              | `false`     | Prevent toggling                |
| `as`          | `string`               | `'div'`     | Root element tag                |

## Events

| Event         | Payload   | Description                       |
| ------------- | --------- | --------------------------------- |
| `update:open` | `boolean` | Sync the controlled open state    |
| `openChange`  | `boolean` | Fires when the open state changes |

## Accessibility

- Trigger toggles the open state unless disabled.

::: info Platform notes

- Both runtimes share the open contract.
- Motion stays outside the primitive.
  :::
