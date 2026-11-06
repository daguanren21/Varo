# weapp-vite 7.8.0 slot-owner reproduction

Clone the standalone reproduction branch:

```sh
git clone --depth 1 --branch repro/weapp-vite-780-slot-owner https://github.com/daguanren21/Varo.git weapp-vite-slot-owner-repro
cd weapp-vite-slot-owner-repro
```

Requirements: Node 24.22.1 and pnpm 11.24.0 (the package engine also lists supported Node alternatives).

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm verify
```

The project uses only published `weapp-vite@7.8.0` and `wevu@7.8.0`, with no patches or Varo dependencies. Both `nativeSlotContext` and `scopedSlotsRequireProps` are enabled.

The build succeeds, but `verify` fails: the generated app-shell and scriptless Vue layout WXML bind `__weapp_vite_nativeSlotParent`, while their JavaScript registers only properties and neither native slot-parent nor declaration handler.

`verify.mjs` executes trusted generated registrations in a Node VM after app/page startup. This is an artifact/registration contract test, not a WeChat IDE or device test.
