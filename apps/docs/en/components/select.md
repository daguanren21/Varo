# Select

`VSelect` is the low-level Base Kit select component for forms, filters, and secondary business wrappers. It uses `picker` mode by default for H5, mini-program, and App mobile interactions. The controlled contract uses `v-model:value`, `value`, `update:value`, and `valueChange`.

## Demo

<FormComponentDemo example="select" locale="en" />

## Multiple Selection And Confirm

Multiple selection confirms draft changes by default. Set `:confirmable="false"` to apply selections immediately.

## Search And Dropdown

Use `filterable` to type and filter local options directly in the Select field; the open panel does not render a second search input. Use `mode="dropdown"` for dropdown presentation.

## Wrapper Boundary

Grouped options, remote search, and async paging belong in secondary wrappers. Business components should wrap `VSelect` to create `UserSelect`, `DepartmentSelect`, `CitySelect`, and `ProductSelect`.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number \| Array<string \| number>` | `undefined` | Selected value |
| `options` | `VSelectOption[]` | `[]` | Options |
| `mode` | `'picker' \| 'dropdown'` | `'picker'` | Presentation mode |
| `placeholder` | `string` | `'请选择'` | Placeholder text |
| `disabled` | `boolean` | `false` | Disabled state |
| `readonly` | `boolean` | `false` | Readonly state |
| `clearable` | `boolean` | `false` | Shows a clear action |
| `multiple` | `boolean` | `false` | Enables multiple selection |
| `max` | `number` | `undefined` | Maximum selected count |
| `filterable` | `boolean` | `false` | Filters local options directly from the Select field |
| `confirmable` | `boolean` | `true` | Confirms draft changes in multiple mode |
| `filterOption` | `(query, option) => boolean` | `undefined` | Custom local filter |
| `loading` | `boolean` | `false` | Loading display |
| `emptyText` | `string` | `'暂无数据'` | Empty state text |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string \| number \| Array<string \| number> \| undefined` | Selected value updated |
| `valueChange` | `string \| number \| Array<string \| number> \| undefined` | Selected value changed |
| `clear` | `void` | Cleared |
| `open` | `void` | Opened |
| `close` | `void` | Closed |
| `confirm` | `Array<string \| number>` | Multiple selection confirmed |
| `cancel` | `void` | Cancelled |
| `search` | `string` | Search input changed |
| `limit` | `{ max: number }` | Maximum selected count exceeded |
