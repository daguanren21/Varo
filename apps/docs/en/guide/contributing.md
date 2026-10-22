# Contributing

## Recommended implementation order

1. Define platform-neutral state and events in `packages/primitives-core`; maintain the single reactive interface in `packages/shared`, without Vue, Wevu, or DOM dependencies
2. Author H5 renderers and native Wevu SFCs in `registry/components/**/*`; only the H5 adapter handles DOM behavior, focus, keyboard interaction, and scroll locking
3. Author themes in `registry/themes/**/*`; `themes/base` contains only tokens and foundation rules, each ordinary component manifest declares its own CSS, and optional `themes/agent` contains Agent styles
4. Run `pnpm sync:registry` to generate `packages/ui-h5/src` renderers, `packages/ui-weapp/native`, playground installs, and docs Agent source and support catalogs; do not hand-edit these generated files
5. Check generated-file drift and dependency boundaries with `pnpm check:generated` and `pnpm check:architecture`, then add behavior checks, bilingual docs, and runtime evidence

H5 unstyled Parts come from `@varo-ui/h5/primitives`. The native `@varo-ui/weapp` root and `/components/*` provide SFCs for compilation, not a second Vue mini-program renderer. Configure native global CSS through [Wevu Registry](/en/guide/shadcn-mode).

Manifest `targets` / `files.target` use renderer families `h5|weapp`. Additional platforms need exact `platforms` entries and support from every transitive dependency. The six additional profiles are experimental. Record compiler artifact checks, browser demos, and device validation separately; none replaces another.
