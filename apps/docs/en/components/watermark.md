# Watermark

`VWatermark` places an inaccessible, non-interactive repeated text layer over container content. The overlay never intercepts pointer input, making it suitable for document previews, approvals, and sensitive data.

A watermark is a visual marker, not a substitute for access control, encryption, or tamper resistance.

## Demo

<WatermarkDemo locale="en" />

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

The default slot carries the protected content. H5 accepts consumer styles through `class`; the mini-program Registry SFC uses `className`.
