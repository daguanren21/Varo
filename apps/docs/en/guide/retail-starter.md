# Retail Starter integration

Export a standalone **native Wevu WeChat retail project** from Varo, then replace its brand, products, and service. The exporter does not produce a standalone H5 project or convert it to uni-app or Taro.

::: warning Simulated orders only
The default service keeps data in memory and resets on restart. Orders carry `simulation: true`, not proof of payment. There is no production backend, authentication, real payment, or durable order service; the HTTP adapter retains the simulated-order contract.
:::

## 1. Export and install

We recommend **Node 24 (`>=24.11.0 <25`)**; use **pnpm 11.24.0**. Run from the **Varo repository root**:

```bash
pnpm install --frozen-lockfile
pnpm retail:export -- ../my-retail
cd ../my-retail
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Choose a new or empty directory outside the repository whose parent already exists. Export needs network access to resolve dependencies and generate a lockfile; retain that lockfile for later installs.

Set `WEAPP_APP_ID` in `.env.local` to an AppID you are entitled to use. Do not commit local configuration or secrets. Shell variables take precedence over `.env.local`; leaving it empty permits compilation, not DevTools access, preview, or publication.

## 2. Open in WeChat DevTools

For development:

```bash
pnpm dev
```

Import **`dist/dev`**, which points to `dist/dev/mp-weixin`.

For a production build:

```bash
pnpm build
pnpm verify
```

Import **`devtools/build`**, which points to `devtools/build/mp-weixin`. `build` includes recursive path verification; `verify` checks existing production output separately. Do not mix the two outputs or edit generated files.

## 3. Replace branding and products

- **Brand:** edit `brand.name`, `brand.logo`, and `brand.accent` in `src/features/retail/config.ts`; replace the adjacent `logo.svg` or update its import.
- **Products:** edit `src/features/retail/data.ts`, replace images in `src/assets/retail/`, and update relative imports.
- **Theme:** edit the `page` CSS variables in `src/app.vue`; `brand.accent` does not generate a full semantic palette. See [theme configuration](/en/guide/theme).

Recompile and restart the mini program after changing configuration or services. Check home, product images, cart, and order snapshots.

## 4. Connect your service

Replace the exported `retailService` in `src/features/retail/runtime.ts`, implementing `RetailService` from `service.ts`: `load`, `quote`, `createOrder`, and `saveAddress`. See the adjacent `types.ts` for full data types. Keep requests and credentials out of public UI components.

For HTTP, import `createHttpRetailService` from `http-service.ts` and replace the default assignment with `createHttpRetailService({ baseUrl, transport })`. Supply your own HTTPS `baseUrl`, WeChat allowed request domains, and authentication; Varo provides no hosted backend.

`RetailHttpTransport` accepts `{ url, method, data? }` and returns `Promise<{ statusCode, data }>`. Implement it with `wx.request` in a native mini program; unwrap any business response envelope in the transport.

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
- Check the full flow, visuals, safe areas, interaction, and performance in WeChat DevTools and on target devices, then preview, upload, and submit for review with your own AppID. Builds and browser previews do not replace device checks or guarantee platform approval.
