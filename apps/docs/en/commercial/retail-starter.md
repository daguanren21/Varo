# Retail Starter proposal

::: warning Not on sale
**¥399 is only a proposed one-time trial price, not a current offer.** No orders, payments, or reservations are accepted, and no launch date is promised.
:::

For independent developers, studios, and small teams that can connect their own backend: an editable, independently runnable retail frontend to reduce integration work. This is not a fully managed shop.

## Planned deliverables

- Standalone source, dependency lockfile, version notes, and installation steps.
- Product browsing, cart, address, checkout, and simulated-order flows.
- Brand and asset replacement points, local mock data, and an HTTP integration example.
- Version-matched instructions, validation records, and known limitations.

## Scope

The public exporter supports two projects: **native WeChat using Wevu + weapp-vite + weapp-tailwindcss** by default, or **uni-app Vue 3 (H5 + WeChat)** converted from the same retail source. Taro conversion, arbitrary Wevu projects, and other uni-app platforms are outside scope.

You provide the production backend, authentication, payment, refunds, and shipping integrations. Default orders are in-memory simulations, not real transactions. Builds and browser demos do not establish device verification or guarantee platform approval.

## Open source and terms

Existing and newly added public source, components, Blocks, and documentation remain under the [MIT LICENSE](https://github.com/daguanren21/Varo/blob/main/LICENSE). **Commercial use requires no purchase.** Retain copyright and license notices, and respect separate rights for third-party assets, dependencies, and trademarks.

Delivery version, support, update, and refund terms are not confirmed. This proposal adds no paywall and promises neither lifetime updates nor unlimited support.

Use the public project through the [integration guide](/en/guide/retail-starter). Interested in the proposal? Discuss it in the original [Issue #21](https://github.com/daguanren21/Varo/issues/21).
