---
"@varo-ui/ai": patch
"@varo-ui/cli": patch
"@varo-ui/weapp": patch
---

Upgrade compatible workspace dependencies, including the Wevu/weapp-vite 7.8 and Tailwind CSS 4.3 toolchains. Keep TypeScript on the latest 6.x compiler because TypeScript 7 removes the Compiler API required by Registry projection and native artifact tooling and cannot emit the CLI's bundled cross-workspace declarations.

Use the released native plain-slot provider protocol directly for compiled Wevu components by enabling `nativeSlotContext` with `scopedSlotsRequireProps` on WeChat builds, document its attached-setup boundary, and ship the version-specific weapp-vite 7.8 app-shell/layout registration patch while retaining the existing 7.5 patch export for compatibility.

Port the miniprogram automator patch to 1.5.1's new runtime structure, retaining rich-text sanitization, nullish Boolean state, disabled-button behavior, custom form-field values, and stale tap-target relocation.

Migrate repository Git hooks from Husky/lint-staged to the native Lefthook configuration required by repoctl 6, preserving staged lint/type checks, commit-message validation, and pre-push checks.
