# Varo Retail UI Acceptance

## Verification context

- Route / build: `apps/playground-weapp/devtools/build/mp-weixin`, production `weapp-vite build`.
- Reference lock: `docs/plans/varo-retail-product-redesign.md`.
- Mobile device: WeChat DevTools, iPhone 12/13 Pro, 390 × 762 viewport, 3× pixel ratio.
- Input methods: MCP route transitions and host scrolling; behavior suites cover form, selection, quantity, cart, order, and emitted actions.
- Accessibility target: persistent labels, named controls, visible states, 44 px primary targets, WCAG 2.2 AA-equivalent contrast where applicable.
- Performance: main package under 2 MB; compositor-friendly CSS motion only.
- Evidence: `.tmp/weapp-mcp-primary/`, `.tmp/weapp-mcp-flow/`, `.tmp/weapp-mcp-refined/`, `.tmp/weapp-mcp-reported/`; committed Block captures under `apps/docs/public/blocks/`.

## Product clarity and hierarchy

- [x] Home identifies the store, search, categories, featured product, and next action within one viewport.
- [x] Product image, name, price, stock/service, then buy actions form the product-detail reading order.
- [x] Cart selection, quantity, total, and checkout remain visually connected.
- [x] Checkout shows address, products, delivery, discounts, and payable amount before submission.
- [x] Motion supports route/section orientation and has a reduced-motion path.
- [x] Varo teal, slate neutrals, local imagery, and warm sale red remain the only visual language.

## Journey and states

- [x] Discovery → category/search → product → cart → checkout → payment result → order routes are present and routable.
- [x] Back, continue-shopping, cancel, close, and service/order recovery actions remain reachable.
- [x] Empty cart, empty results, validation, disabled actions, and payment success are represented.
- [x] Cart state survives route changes through the existing singleton store.
- [x] Payment and order actions show immediate local feedback or terminal result pages.
- [ ] Real payment, network failure, offline, authentication, and permission states are not applicable to the local Mock transport.

## Responsive, platform, and accessibility

- [x] Every custom-navigation page measures `wx.getMenuButtonBoundingClientRect()` and reserves the official capsule region.
- [x] Safe-area bottom padding protects fixed purchase and checkout actions.
- [x] MCP captures show no horizontal clipping in home, category, cart, profile, product detail, checkout, and order screens.
- [x] Product names, prices, descriptions, and quantity controls wrap or truncate intentionally.
- [x] Native mini-program controls and named Varo controls expose labels, checked/disabled/loading states, and persistent form labels.
- [x] Color is not the sole state signal; labels, values, checkmarks, and disabled states accompany color.
- [x] Reduced motion removes page/section animations without changing reading order or behavior.
- [ ] Browser keyboard and screen-reader checks are not applicable to the WeChat native surface; platform accessibility inspector verification remains manual.

## Performance and stability

- [x] Main package: 1.21 MB, below the 2 MB budget.
- [x] Local retail imagery is approximately 114 KB after compression and uses explicit dimensions.
- [x] Motion uses opacity/transform and 90–220 ms CSS transitions; no animation dependency was added.
- [x] `lazyCodeLoading: requiredComponents` remains enabled.
- [x] `autoImportComponents: false` avoids scanning the full component glob; explicit reachability reduced render chunks from 124 to 109.
- [x] Production build and recursive component-path verification pass.
- [x] Final MCP route audit covered all 30 retail routes; no actionable route/runtime failures remained.

## Findings

| Severity | Surface                                                          | Evidence                                | Resolution                                                                                                         |
| -------- | ---------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Blocker  | Custom headers overlapped WeChat capsule                         | User screenshot; category MCP capture   | Added shared measured chrome metrics and applied them to every custom-navigation page.                             |
| High     | Custom-component hosts stretched grid/flex layouts               | Cart/product/profile MCP screenshots    | Moved layout to native `view` wrappers and bounded image/control hosts.                                            |
| High     | Null props and scoped-slot expressions produced runtime failures | MCP console                             | Added runtime-any prop boundaries, normalized view models, and removed unsafe loop-to-component bindings.          |
| High     | Hero copy lacked contrast and had a cramped CTA                  | User screenshot                         | Replaced static banner with a three-product swiper, strong gradient scrim, spaced content, and visible pagination. |
| Medium   | Product quick-add clipped in two-column cards                    | User screenshot                         | Replaced the circular edge action with a full-width, padded add-to-cart button.                                    |
| Medium   | Native tab bar lacked icons                                      | User screenshot                         | Added authored inactive/active PNG icons for all four tabs.                                                        |
| Medium   | Form fields and controls touched                                 | User screenshots                        | Added native wrapper spacing rather than relying on custom-host `gap`.                                             |
| Medium   | Category labels touched the card edge                            | User screenshot; updated WeChat capture | Increased category target height and added explicit button/grid bottom padding.                                    |

## Acceptance

- [x] Primary-task blockers are resolved.
- [x] AppID-gated local DevTools runs can opt into an ignored `project.local.json`; no AppID or credential is stored in the repository.
- [x] Screenshots, route results, package size, tests, and build evidence correspond to the current production build.
