# Accordion

Accordion runtime: Root supports single/multiple, Item provides a unique value, Trigger/Content form each entry.

## Runtime

Available on `@varo/primitives-h5` and `@varo/primitives-weapp`.

## Demo

<PrimitiveExample name="accordion" locale="en" />

## Installation

```bash
pnpm add @varo/primitives-h5
# or
pnpm add @varo/primitives-weapp
```

## Basic usage

Use the Demo panel above to switch H5 live preview and mini-program runtime contract/code.

## Multiple mode

With `type="multiple"`, value is an array; item values must stay unique.

## Parts

| Part | Purpose |
| --- | --- |
| `AccordionRoot` | Collection state |
| `AccordionItem` | One entry |
| `AccordionTrigger` | Entry title |
| `AccordionContent` | Entry body |

## Props

### AccordionRoot

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'single' \| 'multiple'` | implementation default | Single or multiple open |
| `value` | `string \| string[] \| undefined` | `undefined` | Controlled value |
| `defaultValue` | `string \| string[]` | `undefined` | Uncontrolled initial value |
| `collapsible` | `boolean` | `false` | Allow all collapsed in single mode |
| `disabled` | `boolean` | `false` | Disable whole root |
| `id` | `string` | `undefined` | Association id |

### AccordionItem

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` | Unique item value |
| `disabled` | `boolean` | Item disabled |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string \| string[]` | Controlled sync |
| `valueChange` | `string \| string[]` | Value change |

## Accessibility

- Item value associates Trigger/Content.
- Disabled items cannot expand.

## Platform notes

- Both runtimes share single/multiple contracts.
- Motion and icons belong to UI wrappers.

## Related docs

- [Primitives overview](/en/primitives/)
- [Components](/en/components/button)
- [Blocks](/en/blocks/profile-edit)
