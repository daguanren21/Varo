# Cell

## Demo

<PlatformTabsDemo example="cell" locale="en" />

Cell and CellGroup ship their layout, group borders, row separators, and typography with the component; no demo-page CSS is needed. H5 source imports the installed style closure. Native apps load the installed `src/styles/*.css` through application-level `weapp.styles`, with `varo.css` first.

Default rows have a minimum height of 54px; `size="large"` increases it to 68px. `center` controls vertical alignment and `descTextAlign` aligns the description. Colors, borders, and shadows use `--varo-ui-*` theme variables; `roundRadius` rounds the current row.

## Basic Usage

```vue
<template>
  <VCell title="Title" desc="Description" />
  <VCell title="Title" sub-title="Subtitle" desc="Right content" />
</template>
```

## Icon And Link

```vue
<template>
  <VCell title="With icon" icon="◎" desc="Content" />
  <VCell title="Link cell" desc="Details" is-link />
  <VCell title="Route link" desc="View" to="/profile" />
</template>
```

## Group

```vue
<template>
  <VCellGroup title="Account" desc="Profile">
    <VCell title="Nickname" sub-title="Public display" desc="Varo" />
    <VCell title="Address" desc="Configure" is-link />
  </VCellGroup>
</template>
```

## Alignment And Size

```vue
<template>
  <VCell title="Centered" desc="Content" center />
  <VCell title="Large" desc="Content" size="large" />
  <VCell title="Left desc" desc="Longer description" desc-text-align="left" />
  <VCell title="Fixed title width" desc="Content" title-width="120px" />
</template>
```

## Radius And Slots

```vue
<template>
  <VCellGroup title="Custom">
    <VCell title="Radius" desc="16px" round-radius="16px" />
    <VCell>
      <template #icon>
        i
      </template>
      <template #title>
        Custom title
      </template>
      <template #desc>
        Custom desc
      </template>
      <template #link>
        →
      </template>
    </VCell>
  </VCellGroup>
</template>
```

## Cell Props

| Prop            | Type                   | Default     | Description                                |
| --------------- | ---------------------- | ----------- | ------------------------------------------ |
| `title`         | `string`               | `undefined` | Left title                                 |
| `subTitle`      | `string`               | `undefined` | Subtitle below title                       |
| `desc`          | `string`               | `undefined` | Description on the right                   |
| `descTextAlign` | `'left' \| 'right'`    | `'right'`   | Alignment of the description on the right  |
| `icon`          | `string`               | `undefined` | Left icon content                          |
| `isLink`        | `boolean`              | `false`     | Show the right arrow and clickable state   |
| `to`            | `string`               | `undefined` | Link href; renders an anchor when provided |
| `roundRadius`   | `string`               | `undefined` | Custom radius CSS variable                 |
| `center`        | `boolean`              | `false`     | Vertically center content                  |
| `size`          | `'default' \| 'large'` | `'default'` | Cell size                                  |
| `clickable`     | `boolean`              | `false`     | Enable clickable state                     |
| `titleWidth`    | `number \| string`     | `undefined` | Title width                                |

## CellGroup Props

| Prop    | Type     | Default     | Description                           |
| ------- | -------- | ----------- | ------------------------------------- |
| `title` | `string` | `undefined` | Group title                           |
| `desc`  | `string` | `undefined` | Description on the right of the group |

## Events

The DOM event types below apply only to H5. Native components use host click events; see the corresponding SFC for payloads. Browser keyboard events and DOM APIs do not apply.

| Event   | Payload                       | Description                                          |
| ------- | ----------------------------- | ---------------------------------------------------- |
| `click` | `MouseEvent \| KeyboardEvent` | Fired when the cell is clicked or keyboard-activated |

## Slots

| Slot       | Description                                   |
| ---------- | --------------------------------------------- |
| `default`  | Custom cell main content or CellGroup content |
| `title`    | Custom title                                  |
| `subTitle` | Custom subtitle                               |
| `desc`     | Custom right description                      |
| `icon`     | Custom left icon                              |
| `link`     | Custom right arrow                            |

## Data Attributes

| Attribute         | Description           |
| ----------------- | --------------------- |
| `data-size`       | Current size          |
| `data-center`     | Center state          |
| `data-clickable`  | Clickable state       |
| `data-link`       | Link state            |
| `data-desc-align` | Description alignment |
