# Releasing

## Package release flow

This repo uses `changesets` for versioning and GitHub Actions OIDC trusted publishing for CI releases.

### First release

The first publish of each scoped public package is done manually after `npm login`.

1. Authenticate locally:

```bash
npm login
```

2. Install and verify:

```bash
pnpm install
pnpm test
pnpm build
```

3. Create a changeset:

```bash
pnpm changeset
```

4. Version packages locally:

```bash
pnpm version-packages
```

5. Publish the packages to npm:

```bash
pnpm release
```

All public packages already set `publishConfig.access` to `public`, so this works for scoped packages without adding `--access public` on every command.

### Enable npm trusted publishing

After the first successful publish, configure trusted publishing in npm for each package:

1. Open the package page on npm.
2. Go to `Settings -> Trusted publishing`.
3. Choose `GitHub Actions`.
4. Use:
   - Owner: `daguanren21`
   - Repository: `Varo`
   - Workflow file: `release.yml`
   - Environment: leave empty unless you later add one to the workflow

Do this for every public package published from this monorepo:

- `@varo/hooks`
- `@varo/primitives-core`
- `@varo/primitives-h5`
- `@varo/primitives-weapp`
- `@varo/shared`
- `@varo/theme`
- `@varo/ui-h5`
- `@varo/ui-weapp`
- `@varo/utils`

### CI release flow

Once npm trusted publishing is configured, merges to `main` use `.github/workflows/release.yml`.

The workflow does two things:

1. If there are pending changesets, it creates or updates a `Version Packages` pull request.
2. After that release PR is merged to `main`, the workflow publishes with GitHub OIDC and does not require `NPM_TOKEN`.

### Useful commands

```bash
pnpm changeset
pnpm version-packages
pnpm release
```
