---
"@varo-ui/weapp": patch
"@varo-ui/cli": patch
---

Fix native Tabs event targeting and requested focus, preserve Input clear activation across blur, and keep RegionPicker open while navigating its hierarchy. Native controlled Form writes now emit `update:model` instead of mutating a property snapshot; consumers should apply that event to their page-owned model. Correct native FormItem slot property names and compiler-supported callback declarations.

Preserve omitted native FormItem `showError` and Form `validateOnChange` settings so inherited behavior remains active while explicit `false` is respected. Render validation messages through a top-level ref that survives native serialization, and keep form writes immediately readable for consecutive updates, reset, and transformed submit payloads.
