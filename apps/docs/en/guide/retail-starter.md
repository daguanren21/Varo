# Retail Starter integration

Export an editable standalone retail project from Varo: **native Wevu for WeChat** remains the default, with **uni-app Vue 3** and **Taro Vue 3** options for **H5 + WeChat**. Conversion uses the existing pages, components, events, configuration, and assets rather than a separately maintained retail UI, without a Wevu runtime or global compatibility layer.

::: warning Simulated orders only
The default service keeps data in memory and resets on restart. Orders carry `simulation: true`, not proof of payment. There is no production backend, authentication, real payment, or durable order service; the HTTP adapter retains the simulated-order contract.
:::

## 1. Export and install

We recommend **Node 24 (`>=24.11.0 <25`)**; use **pnpm 11.24.0**. Run from the **Varo repository root**:

```bash
pnpm install --frozen-lockfile
```

Choose one export target:

| Project                   | Run from the Varo root                                       |
| ------------------------- | ------------------------------------------------------------ |
| Wevu for WeChat (default) | `pnpm retail:export -- ../my-retail`                         |
| uni-app Vue 3             | `pnpm retail:export -- --framework uni-app ../my-retail-uni` |
| Taro Vue 3                | `pnpm retail:export -- --framework taro ../my-retail-taro`   |

Explicit `--framework wevu` produces the same source as the default. Enter your selected export directory, then run:

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Choose a new or empty directory outside the repository whose parent already exists. Export needs network access to resolve dependencies and generate a lockfile; retain that lockfile for later installs.

Set `WEAPP_APP_ID` in `.env.local` to an AppID you are entitled to use. Do not commit local configuration or secrets. Shell variables take precedence over `.env.local`; leaving it empty permits compilation, not DevTools access, preview, or publication.

## 2. Run and inspect output

Run `pnpm typecheck` in uni-app and Taro projects. In each project, `pnpm build` builds its production targets; `pnpm verify` separately checks existing WeChat output. Both uni-app and Taro build H5 first, then WeChat.

| Project and target | Development          | Production             | Output and how to open it                                                                                                           |
| ------------------ | -------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Wevu for WeChat    | `pnpm dev`           | `pnpm build`           | Import **`dist/dev`** or **`devtools/build`** in DevTools; application artifacts are in the corresponding `mp-weixin/` subdirectory |
| uni-app H5         | `pnpm dev:h5`        | `pnpm build:h5`        | Open the local development URL printed by the command; serve production **`dist/build/h5/`** over HTTP                              |
| uni-app WeChat     | `pnpm dev:mp-weixin` | `pnpm build:mp-weixin` | Import **`dist/dev/mp-weixin`** or **`dist/build/mp-weixin`** directly in DevTools                                                  |
| Taro H5            | `pnpm dev:h5`        | `pnpm build:h5`        | Open the local development URL printed by the command; serve production **`dist/h5/`** over HTTP                                    |
| Taro WeChat        | `pnpm dev:weapp`     | `pnpm build:weapp`     | Both modes write to **`dist/weapp/`**; import that directory directly in DevTools, with compiled `miniprogramRoot: "./"`            |

WeChat production builds include recursive component, template, style, and asset-path verification. Do not mix project import roots or edit compiled output. These checks do not execute page interactions or prove DevTools authentication/device access.

Uni-app routes live in `src/pages.json`; platform configuration lives in `manifest.config.json`. Do not manually edit generated `src/manifest.json` or `src/project.config.json`. Retain the lockfile and `nodeLinker: hoisted` in `pnpm-workspace.yaml`, which accommodates the official uni plugin's symlink resolution. H5 uses hash routing; review the official H5 base configuration before deploying under a non-root path. Development servers bind to loopback by default.

Taro routes and application settings live in `src/app.config.ts`, with colocated `index.config.ts` page settings and compiler configuration under `config/`. The template uses the Webpack 5 compiler and separate H5/WeChat output directories. Do not open it as a uni-app or native Wevu project. See the export's `DEPENDENCIES.md` for pinned versions and compatibility constraints.

## 3. Replace branding and products

- **Brand:** edit `brand.name`, `brand.logo`, and `brand.accent` in `src/features/retail/config.ts`. The Wevu logo is adjacent; converted uni-app and Taro logos live in `src/static/features/retail/`, with their URLs retained in configuration.
- **Products:** edit `src/features/retail/data.ts`. Wevu images live in `src/assets/retail/`; uni-app and Taro images live in `src/static/assets/retail/`. Update references when replacing them.
- **Theme:** edit the `.retail-page-enter` variables in Wevu's `src/app.vue` or uni-app/Taro's `src/App.vue`, preserving global style import order. The default everyday catalog uses a warm paper canvas, serif headings and light separators; `retail-heading` and `retail-price` share heading/price typography with system-font fallbacks. Taro's `src/app.ts` is the application entry, not a second theme owner. `brand.accent` does not generate a full semantic palette. See [theme configuration](/en/guide/theme).

