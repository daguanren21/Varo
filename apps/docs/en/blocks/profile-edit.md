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

The Block composes a local form and emits typed events. The application supplies `initialProfile` and `cities`, handles `submit` / `cancel`, and provides APIs, authentication, remote city dictionaries and persistence policy.

## Related

- [Build Your Own Block](/en/blocks/build-your-own)
