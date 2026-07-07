# Varo Base Kit And VSelect Design

## Summary

Varo should expand its shadcn-style base from a narrow first path into a practical Base Kit for business applications. The Base Kit is not a traditional black-box component library. It is the stable source-code foundation that users copy, inspect, modify, and use to build their own business components and component libraries across H5, mini-program, and App outputs through `weapp-vite`.

The first Base Kit milestone should cover business forms, selection, popup feedback, and basic layout. `VSelect` is included in the first milestone because business forms are not usable without a first-class select component.

## Goals

- Make `weapp-vite` the single multi-platform base target for H5, mini-program, and App output.
- Provide a Base Kit that is broad enough for real forms and common business screens.
- Keep Base Kit components low-level, composable, and easy to secondarily wrap.
- Make `VSelect` a stable selection primitive with single select, multiple select, picker mode, dropdown mode, local search, and confirmation control.
- Keep business-specific behavior such as remote search, grouped data, paging, user selection, department selection, city selection, and product selection outside the Base Kit.
- Preserve Varo's registry-first direction: copied source is the primary experience, runtime packages provide shared foundations.

## Non-Goals

- Do not build a full enterprise component library in the Base Kit.
- Do not put domain data loading, remote query protocols, or async pagination into `VSelect`.
- Do not split component authoring into separate H5, mini-program, and App component trees unless a real platform adapter is required.
- Do not add Uni-app, Taro, Capacitor, React Native, or other runtime targets in this milestone.

## User Stories

1. As a product engineer, I can scaffold a `weapp-vite` Varo base and use the same base for H5, mini-program, and App outputs.
2. As a form builder, I can use input, select, checkbox, radio, switch, picker, date picker, popup, dialog, toast, and loading components without immediately creating custom primitives.
3. As a design-system maintainer, I can copy Base Kit component source and wrap it into a company-owned component library.
4. As a business engineer, I can build `UserSelect`, `DepartmentSelect`, `CitySelect`, or `ProductSelect` on top of `VSelect` without fighting built-in domain assumptions.
5. As a maintainer, I can test Base Kit behavior through shared contracts and registry source instead of relying only on demo pages.

## Product Layers

Varo should use these product layers:

```text
Varo Base
  weapp-vite + Vue + TypeScript + weapp-tailwindcss + theme + aliases

Varo Base Kit
  low-level source components copied from the registry

Varo Runtime Packages
  @varo/theme
  @varo/primitives-core
  @varo/primitives-weapp
  @varo/shared
  @varo/ui-weapp

Varo Components
  official higher-level components built on top of Base Kit

Business Component Libraries
  UserSelect, DepartmentSelect, CitySelect, ProductSelect, domain forms, domain cards

Blocks
  production-shaped screens and sections built from Base Kit and business components
```

The Base Kit owns general interaction contracts. Higher layers own richer presets, data loading, domain schemas, and business-specific rendering.

## Base Kit Phase 1 Scope

The first practical Base Kit should include:

```text
Button
Cell
Input
Textarea
InputNumber
Form
Checkbox
Radio
Switch
VSelect
Picker
Cascader
DatePicker
Overlay
Popup
Dialog
Toast
Loading
```

This is intentionally larger than the earlier seven-component path. The earlier path is still useful as an implementation sequence, but the product milestone should be framed around this broader set because it supports real business forms and basic screens.

## VSelect Scope

`VSelect` is the Base Kit selection primitive. The registry item name is `select`; the exported component name is `VSelect`.

### Supported In Base Kit

- Single select
- Multiple select
- `picker` mode
- `dropdown` mode
- Local search
- Disabled component and disabled options
- Readonly state
- Clearable value
- Confirmable multiple selection
- Maximum selected count
- Empty state
- Loading display state
- Slots and events for secondary wrapping

### Excluded From Base Kit

- Grouped options
- Remote search ownership
- Async paging
- Infinite option loading
- User, department, city, product, or organization data models
- Permission-aware option filtering
- Tag collapse or complex selected-value layout

Those features belong in higher-level components built on top of `VSelect`.

## VSelect API

```ts
export type VSelectValue = string | number

export type VSelectMode = 'picker' | 'dropdown'

export interface VSelectOption {
  label: string
  value: VSelectValue
  disabled?: boolean
}

export interface VSelectProps {
  modelValue?: VSelectValue | VSelectValue[]
  options: VSelectOption[]
  mode?: VSelectMode
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  multiple?: boolean
  max?: number
  searchable?: boolean
  confirmable?: boolean
  filterOption?: (query: string, option: VSelectOption) => boolean
  loading?: boolean
  emptyText?: string
}
```

