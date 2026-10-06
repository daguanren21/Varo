# Primitives

`@varo-ui/headless` provides platform-neutral unstyled state and event contracts. Composable Parts and interactive examples in these docs are H5-only. Native consumers use real Wevu SFCs or headless, not an equivalent Vue Parts renderer.

## Install

```bash
# H5
pnpm add @varo-ui/headless @varo-ui/h5

# Native SFCs (require a matching weapp-vite compiler)
pnpm add wevu @varo-ui/headless @varo-ui/weapp
```

::: info Mini Program setup
See [Wevu Registry](/en/guide/shadcn-mode) for global styles and Tailwind configuration.
:::

## Runtime

| Package                                          | Responsibility                                  |
| ------------------------------------------------ | ----------------------------------------------- |
| `@varo-ui/headless`                              | Platform-neutral state and events               |
| `@varo-ui/h5/primitives`                         | DOM, keyboard, and ARIA                         |
| `@varo-ui/weapp` / `@varo-ui/weapp/components/*` | Native Wevu SFC source for platform compilation |

Headless exports no DOM scroll locking or browser focus logic; H5 owns those effects. All Parts tables describe H5 APIs. Native demo tabs show target source and support evidence, not a live Vue mini program or device proof. See [install profiles](/en/guide/installation#install-profiles-and-support-boundaries) for exact support.

## Catalog

<PrimitiveCatalog locale="en" />
