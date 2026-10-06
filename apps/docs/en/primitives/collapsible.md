# Collapsible

Single disclosure runtime: Root owns open, Trigger toggles, Content shows by state.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="collapsible" locale="en" />

## Basic usage

The H5 panel provides the current Parts example and code. The native tab shows source/support evidence only, not a live mini-program preview.

## Controlled open

Use `v-model:open` when routing/analytics need ownership; height animation stays in UI wrappers.

## Parts

| Part                 | Purpose            |
| -------------------- | ------------------ |
| `CollapsibleRoot`    | Open state         |
| `CollapsibleTrigger` | Toggle entry       |
| `CollapsibleContent` | Expandable content |

## Props

| Prop          | Type                   | Default     | Description                |
| ------------- | ---------------------- | ----------- | -------------------------- |
| `open`        | `boolean \| undefined` | `undefined` | Controlled open state      |
| `defaultOpen` | `boolean`              | `false`     | Uncontrolled initial state |
| `disabled`    | `boolean`              | `false`     | Disabled                   |
| `as`          | `string`               | `'div'`     | Root element tag           |

## Events

| Event         | Payload   | Description     |
| ------------- | --------- | --------------- |
| `update:open` | `boolean` | Controlled sync |
| `openChange`  | `boolean` | Open change     |

## Accessibility

- Trigger controls open.
- Disabled state does not toggle.

::: info Platform notes

- Both runtimes share the open contract.
- Motion stays outside the primitive.
  :::
