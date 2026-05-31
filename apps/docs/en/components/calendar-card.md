# CalendarCard

## Basic Usage

<FormComponentDemo example="calendar-card" locale="en" />

## Date Range

Use `minDate` and `maxDate` to limit selectable dates.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string` | `undefined` | Selected date |
| `month` | `string` | Current month | Displayed month, formatted as `YYYY-MM` |
| `minDate` | `string` | `undefined` | Minimum selectable date |
| `maxDate` | `string` | `undefined` | Maximum selectable date |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string` | Selected date changed |
| `select` | `string` | Select a date |
