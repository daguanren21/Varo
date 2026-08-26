# Order Filter Block

`Order Filter` is an installable dual-target order filter with multi-status selection, minimum/maximum amount, range validation, active-condition count, result feedback, reset, and apply events.

## Registry

- Targets: `h5`, `weapp-vite`
- Dependencies: `components/button`, `components/checkbox`, `components/input-number`, `components/tag`, `utils/cn`
- File: `src/components/blocks/order-filter.vue`

```bash
pnpm dlx @varo/cli add --target weapp-vite blocks/order-filter
pnpm dlx @varo/cli add --target h5 blocks/order-filter
```

## Boundary

The Block only owns local filter state. Remote dictionaries, pagination, API parameter mapping, and result requests belong in business wrappers; products handle `apply` / `reset`.

## Related

- [Build Your Own Block](/en/blocks/build-your-own)
