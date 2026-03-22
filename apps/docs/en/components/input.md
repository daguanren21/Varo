# Input

`VInput` is the official H5 wrapper for text input, built on top of the `InputRoot` primitive and shared field control logic.

## When to use

- Form text input
- Controlled or uncontrolled field flows
- Unified invalid, disabled, size, and theme token behavior

## Anatomy

<div class="component-anatomy">
  <strong>Input combines an input root with shared field state.</strong>
  <ul>
    <li><code>InputRoot</code> handles value sync, invalid state, and DOM writeback.</li>
    <li><code>useFieldRoot</code> centralizes disabled and invalid field semantics.</li>
    <li><code>VInput</code> adds size mapping, theme classes, and platform wrapper behavior.</li>
  </ul>
</div>

## Cross-platform Example and Preview

<PlatformTabsDemo example="input" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| undefined` | `undefined` | Controlled value |
| `defaultValue` | `string` | `''` | Uncontrolled initial value |
| `placeholder` | `string \| undefined` | `undefined` | Placeholder text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Input size token |
| `invalid` | `boolean` | `false` | Invalid state |
| `disabled` | `boolean` | `false` | Disabled state |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `update:value` | `string` | Sync controlled value |
| `valueChange` | `string` | Fires whenever the value changes |

## Data Attributes

| Attribute | Description |
| --- | --- |
| `data-invalid` | Invalid field flag |
| `data-disabled` | Disabled field flag |
| `aria-invalid` | Accessibility state for invalid input |

## Behavior

- controlled mode writes the DOM value back to the current prop immediately after input, preventing visual drift
- `size` only affects theme class generation and is not forwarded as a raw DOM `input` attribute
- H5 and mini-program runtimes differ in event details, but the exposed value synchronization contract stays aligned

## Composition Guidance

<div class="component-note">
  <strong>Recommended composition</strong>
  <ul>
    <li>Prefer controlled mode when form containers own validation and submit state.</li>
    <li>Use uncontrolled mode for lightweight search and filter fields.</li>
    <li>If you need prefix, suffix, clear buttons, or more advanced UI, keep building on primitives.</li>
  </ul>
</div>

## Accessibility and State

- invalid state is mirrored into `aria-invalid`
- disabled state blocks further interaction
- theming should only change visuals, not field semantics

## Related Docs

- [Button](/en/components/button)
- [Dialog](/en/components/dialog)
- [Internationalization](/en/guide/i18n)
- [Cross-platform Demo](/en/examples/)
