# Collapsible

Single disclosure runtime: Root owns open, Trigger toggles, Content shows by state.

## Runtime

Available on `@varo/primitives-h5` and `@varo/primitives-weapp`.

## Demo

<PrimitiveExample name="collapsible" locale="en" />

## Installation

```bash
pnpm add @varo/primitives-h5
# or
pnpm add @varo/primitives-weapp
```

## Basic usage

Use the Demo panel above to switch H5 live preview and mini-program runtime contract/code.

## Controlled open

Use `v-model:open` when routing/analytics need ownership; height animation stays in UI wrappers.

## Parts

| Part | Purpose |
| --- | --- |
| `CollapsibleRoot` | Open state |
| `CollapsibleTrigger` | Toggle entry |
| `CollapsibleContent` | Expandable content |

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean \| undefined` | `undefined` | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state |
| `disabled` | `boolean` | `false` | Disabled |
| `as` | `string` | `'div'` | Root element tag |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:open` | `boolean` | Controlled sync |
| `openChange` | `boolean` | Open change |

## Accessibility

- Trigger controls open.
- Disabled state does not toggle.

## Platform notes

- Both runtimes share the open contract.
- Motion stays outside the primitive.

## Related docs

- [Primitives overview](/en/primitives/)
- [Components](/en/components/button)
- [Blocks](/en/blocks/profile-edit)
