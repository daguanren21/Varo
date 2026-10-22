# Watermark

`VWatermark` repeats text over the content of a container. The overlay is noninteractive, hidden from assistive technology, and does not intercept pointer input. Use it for document previews, approval results, and sensitive data displays.

A watermark is a visual marker, not a substitute for access control, encryption, or tamper resistance.

## Demo

<ComponentPlatformDemo component="watermark" locale="en">
  <WatermarkDemo locale="en" />
</ComponentPlatformDemo>

## Props

| Prop         | Type               | Default     | Description                              |
| ------------ | ------------------ | ----------- | ---------------------------------------- |
| `content`    | `string`           | `'Varo'`    | Repeated text; empty content hides it    |
| `color`      | `string`           | `'#172033'` | Text color                               |
| `opacity`    | `number`           | `0.12`      | Opacity clamped to 0–1                   |
| `rotate`     | `number`           | `-22`       | Rotation in degrees                      |
| `fontSize`   | `number`           | `14`        | Font size in px, minimum 1               |
| `fontWeight` | `number \| string` | `500`       | Font weight                              |
| `gapX`       | `number`           | `160`       | Horizontal tile width in px, minimum 24  |
| `gapY`       | `number`           | `96`        | Vertical tile height in px, minimum 24   |
| `offsetX`    | `number`           | `0`         | Horizontal px phase normalized by `gapX` |
| `offsetY`    | `number`           | `0`         | Vertical px phase normalized by `gapY`   |
| `zIndex`     | `number`           | `9`         | Overlay stacking level in the container  |

Rows stretch evenly across tall containers, preserving watermark coverage from top to bottom while using `gapY` as the minimum tile height.

Place the content beneath the watermark in the default slot. H5 accepts custom styles through `class`; the mini-program Registry SFC uses `className`.
