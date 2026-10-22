# Tabs

Links tab titles to content panels through matching values.

## Runtime

State contracts come from `@varo-ui/headless`. Parts and interactive examples on this page are H5-only, from `@varo-ui/h5/primitives`. Native consumers use Wevu SFCs or headless, not equivalent Vue Parts.

## Demo

<PrimitiveExample name="tabs" locale="en" />

## Basic usage

The H5 panel provides interactive Parts and their code. The native tab shows source and support evidence, without a live mini-program preview.

## Controlled unique values

Each Trigger/Content pair must have a unique value within a `TabsRoot`. H5 automatic mode supports arrow-key switching.

## Parts

| Part          | Purpose                      |
| ------------- | ---------------------------- |
| `TabsRoot`    | Active value and orientation |
| `TabsList`    | Trigger container            |
| `TabsTrigger` | One tab title                |
| `TabsContent` | Matching panel               |

## Props

### TabsRoot

| Prop           | Type                            | Default     | Description                       |
| -------------- | ------------------------------- | ----------- | --------------------------------- |
| `value`        | `string \| number \| undefined` | `undefined` | Controlled active value           |
| `defaultValue` | `string \| number`              | `undefined` | Uncontrolled initial value        |
| `orientation`  | `string`                        | `undefined` | Tab orientation                   |
| `disabled`     | `boolean`                       | `false`     | Disable all tabs                  |
| `id`           | `string`                        | `undefined` | Prefix for associated element IDs |
| `as`           | `string`                        | `'div'`     | Root element tag                  |

### TabsTrigger / TabsContent

| Prop       | Type               | Description                       |
| ---------- | ------------------ | --------------------------------- |
| `value`    | `string \| number` | Unique value associated with Root |
| `disabled` | `boolean`          | Disables Trigger only             |

## Events

| Event          | Payload            | Description                         |
| -------------- | ------------------ | ----------------------------------- |
| `update:value` | `string \| number` | Sync the controlled active value    |
| `valueChange`  | `string \| number` | Fires when the active value changes |

## Accessibility

- Value determines the active state and links each tab to its panel.
- H5 supports arrow keys, Home, and End.
- Weapp keeps ARIA and value association without browser focus simulation.

::: info Platform notes

- The H5 panel demonstrates the keyboard behavior above; the native tab shows source and evidence without running a Parts renderer.
  :::
