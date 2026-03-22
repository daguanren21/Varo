# Button

`VButton` is the official H5 wrapper built on top of the `ButtonRoot` primitive.

## When to use

- Trigger page-level or local actions
- Submit, confirm, cancel, or secondary actions
- Keep size, state, and theme tokens consistent across the app

## Anatomy

<div class="component-anatomy">
  <strong>Button is centered around one interactive root node.</strong>
  <ul>
    <li><code>ButtonRoot</code> owns press, disabled, loading, and semantic state.</li>
    <li><code>VButton</code> adds default classes, sizes, and visual variants.</li>
  </ul>
</div>

## Cross-platform Example and Preview

<PlatformTabsDemo example="button" locale="en" />

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `variant` | `'solid' \| 'outline' \| 'ghost'` | `'solid'` | Visual button variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `loading` | `boolean` | `false` | Locks interaction while loading |
| `disabled` | `boolean` | `false` | Disables the button |

## Data Attributes

| Attribute | Description |
| --- | --- |
| `data-variant` | Active visual variant |
| `data-size` | Active size scale |
| `data-loading` | Loading state flag |
| `data-disabled` | Disabled state flag |

## Behavior

- `loading` and `disabled` both switch the button into a non-interactive state
- official wrappers compute classes from theme tokens instead of hard-coding business styles
- teams that only need interaction contracts can drop down to primitives without taking the official skin

## Composition Guidance

<div class="component-note">
  <strong>Recommended composition</strong>
  <ul>
    <li>Product apps should consume <code>@varo/ui-h5</code> or <code>@varo/ui-weapp</code> directly.</li>
    <li>Internal design systems can reuse <code>ButtonRoot</code> behavior and plug in their own visual layer.</li>
    <li>If loading visuals need to change, prefer adjusting tokens or wrapper classes instead of changing interaction state logic.</li>
  </ul>
</div>

## Related Docs

- [Input](/en/components/input)
- [Dialog](/en/components/dialog)
- [Theme](/en/guide/theme)
- [Cross-platform Demo](/en/examples/)
