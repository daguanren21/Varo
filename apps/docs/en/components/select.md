# Select

`VSelect` is the low-level Base Kit select component for forms, filters, and secondary business wrappers. The H5 / full Vue wrapper and the native Registry component installed by `--target weapp` target different runtimes; use the API section for the version you consume.

<RegistryInstallStrip item="components/select" :targets="['h5', 'weapp']" locale="en" />

## Demo

<FormComponentDemo example="select" locale="en" />

## H5 / Full Vue Wrapper

The H5 Registry entry and full Vue wrapper use `picker` mode by default. Their controlled contract uses `v-model:value`, `value`, `update:value`, and `valueChange`.

### Multiple Selection And Confirm

Multiple selection confirms draft changes by default. Set `:confirmable="false"` to apply selections immediately.

### Search And Dropdown

Use `filterable` to type and filter local options directly in the Select field; the open panel does not render a second search input. Use `mode="dropdown"` for dropdown presentation.

### Readonly And Disabled

`readonly` keeps the component operable: it can still open, close, and browse options, but it never updates the selected value or emits clear or multiple-confirm commits. Switching to readonly while a panel is open also discards an unconfirmed draft. `disabled` blocks opening and value mutation and does not provide a readonly browsing entry.

On H5, a readonly `filterable` field uses the native readonly input contract.

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

`--target weapp` installs the native Wevu SFC at `src/components/ui/select.vue` with a smaller runtime contract. `readonly` can still open, close, and browse options, but it does not update the selected value; the clear action and filter input are unavailable. Because a native mini-program input cannot reliably express the same readonly contract, `filterable + readonly` uses the button-style trigger.

Multiple selection has no draft or confirmation commit: every option click updates the value immediately. The bottom completion (`完成`) button only closes the panel; it does not commit again or emit a confirmation event.

### Props

| Prop          | Type                                                                    | Default     | Description                                                               |
| ------------- | ----------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------- |
| `value`       | `string \| number \| Array<string \| number>`                           | `undefined` | Selected value                                                            |
| `options`     | `Array<{ label: string; value: string \| number; disabled?: boolean }>` | `[]`        | Native options                                                            |
| `placeholder` | `string`                                                                | `'请选择'`  | Placeholder text                                                          |
| `disabled`    | `boolean`                                                               | `false`     | Blocks opening and value changes                                          |
| `readonly`    | `boolean`                                                               | `false`     | Allows browsing but blocks value changes, clearing, and filter input      |
| `clearable`   | `boolean`                                                               | `false`     | Shows the clear action when a value exists and the control is interactive |
| `multiple`    | `boolean`                                                               | `false`     | Enables multiple selection with immediate per-option commits              |
| `filterable`  | `boolean`                                                               | `false`     | Performs a local label-contains match and emits search input              |

### Events

| Event          | Payload                                                    | Description                    |
| -------------- | ---------------------------------------------------------- | ------------------------------ |
| `update:value` | `string \| number \| Array<string \| number> \| undefined` | Selected value updated         |
| `change`       | `string \| number \| Array<string \| number> \| undefined` | Emitted with each value update |
| `clear`        | `void`                                                     | Selection cleared              |
| `search`       | `string`                                                   | Filter input changed           |

Native Registry Weapp does not provide `mode`, `max`, `confirmable`, `filterOption`, `loading`, or `emptyText`, and it does not emit `valueChange`, `open`, `close`, `confirm`, `cancel`, or `limit`.

## Wrapper Boundary

Grouped options, remote search, and async paging belong in secondary wrappers. Business components should wrap `VSelect` to create `UserSelect`, `DepartmentSelect`, `CitySelect`, and `ProductSelect`.
