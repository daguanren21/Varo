# Profile Edit Block

`Profile Edit` is an installable dual-target profile form with name, phone, searchable city, biography, loading, cancel, and submit states.

## Registry

- Targets: `h5`, `weapp`
- Dependencies: `components/button`, `components/input`, `components/select`, `utils/cn`
- File: `src/components/blocks/profile-edit.vue`

```bash
pnpm dlx @varo-ui/cli add --target weapp blocks/profile-edit
pnpm dlx @varo-ui/cli add --target h5 blocks/profile-edit
```

## Boundary

The Block owns typed local form composition only. APIs, authentication, remote city dictionaries, and persistence policy stay in the business wrapper. Products inject `initialProfile` and `cities`, then handle `submit` / `cancel`.

## Related

- [Build Your Own Block](/en/blocks/build-your-own)
