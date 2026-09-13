# Searchbar

## Demo

<FormComponentDemo example="searchbar" locale="en" />

## Props

| Prop             | Type      | Default     | Description                          |
| ---------------- | --------- | ----------- | ------------------------------------ |
| `value`          | `string`  | `''`        | Search value                         |
| `placeholder`    | `string`  | `'Search'`  | Placeholder                          |
| `inputAriaLabel` | `string`  | `undefined` | Accessible name for the search input |
| `actionText`     | `string`  | `''`        | Action button text                   |
| `clearable`      | `boolean` | `true`      | Show clear affordance                |
| `disabled`       | `boolean` | `false`     | Disable input                        |

## Events

| Event          | Payload      | Description   |
| -------------- | ------------ | ------------- |
| `update:value` | `string`     | Value changed |
| `search`       | `string`     | Submit search |
| `clear`        | `MouseEvent` | Clear value   |
| `cancel`       | `void`       | Click action  |
| `focus`        | `FocusEvent` | Input focused |
| `blur`         | `FocusEvent` | Input blurred |
