# @varo-ui/cli

CLI for installing editable, target-specific Varo components and blocks from the Registry.

## Usage

```bash
pnpm dlx @varo-ui/cli add --target h5 button input card
pnpm dlx @varo-ui/cli add --target weapp-vite button input card
```

The CLI copies source into your project. It does not hide rendering behind a cross-platform runtime. Existing files are preserved unless `--force` is provided.

[Installation guide](https://daguanren21.github.io/Varo/guide/installation) · [Repository](https://github.com/daguanren21/Varo)
