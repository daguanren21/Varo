# Primitives

`@varo-ui/headless` provides platform-neutral state and event contracts without styles. The composable Parts and interactive examples in these docs are available only on H5. Native consumers use Wevu SFCs or headless; there is no equivalent Vue Parts renderer.

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

H5 handles DOM scroll locking and browser focus; headless does not export this logic. All Parts tables describe H5 APIs. Native tabs show target source and support evidence. Any browser previews they provide are not live Vue mini programs or proof of device support. See [install profiles](/en/guide/installation#install-profiles-and-support-boundaries) for the exact support scope.

## Catalog

<PrimitiveCatalog locale="en" />
