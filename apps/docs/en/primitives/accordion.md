# Accordion

Accordion runtime: Root supports single/multiple, Item provides a unique value, Trigger/Content form each entry.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="accordion" locale="en" />

## Basic usage

The H5 panel provides the current Parts example and code. The native tab shows source/support evidence only, not a live mini-program preview.

## Multiple mode

With `type="multiple"`, value is an array; item values must stay unique.

## Parts

| Part               | Purpose          |
| ------------------ | ---------------- |
| `AccordionRoot`    | Collection state |
| `AccordionItem`    | One entry        |
| `AccordionTrigger` | Entry title      |
| `AccordionContent` | Entry body       |

## Props

### AccordionRoot

| Prop           | Type                              | Default                | Description                        |
| -------------- | --------------------------------- | ---------------------- | ---------------------------------- |
| `type`         | `'single' \| 'multiple'`          | implementation default | Single or multiple open            |
| `value`        | `string \| string[] \| undefined` | `undefined`            | Controlled value                   |
| `defaultValue` | `string \| string[]`              | `undefined`            | Uncontrolled initial value         |
| `collapsible`  | `boolean`                         | `false`                | Allow all collapsed in single mode |
| `disabled`     | `boolean`                         | `false`                | Disable whole root                 |
| `id`           | `string`                          | `undefined`            | Association id                     |

### AccordionItem

| Prop       | Type      | Description       |
| ---------- | --------- | ----------------- |
| `value`    | `string`  | Unique item value |
| `disabled` | `boolean` | Item disabled     |

## Events

| Event          | Payload              | Description     |
| -------------- | -------------------- | --------------- |
| `update:value` | `string \| string[]` | Controlled sync |
| `valueChange`  | `string \| string[]` | Value change    |

## Accessibility

- Item value associates Trigger/Content.
- Disabled items cannot expand.

::: info Platform notes

- Both runtimes share single/multiple contracts.
- Motion and icons belong to UI wrappers.
  :::
