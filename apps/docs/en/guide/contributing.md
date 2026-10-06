# Contributing

## Recommended implementation order

1. Define platform-neutral state and events in `packages/primitives-core`; `packages/shared` owns the single reactive interface, without Vue, Wevu, or DOM dependencies
2. Author H5 renderers and real native Wevu SFCs in `registry/components/**/*`; DOM, focus, keyboard behavior, and scroll locking belong only to H5
3. Author themes in `registry/themes/**/*`; `themes/base` contains only tokens and foundation rules, ordinary component CSS has one manifest owner, and optional `themes/agent` owns Agent styles
4. Run `pnpm sync:registry` to generate `packages/ui-h5/src` renderers, `packages/ui-weapp/native`, playground installs, and docs Agent source/support catalogs; do not hand-edit projections
5. Check drift and boundaries with `pnpm check:generated` and `pnpm check:architecture`, then add behavior verification, bilingual docs, and real runtime evidence

H5 unstyled Parts come from `@varo-ui/h5/primitives`. The native `@varo-ui/weapp` root and `/components/*` provide SFCs for compilation, not a second Vue mini-program renderer. Configure native global CSS through [Wevu Registry](/en/guide/shadcn-mode).

Manifest `targets` / `files.target` use renderer families `h5|weapp`. Additional platform admission uses exact `platforms` entries and checks every transitive dependency. The six new profiles remain experimental. Record compiler artifacts, browser demos, and device verification separately; none substitutes for another.