Recompile and restart after changing configuration or services. Check home, product images, cart, and order snapshots. Both Vue exports preserve controlled-value semantics, blur-time input commits and keyboard activation, and offset fixed actions above their H5 tab bars. Taro also handles asynchronously rendered host-input accessibility names. Its footer uses the compiler-supported `taro-tabbar-height` constant; do not replace it with `var(--taro-tabbar-height)`, which that compiler rewrites incorrectly. These adapters cover the current retail source closure, not arbitrary Wevu projects.

Taro H5 decodes route parameters once at the page-load boundary, preserving Chinese text, literal `%2F`, plus signs and reserved characters. Do not decode them again in business pages or apply this H5 normalization to native hooks. H5 buttons mirror their disabled state in `aria-disabled`. When the page's inline error/retry channel already represents the same nonempty error, it avoids a duplicate toast that could obstruct the controls; errors not represented by that channel still produce toast feedback. A cart row's quantity does not imply that it is selected for checkout.

## 4. Connect your service

Replace the exported `retailService` in `src/features/retail/runtime.ts`, implementing `RetailService` from `service.ts`: `load`, `quote`, `createOrder`, and `saveAddress`. See the adjacent `types.ts` for full data types. Keep requests and credentials out of public UI components.

For HTTP, import `createHttpRetailService` from `http-service.ts` and replace the default assignment with `createHttpRetailService({ baseUrl, transport })`. Supply your own HTTPS `baseUrl` and authentication. Configure allowed request domains for mini programs and server-side CORS for H5. Varo provides no hosted backend.

`RetailHttpTransport` accepts `{ url, method, data? }` and returns `Promise<{ statusCode, data }>`. Use `wx.request` in Wevu, `uni.request` in uni-app, or `Taro.request` in Taro; unwrap any business response envelope in the transport.

| Request (appended to `baseUrl`) | JSON request body                          | 2xx JSON response body                      |
| ------------------------------- | ------------------------------------------ | ------------------------------------------- |
| `GET /snapshot`                 | None                                       | `RetailSnapshot`                            |
| `POST /checkout/quote`          | `RetailCheckoutInput`                      | `RetailCheckoutQuote`                       |
| `POST /orders`                  | `RetailCheckoutInput` plus `expectedTotal` | `RetailOrder`, including `simulation: true` |
| `PUT /addresses`                | `RetailAddress`                            | Full `RetailAddress[]`                      |

`RetailCheckoutInput` contains `items: { productId, quantity }[]` and `addressId`. Quotes and orders return item/address snapshots and amounts. Product IDs, quantities, and the address must match the request; the order total must match `expectedTotal`.

All amounts use **integer cents**, with `total = subtotal - discount + shipping`. Quantities must be positive safe integers within stock, with no duplicate product rows. Non-2xx responses, network failures, and invalid or mismatched responses are errors, not success.

## 5. Try different states

Keep the default mock, change `scenario` in `src/features/retail/config.ts`, then recompile and restart. Scenarios are not URL parameters.

| Scenario          | Action and result                                                                                                                                                                                    |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default`         | Browse, add to cart, choose an address, confirm a quote, create a simulated order, then view it                                                                                                      |
| `loading`         | Initial loading waits 1500 ms                                                                                                                                                                        |
| `empty`           | Data is empty and checkout cannot submit                                                                                                                                                             |
| `retry` / `error` | The former succeeds on retry after the first load fails; the latter keeps failing                                                                                                                    |
| `stock`           | `aurora-box` has stock 0 and `mini-earbuds` stock 1; deselect or remove unavailable items to continue                                                                                                |
| `validation`      | Start without an address; check required fields and phone validation, then save and select a valid address                                                                                           |
| `pending`         | Submission waits 1500 ms; repeated clicks do not create a second order. Leaving checkout keeps the result in history without navigating back                                                         |
| `submit-error`    | Failure retains the cart and invalidates the quote. Use “重新确认金额” to get a successful fresh quote before resubmitting. Submission still fails here; switch to `default` and restart for success |

Edit an address or cart after ordering: the old order should retain its submission-time snapshots. Coupons are display-only; peripheral review, refund, shipping, invoice, and profile-edit pages are static UI, not working services.

## Before release

- Integrate and validate a production backend, authentication, server-authoritative prices, stock, idempotency, payment, and order states. Do not trust client amounts; removing `simulation` does not integrate payment.
- Configure your request/resource domains and privacy disclosures. Check rights and required notices for logos, images, fonts, trademarks, and dependencies.
- For uni-app and Taro, also exercise the complete flow, asset loading, keyboard/form interaction, and loading/failure/retry states on narrow and wide H5 screens. Successful builds do not prove browser interactions.
- For uni-app, retain the documented security-patched Vite/plugin versions and scoped H5 input patch. The pinned Vue/uni family still includes unsupported `vue-i18n` 9. For Taro, retain the coordinated compiler and narrowly scoped peer-version constraints. Audit the locked graph and validate coordinated upgrades before publishing; see each export's `DEPENDENCIES.md` for limitations.
- Check the full flow, visuals, safe areas, interaction, and performance in WeChat DevTools and on target devices, then preview, upload, and submit for review with your own AppID. Builds and browser previews do not replace device checks or guarantee platform approval.
