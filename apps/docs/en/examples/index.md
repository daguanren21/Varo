# Cross-runtime Showcase

This is Varo's public cross-runtime showcase. Choose an adoption path, then distinguish H5 browser interaction, native source/support evidence, compiled-artifact browser previews, and WeChat DevTools snapshots. Repository playgrounds remain maintainer QA surfaces, not the public installation path. None of these evidence categories substitutes for device validation.

## Choose an Adoption Path

<div class="varo-adoption-grid">
  <article>
    <span>H5 REGISTRY</span>
    <h3>H5 Product</h3>
    <code>pnpm dlx @varo-ui/cli add --target h5 components/button</code>
    <p>Copies editable Vue source and recursive Registry dependencies; install reported npm dependencies separately.</p>
  </article>
  <article>
    <span>WEAPP REGISTRY</span>
    <h3>Weapp Product</h3>
    <code>pnpm dlx @varo-ui/cli add --target weapp components/button</code>
    <p>Copies target-specific Wevu SFCs and recursive Registry dependencies; install reported npm packages and configure global styles separately.</p>
  </article>
  <article>
    <span>RUNTIME PACKAGE</span>
    <h3>Centralized H5 Runtime</h3>
    <code>pnpm add @varo-ui/h5</code>
    <p>Consumes the published package when coordinated upgrades are intentional.</p>
  </article>
</div>

Registry installation is the default path. Start with the [installation guide](/en/guide/installation), then generate source for the selected target.

## H5 Live and Native Source Evidence

The H5 tab runs real, directly operable `@varo-ui/h5` browser components. The native tab shows target Wevu SFC source and support information only; it no longer renders Vue components as an “equivalent mini program” or claims to execute a native runtime on this page.

<PlatformTabsDemo example="overview" locale="en" />

## Weapp DevTools Verified: Compiled Blocks {#weapp-devtools-evidence}

All **13 native Blocks** were recaptured on **2026-10-05** in the **375px WeChat DevTools simulator**, using pages built by `weapp-vite` and executed in the native runtime. System bars and simulator edges are cropped out. See the [capture script](https://github.com/daguanren21/Varo/blob/main/apps/playground-weapp/e2e/capture-blocks.mjs) and an [example screenshot](../../blocks/login-form.png); the link beneath each card opens its full-resolution image.

The six dual-renderer Blocks have H5 browser captures updated on **2026-10-05**. Selecting H5 changes the image, install command, and usage code together. Captures cover only the version at capture time; images from one target are not runtime evidence for another.

These dated historical screenshots are not a live regression run for the current source cutover and do not certify the six experimental profiles or devices. See [Installation](/en/guide/installation#install-profiles-and-support-boundaries) for exact current admission and compiler-check scope.

<MiniProgramBlocksGallery locale="en" />

## Evidence and Implementation Boundaries

- `H5 Live`: real browser components and interactions on this page
- Native source: inspectable Registry manifest and Wevu SFC evidence, not a live preview
- Compiled-artifact browser preview: glass-easel runs trusted artifacts; its same-origin iframe is not a security sandbox or device proof
- `Weapp DevTools Verified`: dated DevTools page screenshots, not current certification of every component or profile
- `weapp-vite` owns component JSON, complex list keys, generated types, and target output; `wevu` is the runtime peer for `@varo-ui/weapp`
- `weapp-tailwindcss` translates classes in the build chain; native `hover-class` provides mini-program pressed feedback

## Continue

- [Installation](/en/guide/installation)
- [Build Your Own Block](/en/blocks/build-your-own)
- [Button Docs](/en/components/button)
- [Theme](/en/guide/theme)
