# Tabs

Tabs runtime: Root owns the active value; Trigger/Content associate through the same value.

## Runtime

Available on `@varo/primitives-h5` and `@varo/primitives-weapp`.

## Demo

<PrimitiveExample name="tabs" locale="en" />

## Installation

```bash
pnpm add @varo/primitives-h5
# or
pnpm add @varo/primitives-weapp
```

## Basic usage

Use the Demo panel above to switch H5 live preview and mini-program runtime contract/code.

## Controlled unique values

Trigger/Content values must stay unique inside one `TabsRoot`; H5 automatic mode supports arrow-key movement.

## Parts

| Part | Purpose |
| --- | --- |
| `TabsRoot` | Active value and orientation |
| `TabsList` | Trigger container |
| `TabsTrigger` | One tab title |
| `TabsContent` | Matching panel |

## Props

### TabsRoot

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| undefined` | `undefined` | Controlled active value |
| `defaultValue` | `string \| number` | `undefined` | Uncontrolled initial value |
| `orientation` | `string` | `undefined` | Orientation semantics |
| `disabled` | `boolean` | `false` | Disables the whole tabs root |
| `id` | `string` | `undefined` | Association id prefix |
| `as` | `string` | `'div'` | Root element tag |

### TabsTrigger / TabsContent

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string \| number` | Unique value associated with Root |
| `disabled` | `boolean` | Trigger-only disabled flag |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string \| number` | Controlled sync |
| `valueChange` | `string \| number` | Active value change |

## Accessibility

- Value drives both state and panel association.
- H5 supports arrows/Home/End.
- Weapp keeps ARIA and value association without browser focus simulation.

## Platform notes

- H5 can demonstrate keyboard behavior.
- Mini-program docs show a runtime contract, not a fake device preview.

## Related docs

- [Primitives overview](/en/primitives/)
- [Components](/en/components/button)
- [Blocks](/en/blocks/profile-edit)
