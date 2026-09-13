# Navbar

## Demo

<PlatformTabsDemo example="navbar" locale="en" />

## Basic Usage

```vue
<template>
  <VNavbar title="Order Detail" left-text="Back" right-text="More" left-arrow />
</template>
```

## Props

| Prop             | Type      | Default     | Description                          |
| ---------------- | --------- | ----------- | ------------------------------------ |
| `title`          | `string`  | `undefined` | Title                                |
| `leftText`       | `string`  | `undefined` | Left text                            |
| `rightText`      | `string`  | `undefined` | Right text                           |
| `leftAriaLabel`  | `string`  | `undefined` | Accessible name for the left action  |
| `rightAriaLabel` | `string`  | `undefined` | Accessible name for the right action |
| `leftArrow`      | `boolean` | `false`     | Show back arrow                      |
| `fixed`          | `boolean` | `false`     | Fix to top                           |
| `placeholder`    | `boolean` | `false`     | Reserve space when fixed             |
| `border`         | `boolean` | `true`      | Show bottom border                   |

## Events

| Event        | Payload      | Description        |
| ------------ | ------------ | ------------------ |
| `clickLeft`  | `MouseEvent` | Left area clicked  |
| `clickRight` | `MouseEvent` | Right area clicked |

## Slots

| Slot    | Description       |
| ------- | ----------------- |
| `left`  | Custom left area  |
| `title` | Custom title      |
| `right` | Custom right area |
