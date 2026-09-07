---
"@varo-ui/headless": minor
"@varo-ui/h5": minor
"@varo-ui/weapp": minor
"@varo-ui/cli": minor
---

Add cancellable Dialog open-change details and preserve browsing for readonly Select fields.

Fix native icon mask serialization, style-v2 control geometry, and Agent primary foreground token usage. Document Wevu 7 managed styles and the native Select contract.

Keep native input and textarea grids within their containers, leave omitted input label widths unconstrained, and show the native Select clear action only during interaction.

Preserve selected labels when reopening native Select fields, dismiss on outside taps, and close single-selection panels when reselecting the current value without emitting duplicate value changes.

Use the native muted text token for selected-label previews while Select is open, restoring normal text color on search input or dismissal.

Emit class-only native component WXSS using native style isolation, preserve the canonical Agent button reset, and reject unsupported compiled tag, ID, or attribute selectors during mini-program builds.

Keep the native Mall search, category grid, product cards, and Agent panel within their layout tracks. Reuse styled button sizing and pass numeric pixel dimensions to Mall icons.
