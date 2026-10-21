# Accordion

A composable accordion with single and multiple modes.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="accordion" locale="en" />

## Basic usage

The H5 panel provides interactive Parts and their code. The native tab shows source and support evidence, without a live mini-program preview.

## Multiple mode

With `type="multiple"`, value is an array; item values must stay unique.

## Parts

| Part               | Purpose                        |
| ------------------ | ------------------------------ |
| `AccordionRoot`    | Manages which entries are open |
| `AccordionItem`    | One entry                      |
| `AccordionTrigger` | Entry title                    |
| `AccordionContent` | Entry body                     |

## Props

### AccordionRoot

| Prop           | Type                              | Default                | Description                               |
| -------------- | --------------------------------- | ---------------------- | ----------------------------------------- |
| `type`         | `'single' \| 'multiple'`          | implementation default | Open one or multiple entries at a time    |
| `value`        | `string \| string[] \| undefined` | `undefined`            | Controlled value                          |
| `defaultValue` | `string \| string[]`              | `undefined`            | Uncontrolled initial value                |
| `collapsible`  | `boolean`                         | `false`                | Allow all entries to close in single mode |
| `disabled`     | `boolean`                         | `false`                | Disable the whole group                   |
| `id`           | `string`                          | `undefined`            | Association id                            |

### AccordionItem

| Prop       | Type      | Description       |
| ---------- | --------- | ----------------- |
| `value`    | `string`  | Unique item value |
| `disabled` | `boolean` | Disable this item |

## Events

| Event          | Payload              | Description                  |
| -------------- | -------------------- | ---------------------------- |
| `update:value` | `string \| string[]` | Sync the controlled value    |
| `valueChange`  | `string \| string[]` | Fires when the value changes |

## Accessibility

- Each Item's value links its Trigger and Content.
- Disabled items cannot expand.

::: info Platform notes

- Both runtimes share single/multiple contracts.
- Motion and icons belong to UI wrappers.
  :::
