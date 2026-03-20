# Theme

Varo keeps theme ownership inside `@varo/theme` so wrappers can remain token-driven.

```ts
import { createTheme, VaroConfigProvider } from '@varo/theme'
```

## Principles

- palette, semantic, and component tokens stay layered
- wrappers consume tokens instead of hard-coding brand styles
- the same theme package can evolve into a richer color engine later