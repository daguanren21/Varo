# Retail Starter integration

Export an editable standalone retail project from Varo: **native Wevu for WeChat** remains the default, while **uni-app Vue 3 (H5 + WeChat)** is optional. The uni-app option converts the existing pages, components, events, configuration, and assets without a Wevu runtime or global compatibility layer. Taro conversion is not included.

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

Explicit `--framework wevu` produces the same source as the default. Enter your selected export directory, then run:

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Choose a new or empty directory outside the repository whose parent already exists. Export needs network access to resolve dependencies and generate a lockfile; retain that lockfile for later installs.

Set `WEAPP_APP_ID` in `.env.local` to an AppID you are entitled to use. Do not commit local configuration or secrets. Shell variables take precedence over `.env.local`; leaving it empty permits compilation, not DevTools access, preview, or publication.

## 2. Run and inspect output

Run `pnpm typecheck` in the uni-app project. In either project, `pnpm build` builds its production targets; `pnpm verify` separately checks existing WeChat output. The uni-app `build` command builds H5 first, then WeChat.

| Project and target | Development          | Production             | Output and how to open it                                                                                                           |
| ------------------ | -------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Wevu for WeChat    | `pnpm dev`           | `pnpm build`           | Import **`dist/dev`** or **`devtools/build`** in DevTools; application artifacts are in the corresponding `mp-weixin/` subdirectory |
| uni-app H5         | `pnpm dev:h5`        | `pnpm build:h5`        | Open the local development URL printed by the command; serve production **`dist/build/h5/`** over HTTP                              |
| uni-app WeChat     | `pnpm dev:mp-weixin` | `pnpm build:mp-weixin` | Import **`dist/dev/mp-weixin`** or **`dist/build/mp-weixin`** directly in DevTools                                                  |

WeChat production builds include recursive component, template, style, and asset-path verification. Do not mix the two projects' import roots or edit compiled output. These checks do not execute page interactions or prove DevTools authentication/device access.

Uni-app routes live in `src/pages.json`; platform configuration lives in `manifest.config.json`. Do not manually edit generated `src/manifest.json` or `src/project.config.json`. Retain the lockfile and `nodeLinker: hoisted` in `pnpm-workspace.yaml`, which accommodates the official uni plugin's symlink resolution. H5 uses hash routing; review the official H5 base configuration before deploying under a non-root path. Development servers bind to loopback by default.

## 3. Replace branding and products

- **Brand:** edit `brand.name`, `brand.logo`, and `brand.accent` in `src/features/retail/config.ts`. The Wevu logo is adjacent; the converted uni-app logo lives in `src/static/features/retail/`, with its URL retained in configuration.
- **Products:** edit `src/features/retail/data.ts`. Wevu images live in `src/assets/retail/`; uni-app images live in `src/static/assets/retail/`. Update references when replacing them.
- **Theme:** edit theme variables in Wevu's `src/app.vue` or uni-app's `src/App.vue`, preserving global style import order. `brand.accent` does not generate a full semantic palette. See [theme configuration](/en/guide/theme).

Recompile and restart after changing configuration or services. Check home, product images, cart, and order snapshots. The uni-app export preserves Vue controlled-value semantics, blur-time input commits, and keyboard activation, and offsets fixed actions above the H5 tab bar. It adapts the current retail source closure, not arbitrary Wevu projects.

## 4. Connect your service

Replace the exported `retailService` in `src/features/retail/runtime.ts`, implementing `RetailService` from `service.ts`: `load`, `quote`, `createOrder`, and `saveAddress`. See the adjacent `types.ts` for full data types. Keep requests and credentials out of public UI components.

For HTTP, import `createHttpRetailService` from `http-service.ts` and replace the default assignment with `createHttpRetailService({ baseUrl, transport })`. Supply your own HTTPS `baseUrl` and authentication. Configure allowed request domains for mini programs and server-side CORS for H5. Varo provides no hosted backend.

`RetailHttpTransport` accepts `{ url, method, data? }` and returns `Promise<{ statusCode, data }>`. Use `wx.request` in Wevu or `uni.request` in uni-app; unwrap any business response envelope in the transport.

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
- For uni-app, also exercise the complete flow, asset loading, keyboard/form interaction, and loading/failure/retry states on narrow and wide H5 screens. Retain the documented security-patched Vite/plugin versions and scoped H5 input patch. The pinned Vue/uni family still includes unsupported `vue-i18n` 9; audit the locked graph and validate coordinated upgrades before publishing. See the export's `DEPENDENCIES.md`.
- Check the full flow, visuals, safe areas, interaction, and performance in WeChat DevTools and on target devices, then preview, upload, and submit for review with your own AppID. Builds and browser previews do not replace device checks or guarantee platform approval.
