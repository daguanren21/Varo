# Tabs Accessibility Design

## Goal

Complete the Tabs primitive accessibility contract without coupling `@varo/primitives-core` to browser DOM APIs. H5 tabs must provide stable trigger/panel relationships and automatic keyboard activation. Weapp must expose the same state and semantic attributes without pretending that mini-program runtimes have browser focus behavior.

## User Stories

- As a keyboard user, I can move between enabled H5 tabs with the orientation-appropriate arrow keys and with Home/End.
- As an assistive-technology user, each tab trigger identifies its panel and each panel identifies its trigger.
- As a component author, I can provide a stable root ID for SSR and tests, while Vue wrappers generate a hydration-stable ID when I omit one.
- As a cross-platform wrapper author, I can reuse the navigation decision logic without importing or emulating browser DOM APIs in primitives core.
- As a consumer with custom event handlers, I can cancel Varo's keyboard or click behavior with `preventDefault()` before it changes selection.

## Considered Approaches

### Core algorithm plus H5 DOM focus (selected)

Core owns orientation, IDs, ARIA attributes, and a pure function that maps a navigation key and current index to the next index. H5 reads the actual enabled triggers from the nearest tablist, calls the core algorithm, and moves focus. Focus automatically selects the target tab.

This keeps navigation policy testable and cross-platform while using actual DOM order, so conditional rendering and keyed reordering do not leave a registration list stale.

### Stateful trigger registration

Each trigger could register its value, disabled state, and focus callback with the root. This avoids DOM queries but adds lifecycle state to the cross-platform core and can become stale when keyed triggers reorder without remounting.

### H5-only implementation

The H5 wrapper could implement all navigation directly. This is the smallest edit, but it duplicates orientation/key policy and leaves core's advertised semantic contract incomplete.

## Core Contract

`TabsRootOptions` gains:

- `id?: MaybeRef<string | undefined>`
- `orientation?: MaybeRef<'horizontal' | 'vertical' | undefined>`

The default orientation is `horizontal`. A core-created root receives a unique fallback ID. Vue wrappers always pass Vue's `useId()` unless the consumer provides `id`, which keeps SSR hydration deterministic.

The root exposes losslessly encoded IDs:

- trigger: `varo-tabs-<root>-trigger-<value>`
- panel: `varo-tabs-<root>-content-<value>`

The value segment includes an `s-` or `n-` type prefix so string and numeric values such as `'1'` and `1` cannot collide.

Trigger attributes include `id`, `role="tab"`, `aria-controls`, `aria-selected`, `aria-disabled`, and roving `tabindex` (`0` for the active enabled trigger, otherwise `-1`). Content attributes include `id`, `role="tabpanel"`, and `aria-labelledby`. The tablist includes `aria-orientation`.

Core also exports a pure navigation decision:

```ts
getTabsNavigationIndex({
  currentIndex,
  itemCount,
  key,
  orientation
}): number | undefined
```

Horizontal lists handle ArrowLeft/ArrowRight; vertical lists handle ArrowUp/ArrowDown. Home and End work in both orientations. Movement wraps. Unrelated keys return `undefined`.

## H5 Interaction

`TabsList` remains the semantic tablist. `TabsTrigger` handles two events while preserving consumer handlers:

- `focus`: after the consumer handler, automatically select the focused enabled trigger. Native focus events are not cancelable, which is part of the selected automatic-activation mode.
- `keydown`: after the consumer handler, ignore prevented events and unrelated keys; otherwise collect enabled tabs whose closest tablist is the current list, calculate the next index through core, prevent the browser default, and focus the target.

Selecting on focus provides automatic activation and means arrow navigation does not need a trigger registry or value serialization. Nested tablists are excluded by checking each trigger's nearest tablist.

Click behavior remains unchanged except that it continues to respect disabled state and consumer cancellation.

## Weapp Interaction

Weapp receives the same `id` and `orientation` props and renders the same root/list/trigger/content semantic attributes. Click selection remains supported. Browser-specific querying and focus movement are not added to the mini-program wrapper.

## Error And Edge Handling

- Disabled triggers are excluded from keyboard navigation.
- If no enabled trigger exists, navigation is a no-op.
- If the current trigger is not found in its tablist, navigation is a no-op.
- Duplicate values are unsupported because a tab value identifies one trigger/panel pair; tests and documentation will state that values must be unique within a root.
- IDs use lossless encoding so punctuation cannot collapse distinct values into the same DOM ID.
- Consumer `preventDefault()` cancels click selection and keyboard navigation. Focus activation is intentionally not cancelable.
- The first implementation is left-to-right only. RTL direction reversal is deferred until a direction contract exists across primitives.

## Testing

Core tests cover:

- trigger/panel linkage and unique IDs across roots and punctuation-heavy values;
- horizontal and vertical arrow mapping;
- Home/End, wrapping, empty lists, and unrelated keys;
- orientation attributes and roving tabindex.

H5 tests mount real parts and cover:

- Arrow, Home, and End focus movement in DOM order;
- disabled-trigger skipping and wraparound;
- automatic value activation and emitted updates;
- nested tablist isolation;
- consumer `preventDefault()` cancellation;
- stable trigger/panel ID linkage.

Weapp tests cover shared attributes, IDs, orientation, and existing click selection. Final verification runs focused package tests followed by full typecheck, test, build, and `git diff --check`.

## Scope

This change completes Tabs accessibility only. It does not add manual activation mode, RTL direction, dynamic panel mounting policies, or a general focus-management abstraction.
