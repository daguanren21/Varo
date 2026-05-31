# Cell

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
      <template #icon>i</template>
      <template #title>Custom title</template>
      <template #desc>Custom desc</template>
      <template #link>→</template>
    </VCell>
  </VCellGroup>
</template>
```

## Cross-Platform Demo

<PlatformTabsDemo example="cell" locale="en" />

## Cell Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `undefined` | Left title |
| `subTitle` | `string` | `undefined` | Subtitle below title |
| `desc` | `string` | `undefined` | Right description |
| `descTextAlign` | `'left' \| 'right'` | `'right'` | Right description alignment |
| `icon` | `string` | `undefined` | Left icon content |
| `isLink` | `boolean` | `false` | Show the right arrow and clickable state |
| `to` | `string` | `undefined` | Link href; renders an anchor when provided |
| `roundRadius` | `string` | `undefined` | Custom radius CSS variable |
| `center` | `boolean` | `false` | Vertically center content |
| `size` | `'default' \| 'large'` | `'default'` | Cell size |
| `clickable` | `boolean` | `false` | Enable clickable state |
| `titleWidth` | `number \| string` | `undefined` | Title width |

## CellGroup Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | `string` | `undefined` | Group title |
| `desc` | `string` | `undefined` | Group right description |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `click` | `MouseEvent \| KeyboardEvent` | Fired when the cell is clicked or keyboard-activated |

## Slots

| Slot | Description |
| --- | --- |
| `default` | Custom cell main content or CellGroup content |
| `title` | Custom title |
| `subTitle` | Custom subtitle |
| `desc` | Custom right description |
| `icon` | Custom left icon |
| `link` | Custom right arrow |

## Data Attributes

| Attribute | Description |
| --- | --- |
| `data-size` | Current size |
| `data-center` | Center state |
| `data-clickable` | Clickable state |
| `data-link` | Link state |
| `data-desc-align` | Description alignment |
