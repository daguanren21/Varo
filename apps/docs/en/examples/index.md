# Cross-runtime Showcase

Try H5 components and inspect native source and runtime screenshots here. Repository playgrounds are for maintainer QA; use the public installation paths below for your application.

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
    <p>Use the published H5 package when you need coordinated component upgrades.</p>
  </article>
</div>

Registry installation is the default path. Start with the [installation guide](/en/guide/installation), then generate source for the selected target.

## H5 and Mini Program Live Previews

The H5 tab runs interactive `@varo-ui/h5` browser components. The Mini Program tab runs compiled Wevu pages inside a phone frame. A themed skeleton stays visible until the preview is ready; a failed preview offers retry, and the Registry source remains available below. Browser previews do not replace WeChat DevTools or device verification.

<PlatformTabsDemo example="overview" locale="en" />

## Weapp DevTools Verified: Compiled Blocks {#weapp-devtools-evidence}

All **13 native Blocks** were recaptured on **2026-10-05** in the **375px WeChat DevTools simulator**, from pages built by `weapp-vite` and run in the native runtime. Images exclude system bars and simulator edges. See the [capture script](https://github.com/daguanren21/Varo/blob/main/apps/playground-weapp/e2e/capture-blocks.mjs) and [example screenshot](../../blocks/login-form.png), or open the full-resolution image beneath each card.

H5 browser captures for the six dual-renderer Blocks were updated the same day. Selecting H5 changes the image, installation command and usage code together.

Screenshots record only the captured version. They do not validate current source, another target's runtime, the six experimental profiles or devices. See [Installation](/en/guide/installation#install-profiles-and-support-boundaries) for current admission and compiler-check scope.

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
