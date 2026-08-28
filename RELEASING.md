# Releasing

Varo uses `repoctl` with pnpm native change intents and fixed package versioning.

## Release policy

- Seven user-facing `@varo/*` packages ship as one fixed version; internal implementation packages are bundled and remain private.
- Stable releases are prepared from `main`.
- The initial `1.0.0` publish is authenticated locally because npm trusted publishing cannot be configured before the package pages exist.
- After that bootstrap publish, `.github/workflows/release.yml` publishes through GitHub Actions OIDC without `NPM_TOKEN`.
- Documentation deploys to GitHub Pages through `.github/workflows/docs.yml`.

## Release commands

```bash
pnpm change
pnpm change status
pnpm exec repo release stable prepare
pnpm exec repo release stable publish
```

`repo release stable prepare` is intended for CI and creates or updates the release pull request. `repo release stable publish` publishes already-versioned packages from `main`.

## Initial local publish

### 1. Authenticate

```bash
npm login
npm whoami
```

### 2. Verify the repository

```bash
pnpm install --frozen-lockfile
pnpm exec repo doctor --strict
pnpm exec repo check --full
```

### 3. Record and apply the release intent

The initial intent uses a `major` bump. Because the public packages are a fixed group, they all resolve to `1.0.0`.

```bash
pnpm change --bump major --summary "Initial stable release of the Varo cross-runtime component system." @varo-ui/ai @varo-ui/cli @varo-ui/h5 @varo-ui/headless @varo-ui/theme @varo-ui/weapp
pnpm change status
pnpm version -r --no-git-checks
```

### 4. Review package contents

```bash
pnpm publish -r --dry-run --no-git-checks
```

### 5. Bootstrap npm package pages

The first local publish intentionally omits provenance because npm trusted publishers do not exist yet:

```bash
pnpm publish -r --access public --report-summary --no-git-checks
```

After npm reports every package at `1.0.0`, commit the version metadata and push `main`.

## Enable npm trusted publishing

Configure every package under `Settings -> Trusted publishing`:

- Provider: `GitHub Actions`
- Owner: `daguanren21`
- Repository: `Varo`
- Workflow file: `release.yml`
- Environment: empty

Packages:

- `@varo-ui/ai`
- `@varo-ui/cli`
- `@varo-ui/headless`
- `@varo-ui/theme`
- `@varo-ui/h5`
- `@varo-ui/weapp`

Private bundled implementation packages:

- `@varo/hooks`
- `@varo/primitives-h5`
- `@varo/primitives-weapp`
- `@varo/shared`
- `@varo/utils`

The workflow grants `id-token: write` and enables npm provenance. It does not require a publish token.

## Subsequent CI releases

1. Add a pnpm change intent and merge it to `main`.
2. The release workflow creates or updates the release pull request.
3. Merge that release pull request.
4. The next `main` run publishes unpublished versions with npm OIDC and creates package tags and GitHub Releases.

Manual recovery is available through the workflow's `publish-unpublished` mode.

## Documentation deployment

The Pages workflow builds VitePress with `DOCS_BASE=/Varo/` and deploys:

```text
https://daguanren21.github.io/Varo/
```
