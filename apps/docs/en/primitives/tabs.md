# Tabs

Tabs runtime: Root owns the active value; Trigger/Content associate through the same value.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="tabs" locale="en" />

## Basic usage

The H5 panel provides the current Parts example and code. The native tab shows source/support evidence only, not a live mini-program preview.

## Controlled unique values

Trigger/Content values must stay unique inside one `TabsRoot`; H5 automatic mode supports arrow-key movement.

## Parts

| Part          | Purpose                      |
| ------------- | ---------------------------- |
| `TabsRoot`    | Active value and orientation |
| `TabsList`    | Trigger container            |
| `TabsTrigger` | One tab title                |
| `TabsContent` | Matching panel               |

## Props

### TabsRoot

| Prop           | Type                            | Default     | Description                  |
| -------------- | ------------------------------- | ----------- | ---------------------------- |
| `value`        | `string \| number \| undefined` | `undefined` | Controlled active value      |
| `defaultValue` | `string \| number`              | `undefined` | Uncontrolled initial value   |
| `orientation`  | `string`                        | `undefined` | Orientation semantics        |
| `disabled`     | `boolean`                       | `false`     | Disables the whole tabs root |
| `id`           | `string`                        | `undefined` | Association id prefix        |
| `as`           | `string`                        | `'div'`     | Root element tag             |

### TabsTrigger / TabsContent

| Prop       | Type               | Description                       |
| ---------- | ------------------ | --------------------------------- |
| `value`    | `string \| number` | Unique value associated with Root |
| `disabled` | `boolean`          | Trigger-only disabled flag        |

## Events

| Event          | Payload            | Description         |
| -------------- | ------------------ | ------------------- |
| `update:value` | `string \| number` | Controlled sync     |
| `valueChange`  | `string \| number` | Active value change |

## Accessibility

- Value drives both state and panel association.
- H5 supports arrows/Home/End.
- Weapp keeps ARIA and value association without browser focus simulation.

::: info Platform notes

- H5 can demonstrate keyboard behavior.
- The native tab provides target source and evidence, not a live Parts renderer.
  :::
