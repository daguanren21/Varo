# Primitives

Cross-target unstyled interaction contracts: `@varo-ui/headless` owns state; target primitives own rendering.

## Install

```bash
# H5
pnpm add @varo-ui/headless @varo-ui/h5

# Mini Program
pnpm add @varo-ui/headless @varo-ui/weapp
```

::: info Mini Program setup
See [Wevu Registry](/en/guide/shadcn-mode) for global styles and Tailwind configuration.
:::

## Runtime

| Package                     | Responsibility                    |
| --------------------------- | --------------------------------- |
| `@varo-ui/headless`         | Platform-neutral state and events |
| `@varo-ui/h5/primitives`    | DOM, keyboard, and ARIA           |
| `@varo-ui/weapp/primitives` | WXML, touch, and native events    |
