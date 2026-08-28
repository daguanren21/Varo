# Image

## Demo

<PlatformTabsDemo example="image" locale="en" />

## Basic Usage

```vue
<template>
  <VImage src="/logo.png" width="96" height="96" fit="cover" radius="12px" />
</template>
```

## Fit Modes

```vue
<template>
  <VImage src="/logo.png" width="96" height="96" fit="contain" />
  <VImage src="/logo.png" width="96" height="96" fit="cover" />
  <VImage src="/logo.png" width="96" height="96" fit="fill" />
</template>
```

## Round Image

```vue
<template>
  <VImage src="/logo.png" width="72" height="72" round />
</template>
```

## Loading and Error

```vue
<template>
  <VImage src="/not-found.png" width="96" height="96" error-text="Load failed" />
</template>
```

## Props

| Prop          | Type                                                       | Default     | Description              |
| ------------- | ---------------------------------------------------------- | ----------- | ------------------------ |
| `src`         | `string`                                                   | `undefined` | Image source             |
| `alt`         | `string`                                                   | `''`        | Alternative text         |
| `width`       | `number \| string`                                         | `undefined` | Container width          |
| `height`      | `number \| string`                                         | `undefined` | Container height         |
| `fit`         | `'contain' \| 'cover' \| 'fill' \| 'none' \| 'scale-down'` | `'fill'`    | Object fit mode          |
| `position`    | `string`                                                   | `'center'`  | `object-position`        |
| `radius`      | `number \| string`                                         | `undefined` | Border radius            |
| `round`       | `boolean`                                                  | `false`     | Render as a circle       |
| `lazyLoad`    | `boolean`                                                  | `false`     | Use native lazy loading  |
| `showLoading` | `boolean`                                                  | `true`      | Show loading placeholder |
| `showError`   | `boolean`                                                  | `true`      | Show error placeholder   |
| `loadingText` | `string`                                                   | `''`        | Loading placeholder text |
| `errorText`   | `string`                                                   | `''`        | Error placeholder text   |
| `draggable`   | `boolean \| undefined`                                     | `undefined` | Image draggable flag     |

## Events

| Event   | Payload      | Description          |
| ------- | ------------ | -------------------- |
| `load`  | `Event`      | Image loaded         |
| `error` | `Event`      | Image failed to load |
| `click` | `MouseEvent` | Root click           |

## Slots

| Slot      | Description                |
| --------- | -------------------------- |
| `loading` | Custom loading placeholder |
| `error`   | Custom error placeholder   |

## Primitives

`ImageRoot` comes from `@varo-ui/h5/primitives` or `@varo-ui/weapp/primitives`; `@varo-ui/headless` only carries shared state contracts, while `VImage` adds the Varo API wrapper and classes.
