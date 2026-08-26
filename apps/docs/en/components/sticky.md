# Sticky

## Demo

<PlatformTabsDemo example="sticky" locale="en" />

## Basic Usage

```vue
<template>
  <VSticky>
    <div class="sticky-bar">Sticky Area</div>
  </VSticky>
</template>
```

## Offset Top

```vue
<template>
  <VSticky :offset-top="12" :z-index="10">
    <div class="sticky-bar">12px from top</div>
  </VSticky>
</template>
```

## Events

```vue
<template>
  <VSticky @change="fixed => console.log(fixed)" @scroll="event => console.log(event)">
    <div class="sticky-bar">Sticky Area</div>
  </VSticky>
</template>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `offsetTop` | `number \| string` | `0` | Top offset |
| `zIndex` | `number \| string` | `undefined` | Z-index |
| `disabled` | `boolean` | `false` | Disable sticky behavior |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `change` | `boolean` | Fixed state changed |
| `scroll` | `{ isFixed: boolean; scrollTop: number }` | Fired on page scroll |

## Slots

| Slot | Description |
| --- | --- |
| `default` | Sticky content, with `fixed` slot prop |

## Primitives

`Sticky` has scroll state and events, so H5 and Weapp expose a `StickyRoot` primitive. `Divider`, `Grid`, `Layout`, and `Space` are static display/layout components implemented directly in the UI packages.
