# @varo-ui/theme

Token-driven themes and providers for Varo H5 and mini-program components.

## Install

```bash
pnpm add @varo-ui/theme
```

## Usage

```ts
import { createTheme, provideVaroTheme } from '@varo-ui/theme'

const theme = createTheme({
  primary: '#3b82f6',
  success: '#16a34a',
  warning: '#d97706',
  error: '#dc2626',
  neutral: '#0f172a'
})
provideVaroTheme({ theme })
```

[Theme documentation](https://daguanren21.github.io/Varo/guide/theme) · [Repository](https://github.com/daguanren21/Varo)
