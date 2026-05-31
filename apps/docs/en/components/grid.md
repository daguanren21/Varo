# Grid

## Basic Usage

```vue
<template>
  <VGrid>
    <VGridItem icon="◎" text="Text" />
    <VGridItem icon="◎" text="Logistics" />
    <VGridItem icon="◎" text="Favorites" />
    <VGridItem icon="◎" text="Settings" />
  </VGrid>
</template>
```

## Columns and Gutter

```vue
<template>
  <VGrid :column-num="3" :gutter="8">
    <VGridItem text="Entry" />
    <VGridItem text="Entry" />
    <VGridItem text="Entry" />
  </VGrid>
</template>
```

## Badge and Clickable

```vue
<template>
  <VGrid clickable>
    <VGridItem icon="◎" text="Messages" badge="3" />
    <VGridItem icon="◎" text="Notice" dot />
  </VGrid>
</template>
```

## Cross-platform Preview

<PlatformTabsDemo example="grid" locale="en" />

## Grid Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `columnNum` | `number \| string` | `4` | Column count |
| `gutter` | `number \| string` | `undefined` | Grid gutter |
| `border` | `boolean` | `true` | Border marker |
| `square` | `boolean` | `false` | Square item marker |
| `center` | `boolean` | `true` | Center content |
| `clickable` | `boolean` | `false` | Clickable state |
| `direction` | `'vertical' \| 'horizontal'` | `'vertical'` | Content direction |

## GridItem Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `text` | `string` | `undefined` | Text |
| `icon` | `string` | `undefined` | Icon content |
| `badge` | `number \| string` | `undefined` | Badge content |
| `dot` | `boolean` | `false` | Red dot |
| `url` | `string` | `undefined` | Link URL |
| `to` | `string` | `undefined` | Route link |
| `span` | `number \| string` | `1` | Column span |
| `clickable` | `boolean \| undefined` | `undefined` | Override parent clickable state |
