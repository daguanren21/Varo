# Varo Retail Product Redesign — Decision Lock

## Brief

- Product type / selected playbook: mobile retail mini program; expanding design system playbook plus complete commerce flow.
- Audience: shoppers browsing, purchasing, and managing orders on a 390 px WeChat viewport.
- Primary user job: find a suitable product, understand price/delivery, and complete or resume a purchase without losing context.
- Primary action: product discovery leading to add-to-cart or buy-now.
- Current failures: custom headers collide with the WeChat capsule; layout classes applied to custom-component hosts create empty space and clipped controls; important values hydrate as null; screens lack one coherent hierarchy; motion and state feedback are inconsistent.
- Trust requirements: final amount, selected quantity, delivery/order state, and destructive or payment actions must be explicit.
- Scope: `apps/playground-weapp` retail main tabs, product/category/cart/checkout/order/profile flows, shared retail components, custom navigation, runtime state, and Registry retail Blocks.
- Existing system: Varo Headless state contracts, Varo Base Kit components, Wevu SFCs, `weapp-vite`, `weapp-tailwindcss`, native WeChat tab bar and capsule.
- Accessibility target: persistent labels, named controls, visible state, 44 px primary touch targets, contrast equivalent to WCAG 2.2 AA where applicable.
- Performance: main package remains below 2 MB; motion uses opacity/transform only; no animation library or blocking third-party media.
- Non-goals: real payment/backend/auth, copied third-party branding, analytics, and private business integration.

## Five-second clarity target

A first-time shopper should understand:

1. Which retail task or category is currently open.
2. Which product or order information matters next.
3. Which single action advances the flow.

## Evidence questions

| Evidence class          | Concrete question                                                                         | Source                                                               |
| ----------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Real product flows      | How do mature stores connect discovery, product confidence, cart, checkout, and tracking? | Apple Store app and Shop customer experience                         |
| Patterns and principles | How should mini-program navigation, feedback, errors, and touch targets behave?           | WeChat Mini Program Design Guide                                     |
| Design system           | How can the flow stay editable and target-native?                                         | Existing Varo tokens, Headless contracts, Base Kit                   |
| Components and motion   | Which motion improves orientation without slowing purchase?                               | Native CSS transitions and WeChat page lifecycle                     |
| Quality                 | Does the real 390 × 762 surface remain readable, capsule-safe, stable, and error-free?    | `weapp-vite/mcp` DevTools capture, console, route, and runtime tools |

## Reference lock

### Primary direction

- Name: **Calm Retail Utility**.
- Sources:
  - https://developers.weixin.qq.com/miniprogram/design/
  - https://apps.apple.com/us/app/apple-store/id375380948
  - https://help.shopify.com/en/manual/online-sales-channels/shop/customer-experience (provider returned 403; observations limited to indexed official summary)
- Fit: the shopper needs fast product confidence and reliable checkout, while Varo needs a distinct teal identity and editable source.
- Structural observations:
  1. One capsule-safe navigation zone, one page title, and one dominant action per screen.
  2. Product image, name, price, stock/delivery, then action; metadata never competes with the purchase decision.
  3. Cart and checkout totals stay visually attached to the fixed action bar and safe-area inset.

### Product and pattern evidence

| Problem                     | Observation                                                                                  | Decision                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Capsule collision           | WeChat requires reserving its fixed official menu region.                                    | Adopt measured capsule metrics on every custom-navigation page.                                      |
| Discovery overload          | Apple and Shop emphasize guided categories, recommendations, saved context, and fast search. | Adapt to a compact home with search, visual categories, featured products, and recent/order context. |
| Purchase uncertainty        | Mature flows place delivery, returns, stock, and final total next to purchase actions.       | Add concise trust rows and keep the payable total adjacent to checkout/buy.                          |
| Waiting and results         | WeChat recommends simple local loading and immediate local feedback.                         | Use local skeleton/pressed/success feedback; avoid blocking modal loaders.                           |
| Component-host layout drift | MCP screenshots show grid/flex on custom hosts can stretch or clip.                          | Put layout on native `view` wrappers; Varo components remain controls/content.                       |

### Selected details

| Detail                                                           | Benefit                                                                   | Surface                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------- |
| Teal-to-ink membership/header band with restrained warm sale red | Separates identity from commerce status without a second design language. | Home, profile, purchase actions |
| 160–220 ms staggered opacity/translate entrance                  | Makes route and section changes legible without delaying interaction.     | Page shell and collection items |

### Controlled experiment

- Idea: short staggered entrance for page sections and product cards.
- Benefit: reinforces route hierarchy and scan order.
- Signal: content is readable immediately, controls remain clickable, no layout shift.
- Reading order: DOM/WXML order is unchanged.
- Reduced motion: duration becomes zero and transforms are removed.
- Removal: delete motion classes; no product logic depends on them.

### Anti-references

| Trait                                                                                   | Rejection reason                                                            |
| --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Dense tables, giant empty cards, clipped counters, and layout on custom-component hosts | Obscures hierarchy and has already failed on the real mini-program surface. |
| Copying another starter, component catalog, branding, or remote image set               | Conflicts with Varo ownership and maintainability.                          |
| Constant floating, shimmer, bounce, or spring motion                                    | Competes with reading and purchase actions; increases runtime cost.         |

## System decisions

- Color: `#0f766e` primary, `#082f35` ink-teal, slate neutrals, `#d9362b` sale/action danger.
- Typography: system/PingFang; 28–32 px page titles, 18–20 px section titles, 14–16 px product copy, 11–12 px metadata.
- Spacing: 4 px base; 12 px page gutters; 16–20 px card padding; 12–16 px section rhythm.
- Shape: 12 px controls, 16–20 px cards; borders before shadows; no decorative nested cards.
- Motion: opacity/translate/scale only, 160–220 ms, one entrance sequence per route, pressed feedback below 100 ms.
- Imagery: owned local assets with fixed dimensions and graceful fallback.
- Responsive behavior: 390 px reference, capsule metrics from runtime APIs, safe-area bottom padding, no horizontal clipping.

## State inventory

| State                  | Required behavior                                                      | Verification                                 |
| ---------------------- | ---------------------------------------------------------------------- | -------------------------------------------- |
| Default                | Page title, current section, and primary action are obvious.           | MCP screenshot per primary route             |
| Loading                | Geometry-preserving local skeleton; no modal spinner.                  | Runtime state/capture                        |
| Empty                  | Explain state and provide one recovery action.                         | Cart, results, orders                        |
| Validation/error       | Inline field/action error with recovery.                               | Forms and checkout                           |
| Offline/stale          | Preserve local cart and identify unavailable remote action when added. | Structural contract; backend is out of scope |
| Success                | Immediate toast or terminal result page with next action.              | Add-to-cart, submit, pay result              |
| Long/localized content | Wrap without clipping and keep action bars stable.                     | 390 px MCP capture                           |

## Lock review

- [x] Every source answers a stated question
- [x] Complete retail flow takes priority over isolated decoration
- [x] One primary direction is named
- [x] Adopt/adapt/reject choices include scope
- [x] Existing Varo runtime and components remain authoritative
- [x] Relevant states are specified
- [x] Accessibility and performance targets are explicit
- [x] Anti-references prevent competing identities
