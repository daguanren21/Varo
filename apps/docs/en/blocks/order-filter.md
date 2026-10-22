# Order Filter Block

`Order Filter` is an installable dual-target order filter with multi-status selection, minimum/maximum amount, range validation, active-condition count, result feedback, reset, and apply events.

## Registry

- Targets: `h5`, `weapp`
- Dependencies: `components/button`, `components/checkbox`, `components/input-number`, `components/tag`, `utils/cn`
- File: `src/components/blocks/order-filter.vue`

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/order-filter
pnpm dlx @varo-ui/cli add --target h5 blocks/order-filter
```

## Boundary

The Block maintains local filter state. The business wrapper handles `apply` / `reset`, remote dictionaries, pagination, API parameter mapping and result requests.

## Related

- [Build Your Own Block](/en/blocks/build-your-own)
