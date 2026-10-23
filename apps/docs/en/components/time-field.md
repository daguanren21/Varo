# TimeField

`VTimeField` uses [Picker](/en/components/picker) to select hours and minutes. Values use strict 24-hour `HH:mm` strings. The component does not support seconds, time zones, or 12-hour conversion.

## Demo

<ComponentPlatformDemo component="time-field" locale="en">
  <TimeFieldDemo locale="en" />
</ComponentPlatformDemo>

## Basic usage

```vue
<script setup lang="ts">
import { VTimeField } from '@varo-ui/h5'
import { ref } from 'vue'

const time = ref('09:30')
const visible = ref(false)
</script>

<template>
  <VTimeField
    v-model:value="time"
    v-model:visible="visible"
    title="Appointment time"
    min="09:00"
    max="18:00"
    :minute-step="15"
    clearable
  />
</template>
```

For native apps, import the installed `src/components/ui/v-time-field.vue` and import reactivity from `wevu`. The `components/time-field` Registry manifest declares Picker, the base theme, native `cn`, and the pure time helpers. DateField and Calendar are not dependencies. Load native styles through the application's global style entry instead of importing global CSS inside a component.

## Drafts, constraints, and parent control

The parent owns both `value` and `visible`. Activating the field requests `update:visible(true)`. Selecting an hour or minute changes a draft; confirmation requests a value update. If the parent rejects or delays that update, the field keeps displaying the supplied value. Cancel, external close, reopening, and a replacement `value` discard the previous draft.

Bounds are inclusive. `min="22:30" max="02:15"` permits `22:30–23:59` and `00:00–02:15`, wrapping across midnight. Equal bounds permit only that minute. `minuteStep` must be an integer from `1` to `59`, defaulting to `1`. Steps restart at `00` every hour: `15` offers `00/15/30/45`, and `7` offers `00/07/14/21/28/35/42/49/56`. Invalid steps or malformed bounds throw `RangeError`.

An invalid, out-of-range, or off-step external value stays visible exactly as supplied. Mounting and opening never emit a correction. For the draft, the picker keeps a valid complete value if possible, then tries the first available minute of the supplied hour, then the first available time of day. Only explicit confirmation submits that candidate. Changing hours recalculates the minute options; confirmation also validates the complete time.

For example, `min="10:01" max="10:14" :minute-step="15"` has no available candidate and disables confirmation. A disabled or read-only field cannot open, edit, or clear. Even when a parent forces `visible=true`, its options and confirmation remain disabled; cancel can still request closure.

## Props

| Prop          | Type      | Default         | Description                                             |
| ------------- | --------- | --------------- | ------------------------------------------------------- |
| `value`       | `string`  | `undefined`     | Parent-accepted `HH:mm`; `''` means empty               |
| `visible`     | `boolean` | `false`         | Controlled picker visibility                            |
| `min`         | `string`  | `'00:00'`       | Inclusive earliest time                                 |
| `max`         | `string`  | `'23:59'`       | Inclusive latest time; wraps when less than `min`       |
| `minuteStep`  | `number`  | `1`             | Integer minute step `1..59`, starting at `00` each hour |
| `disabled`    | `boolean` | `false`         | Disable the field, including forced-open operations     |
| `readonly`    | `boolean` | `false`         | Prevent all value mutations                             |
| `clearable`   | `boolean` | `false`         | Show a separate clear button for a nonempty value       |
| `placeholder` | `string`  | `'Select time'` | Empty-value label                                       |
| `title`       | `string`  | `undefined`     | Picker title                                            |
| `confirmText` | `string`  | `'Confirm'`     | Confirmation label                                      |
| `cancelText`  | `string`  | `'Cancel'`      | Cancellation label                                      |
| `clearText`   | `string`  | `'Clear'`       | Clear button label                                      |

The `min`/`max` defaults describe the effective bounds when omitted. Native optional controlled properties preserve absent `null` values; explicit `false` and `''` remain supplied values.

## Events

| Event            | Payload   | Description                                                                                |
| ---------------- | --------- | ------------------------------------------------------------------------------------------ |
| `update:value`   | `string`  | A valid confirmation distinct from the supplied value, or clear to `''`                    |
| `update:visible` | `boolean` | Request to open or close; the parent accepts it                                            |
| `change`         | `string`  | A different valid draft, or `''` when clearing a nonempty value; not a commit notification |
| `confirm`        | `string`  | Valid confirmation intent, including confirming the same value                             |
| `cancel`         | `void`    | Discard the draft and request closure                                                      |
| `clear`          | `void`    | Request to clear a nonempty value                                                          |

Selecting the active candidate emits no `change`. Confirming the current value emits `confirm` and a close request without duplicate `update:value` or `change`. Both renderers emit a single scalar value. When migrating a native `<picker mode="time">`, consume the string from `@update:value="value => ..."` instead of reading `event.detail.value`.
