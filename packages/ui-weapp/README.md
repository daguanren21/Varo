# @varo-ui/weapp

Tree-shakeable component wrappers for Varo mini-program projects. The supported build chain is `weapp-vite@6.23.0` with `wevu@6.23.0`.

## Install

```bash
pnpm add @varo-ui/weapp wevu@6.23.0
```

## Usage

```ts
import { VButton } from '@varo-ui/weapp'
import '@varo-ui/weapp/style.css'
```

Target render primitives are available from `@varo-ui/weapp/primitives`. For editable native SFC source, use `@varo-ui/cli` with `--target weapp-vite`.

## Editable Registry source resolver

`VaroResolver` discovers only Varo SFCs already copied into the consumer project and lets
`weapp-vite` compile them on demand. Unreferenced candidates stay out of production entries.

```ts
import { VaroResolver } from '@varo-ui/weapp/resolver'
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  weapp: {
    autoImportComponents: {
      resolvers: [VaroResolver()],
      typedComponents: true,
      vueComponents: true,
    },
  },
})
```

The default source directory is `src/components/ui`. Both `<VButton>` and `<v-button>` resolve
to copied files named `VButton.vue`, `vButton.vue`, or `v-button.vue`. The resolver does not
install components; continue using `@varo-ui/cli --target weapp-vite` to copy editable source.

`root` defaults to `process.cwd()`. Pass `VaroResolver({ root: import.meta.dirname })` only when
the Vite process runs from a different directory than the consumer application.

[Component documentation](https://daguanren21.github.io/Varo/components/) · [Repository](https://github.com/daguanren21/Varo)
