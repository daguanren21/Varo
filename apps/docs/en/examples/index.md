# Cross-runtime Showcase

This is Varo’s public cross-runtime showcase: choose an adoption path first, then distinguish live browser interaction, a browser-rendered Weapp contract preview, and compiled evidence from WeChat DevTools. Repository playgrounds remain maintainer QA surfaces, not the public installation path.

## Choose an Adoption Path

<div class="varo-adoption-grid">
  <article>
    <span>H5 REGISTRY</span>
    <h3>H5 Product</h3>
    <code>pnpm dlx @varo-ui/cli add --target h5 components/button</code>
    <p>Installs editable Vue component source and dependencies into the product repository.</p>
  </article>
  <article>
    <span>WEAPP REGISTRY</span>
    <h3>Weapp Product</h3>
    <code>pnpm dlx @varo-ui/cli add --target weapp components/button</code>
    <p>Installs target-specific, WXML-safe Wevu SFC source and dependencies into the product repository.</p>
  </article>
  <article>
    <span>RUNTIME PACKAGE</span>
    <h3>Centralized H5 Runtime</h3>
    <code>pnpm add @varo-ui/h5</code>
    <p>Consumes the published package when coordinated upgrades are intentional.</p>
  </article>
</div>

Registry installation is the default path. Start with the [installation guide](/en/guide/installation), then generate source for the selected target.

## H5 Live & Weapp Contract Preview

The components below are directly operable. H5 runs real `@varo-ui/h5` browser components; switching target is explicitly labelled **Weapp Contract Preview** so the browser-rendered API and visual contract is not mistaken for the mini-program runtime.

<PlatformTabsDemo example="overview" locale="en" />

## Weapp DevTools Verified: Compiled Blocks {#weapp-devtools-evidence}

The images below were captured through WeChat DevTools automation from Block pages built by `weapp-vite`. The evidence snapshot is dated **2026-08-28**; inspect the [capture script](https://github.com/daguanren21/Varo/blob/main/apps/playground-weapp/e2e/capture-blocks.mjs) and a [representative original image](../../blocks/login-form.png). Every card also links directly to its original image.

Selecting H5 changes the install command and usage code only. When the repository has no published H5 image for that Block, the card continues to identify the image as **Weapp DevTools Verified** instead of implying that the H5 selector changed it.

<MiniProgramBlocksGallery locale="en" />

## Evidence and Implementation Boundaries

- `H5 Live`: real browser components and interactions on this page
- `Weapp Contract Preview`: a browser-rendered target contract, not the WeChat runtime
- `Weapp DevTools Verified`: DevTools evidence from a compiled mini-program page
- `weapp-vite` owns component JSON, complex list keys, generated types, and target output; `wevu` is the runtime peer for `@varo-ui/weapp`
- `weapp-tailwindcss` translates classes in the build chain; native `hover-class` provides mini-program pressed feedback

## Continue

- [Installation](/en/guide/installation)
- [Build Your Own Block](/en/blocks/build-your-own)
- [Button Docs](/en/components/button)
- [Theme](/en/guide/theme)
