# Button

## Demo

<PlatformTabsDemo example="button" locale="en" />

## Basic Usage

```vue
<template>
  <VButton>Default</VButton>
  <VButton tone="primary">
    Primary
  </VButton>
  <VButton tone="success">
    Success
  </VButton>
  <VButton tone="warning">
    Warning
  </VButton>
  <VButton tone="danger">
    Danger
  </VButton>
</template>
```

## Variants

```vue
<template>
  <VButton variant="solid">
    Solid
  </VButton>
  <VButton variant="outline">
    Outline
  </VButton>
  <VButton variant="ghost">
    Ghost
  </VButton>
  <VButton variant="text">
    Text action
  </VButton>
  <VButton plain>
    Plain
  </VButton>
  <VButton hairline plain>
    Hairline
  </VButton>
</template>
```

## Sizes

```vue
<template>
  <VButton size="sm">
    Small
  </VButton>
  <VButton size="md">
    Medium
  </VButton>
  <VButton size="lg">
    Large
  </VButton>
</template>
```

## Shape And Block

```vue
<template>
  <VButton shape="square">
    Square
  </VButton>
  <VButton shape="round">
    Round
  </VButton>
  <VButton block>
    Block
  </VButton>
</template>
```

## Icon And Loading

```vue
<template>
  <VButton icon="+">
    Create
  </VButton>
  <VButton icon="✓" icon-position="right">
    Done
  </VButton>
  <VButton loading>
    Submitting
  </VButton>
  <VButton loading loading-text="Saving..." />
</template>
```

## Color And Native Type

```vue
<template>
  <VButton color="#07c160">
    Custom Color
  </VButton>
  <VButton native-type="submit">
    Submit Form
  </VButton>
  <VButton disabled>
    Disabled
  </VButton>
</template>
```

## Props

| Prop           | Type                                                           | Default     | Description                                |
| -------------- | -------------------------------------------------------------- | ----------- | ------------------------------------------ |
| `variant`      | `'solid' \| 'outline' \| 'ghost' \| 'text'`                    | `'solid'`   | Visual variant                             |
| `tone`         | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'primary'` | Semantic tone                              |
| `size`         | `'sm' \| 'md' \| 'lg'`                                         | `'md'`      | Button size                                |
| `shape`        | `'default' \| 'square' \| 'round'`                             | `'default'` | Button shape                               |
| `plain`        | `boolean`                                                      | `false`     | Plain button, mapped to outline styling    |
| `hairline`     | `boolean`                                                      | `false`     | Hairline border marker                     |
| `block`        | `boolean`                                                      | `false`     | Fill the parent width                      |
| `icon`         | `string`                                                       | `undefined` | Icon text or icon name for the style layer |
| `iconPosition` | `'left' \| 'right'`                                            | `'left'`    | Icon position                              |
| `loading`      | `boolean`                                                      | `false`     | Loading state, blocks clicks               |
| `loadingText`  | `string`                                                       | `undefined` | Replaces default content while loading     |
| `disabled`     | `boolean`                                                      | `false`     | Disabled state                             |
| `color`        | `string`                                                       | `undefined` | Custom button color                        |
| `nativeType`   | `'button' \| 'submit' \| 'reset'`                              | `undefined` | Native button type                         |

## Slots

| Slot      | Description                                            |
| --------- | ------------------------------------------------------ |
| `default` | Button content                                         |
| `icon`    | Custom icon content; has priority over the `icon` prop |

## Data Attributes

| Attribute       | Description            |
| --------------- | ---------------------- |
| `data-variant`  | Current visual variant |
| `data-tone`     | Current semantic tone  |
| `data-size`     | Current size           |
| `data-shape`    | Current shape          |
| `data-loading`  | Loading state          |
| `data-disabled` | Disabled state         |
| `data-plain`    | Plain state            |
| `data-hairline` | Hairline state         |
| `data-block`    | Block state            |
