# Select

`VSelect` is a Base Kit selection component for forms, filters, and business wrappers. The H5 / full Vue wrapper and the native Registry component installed by `--target weapp` have different runtimes and APIs; use the corresponding section.

## Demo

<FormComponentDemo example="select" locale="en" />

## H5 / Full Vue Wrapper

The H5 Registry entry and full Vue wrapper use `picker` mode by default. Control the selected value with `v-model:value`, `value`, `update:value`, and `valueChange`.

### Multiple Selection And Confirm

Multiple selection confirms draft changes by default. Set `:confirmable="false"` to apply selections immediately.

### Search And Dropdown

Use `filterable` to search local options directly in the Select field, without a second search input in the panel. Use `mode="dropdown"` for dropdown presentation.

### Readonly And Disabled

`readonly` allows opening, closing, and browsing options, but blocks value changes, clearing, and multiple-selection confirmation. Enabling it while the panel is open discards the unconfirmed draft. `disabled` blocks opening and value changes, with no readonly browsing mode.

On H5, a readonly `filterable` field uses the input element's native readonly behavior.

Name the field with `aria-label` or `aria-labelledby`. These attributes label the actual `combobox` button or search input, keeping its selected value separate.

### Props

| Prop           | Type                                          | Default      | Description                                          |
| -------------- | --------------------------------------------- | ------------ | ---------------------------------------------------- |
| `value`        | `string \| number \| Array<string \| number>` | `undefined`  | Selected value                                       |
| `options`      | `VSelectOption[]`                             | `[]`         | Options                                              |
| `mode`         | `'picker' \| 'dropdown'`                      | `'picker'`   | Presentation mode                                    |
| `placeholder`  | `string`                                      | `'请选择'`   | Placeholder text                                     |
| `disabled`     | `boolean`                                     | `false`      | Disabled state                                       |
| `readonly`     | `boolean`                                     | `false`      | Readonly state                                       |
| `clearable`    | `boolean`                                     | `false`      | Shows a clear action                                 |
| `multiple`     | `boolean`                                     | `false`      | Enables multiple selection                           |
| `max`          | `number`                                      | `undefined`  | Maximum selected count                               |
| `filterable`   | `boolean`                                     | `false`      | Filters local options directly from the Select field |
| `confirmable`  | `boolean`                                     | `true`       | Confirms draft changes in multiple mode              |
| `filterOption` | `(query, option) => boolean`                  | `undefined`  | Custom local filter                                  |
| `loading`      | `boolean`                                     | `false`      | Loading display                                      |
| `emptyText`    | `string`                                      | `'暂无数据'` | Empty state text                                     |

### Events

| Event          | Payload                                                    | Description                     |
| -------------- | ---------------------------------------------------------- | ------------------------------- |
| `update:value` | `string \| number \| Array<string \| number> \| undefined` | Selected value updated          |
| `valueChange`  | `string \| number \| Array<string \| number> \| undefined` | Selected value changed          |
| `clear`        | `void`                                                     | Cleared                         |
| `open`         | `void`                                                     | Opened                          |
| `close`        | `void`                                                     | Closed                          |
| `confirm`      | `Array<string \| number>`                                  | Multiple selection confirmed    |
| `cancel`       | `void`                                                     | Cancelled                       |
| `search`       | `string`                                                   | Search input changed            |
| `limit`        | `{ max: number }`                                          | Maximum selected count exceeded |

## Native Registry Weapp

`--target weapp` installs the native Wevu SFC at `src/components/ui/select.vue` with fewer APIs. `readonly` allows opening, closing, and browsing options, but blocks value changes, clearing, and filter input. Native inputs cannot reliably support this readonly behavior, so `filterable + readonly` uses a button-style trigger.

Multiple selection has no draft or confirmation step: every option click updates the value immediately. The bottom completion (`完成`) button only closes the panel; it does not submit the value again or emit a confirmation event.

Reopening a filterable field keeps the selected label until typing starts; clearing the search does not clear the selection. Tapping outside closes the panel and restores the selected label. In single-selection mode, choosing any enabled option closes the panel, including the current option; an unchanged value does not emit a duplicate value update.

While open, the selected label uses the muted text color until search input starts. Typing or closing the panel restores the normal text color; borders, icons, and focus indicators retain their opacity.

### Props

| Prop          | Type                                                                    | Default     | Description                                                                                                      |
| ------------- | ----------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------- |
| `value`       | `string \| number \| Array<string \| number>`                           | `undefined` | Selected value                                                                                                   |
| `options`     | `Array<{ label: string; value: string \| number; disabled?: boolean }>` | `[]`        | Native options                                                                                                   |
| `placeholder` | `string`                                                                | `'请选择'`  | Placeholder text                                                                                                 |
| `disabled`    | `boolean`                                                               | `false`     | Blocks opening and value changes                                                                                 |
| `readonly`    | `boolean`                                                               | `false`     | Allows browsing but blocks value changes, clearing, and filter input                                             |
| `clearable`   | `boolean`                                                               | `false`     | Shows the clear action for an editable selected value after click or focus opens the panel; hides it when closed |
| `multiple`    | `boolean`                                                               | `false`     | Enables multiple selection; each option click updates the value immediately                                      |
| `filterable`  | `boolean`                                                               | `false`     | Filters options whose labels contain the search text and emits search input                                      |

### Events

| Event          | Payload                                                    | Description                    |
| -------------- | ---------------------------------------------------------- | ------------------------------ |
| `update:value` | `string \| number \| Array<string \| number> \| undefined` | Selected value updated         |
| `change`       | `string \| number \| Array<string \| number> \| undefined` | Emitted with each value update |
| `clear`        | `void`                                                     | Selection cleared              |
| `search`       | `string`                                                   | Filter input changed           |

Native Registry Weapp does not provide `mode`, `max`, `confirmable`, `filterOption`, `loading`, or `emptyText`, and it does not emit `valueChange`, `open`, `close`, `confirm`, `cancel`, or `limit`.

::: info Wrapper boundary
Base Kit does not provide grouped options, remote search, or async paging. Implement them by wrapping `VSelect` in business components such as `UserSelect`, `DepartmentSelect`, `CitySelect`, and `ProductSelect`.
:::