Default values:

```ts
mode = 'picker'
multiple = false
confirmable = true
searchable = false
emptyText = '暂无数据'
```

`confirmable` only affects `multiple=true`. Single select always commits immediately after selection.

## VSelect Behavior

### Single Select

- `modelValue` is `string | number | undefined`.
- Selecting an enabled option emits `update:modelValue`.
- In `picker` mode, the popup closes after selection.
- In `dropdown` mode, the dropdown closes after selection.
- Clearing emits `undefined`.

### Multiple Select

- `modelValue` is `Array<string | number>`.
- If `confirmable=true`, `VSelect` maintains an internal draft selection while open.
- Confirm emits `update:modelValue` with the draft value.
- Cancel or close without confirm discards the draft.
- If `confirmable=false`, every toggle emits `update:modelValue` immediately.
- If `max` is set, selecting beyond `max` is blocked and should emit a lightweight limit event.

### Value Display

The trigger display should remain layout-safe across H5, mini-program, and App outputs:

```text
0 selected: placeholder
1-2 selected: labels joined with comma
3+ selected: 已选 n 项
```

Business components can replace this with slots when they need tags, avatars, or custom summaries.

### Search

`searchable=true` enables local search in the component.

- Default filter checks `option.label`.
- `filterOption` can override the local filter.
- Search does not remove selected values from the current selection state.
- Disabled options can remain visible but cannot be selected.
- Base Kit may emit a search event as an extension point, but it does not own request timing, debouncing, remote results, or paging.

### Modes

`picker` is the default mode for every platform because Varo is mobile and `weapp-vite` first.

```vue
<VSelect v-model="city" :options="cities" />
```

`dropdown` is an explicit enhancement for H5 and wide-screen cases:

```vue
<VSelect v-model="city" mode="dropdown" :options="cities" />
```

Both modes should reuse the same selection state, filtering, events, and value formatting. Only the presentation layer changes.

## Composition Model

`VSelect` should be implemented as composition over lower-level Base Kit parts:

```text
VSelect
  trigger: VCell or input-like field
  selection state: shared select contract helper
  picker presentation: VPopup + option list
  dropdown presentation: anchored panel + option list
  form integration: VForm field contract
```

The shared selection contract should be platform-neutral. Platform-specific files should be limited to rendering constraints and event details.

## Secondary Wrapping Examples

Business and official higher-level components should wrap `VSelect` instead of extending its base scope:

```vue
<UserSelect v-model="userId" :department-id="departmentId" />
<DepartmentSelect v-model="departmentId" searchable />
<CitySelect v-model="cityCode" />
<ProductSelect v-model="productIds" multiple />
```

Internally those components can own remote loading, grouping, permission filters, and custom option rendering:

```vue
<VSelect
  v-model="value"
  searchable
  :options="options"
  :loading="loading"
  @search="handleSearch"
/>
```

## Registry And Documentation Requirements

- Registry item name: `select`
- Exported component name: `VSelect`
- Docs route: `/components/select`
- Registry docs should describe `picker` as the default.
- Docs should explicitly state that grouped options and remote search are secondary wrapping patterns.
- Examples should include single select, multiple select, local search, confirmable multiple select, and dropdown mode.
- Blocks should use `VSelect` for realistic forms such as profile edit, order filter, address form, and settings screens.

## Testing Strategy

Add deterministic coverage before broad component expansion:

- Select contract helper tests for single value, multiple value, draft confirmation, max limit, clearing, and local filtering.
- Component tests for emitted events and rendered selected text.
- Registry validation tests for the `select` entry.
- Docs tests that ensure Base Kit Phase 1 includes `VSelect` and that `picker` is documented as the default.
- Build and typecheck coverage through the existing monorepo commands.

## Implementation Order

1. Update docs and registry metadata to describe Base Kit Phase 1.
2. Add platform-neutral select contract helpers in a shared package.
3. Add `VSelect` registry source and official runtime wrapper.
4. Add tests for selection contracts and component behavior.
5. Add docs examples for single, multiple, search, confirmable, and dropdown modes.
6. Use `VSelect` in the first form-oriented blocks.

This order keeps the public contract clear before adding higher-level components.
