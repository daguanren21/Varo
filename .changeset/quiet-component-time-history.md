---
"@varo-ui/cli": minor
"@varo-ui/h5": minor
"@varo-ui/weapp": minor
---

Add editable H5 and native TimeField and FileType components. TimeField supports minute steps and overnight ranges without changing external values until a valid confirmation; FileType provides local filename/MIME classification and attachment-list icons.

Add native AvatarGroup, bound pagination windows, count H5 avatar children through fragments while preserving local key scopes and component identity during reorder/removal, and suppress redundant Tabs change events. Reject Picker confirmation when a column has no selectable option.

Add controlled Agent tool-result disclosure and optional independently expandable Thinking and Activity rows. Add Signature undo/redo with controlled parent acceptance and bounded stroke history.

Keep Picker selections visible with column-relative scrolling, separate columns, and remove hover fills, selection outlines, and lift effects. Fit native Picker buttons to their grid cells. Honor bare disabled attributes in H5 Tabs and preserve full large-page labels without horizontal overflow.

Match native model listeners to emitted camel-case arguments in component demos, documentation previews, and retail approval controls. Render native Signature strokes with component-scoped Canvas 2D and device-pixel-ratio sizing. Center Signature action labels horizontally and vertically on both renderers.

Compile the native playground to ES2018 once, disable the additional DevTools ES6/enhanced JavaScript passes, and preserve function names only in development builds.

Package subpackage-only native components with their actual consuming pages, preserving shared main runtime state and rebasing component, script, template, and style references. Reserve a 1.5 MB compiled main-package budget for real-device debugging and validate each subpackage against 2 MiB; preview upload alone does not certify real-device debug packaging.

Give native Markdown blocks and recursive children explicit stable list keys during streaming, replacing their identities when the source content is replaced. Reject native relocation file/directory conflicts before writes and retain components used by shared templates or styles.

Patch weapp-vite 7.5.0 app-shell generation to use compiled Wevu component registration, preserving native slot-parent/provider ownership instead of emitting a properties-only shell.

Wait for the committed post-approval assistant message and its rendered confirmation in the native runtime smoke, so an order-state update cannot end verification before the response stream finishes.
