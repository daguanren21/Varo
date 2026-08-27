# Mini-program Business Blocks

This page is not a crowded gallery. It collects reusable business blocks with real mobile needs, component dependencies, H5 source, and mini-program source. Copy a block, replace fields, APIs, and local styles, then promote it inside your product codebase.

<MiniProgramBlocksGallery locale="en" />

## Mini-program Build Chain

- `weapp-vite@6.23.0` handles mini-program builds, component JSON, complex list keys, and generated types
- `wevu@6.23.0` is the mini-program Vue runtime peer; `@varo/ui-weapp` and `@varo/primitives-weapp` keep the same peer constraint
- `weapp-tailwindcss@^5.3.6` plugs into the `weapp-vite` chain for class translation; current mini-program output removes unsupported interaction pseudo-classes, so components use native `hover-class` for pressed feedback
- For internal design systems, build upward from `@varo/primitives-*`, then promote blocks into business templates

## Related Docs

- [Button Docs](/en/components/button)
- [Input Docs](/en/components/input)
- [Dialog Docs](/en/components/dialog)
- [Color System](/en/guide/colors)
- [Theme](/en/guide/theme)
