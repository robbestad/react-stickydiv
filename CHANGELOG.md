# Changelog

## 4.0.0

Rewrite for React 18+ and current browsers. This is a **breaking** release.

### Breaking

- Requires React 18 or later (`peerDependencies.react: ">=18"`).
- Stickiness is CSS `position: sticky` instead of `position: fixed` plus a hidden clone.
- Children render once. Stateful children and form fields are no longer duplicated while stuck.
- The extra wrapper `div` is gone. The component renders a single element (and, when stuck detection is enabled, a 1px sentinel sibling).
- Sticking is scoped to the nearest scroll ancestor, not the window.
- Internet Explorer is not supported.
- `create-react-class`, `prop-types`, `react-dom` (as a peer), and `dom-find` are removed.
- The UMD file `dist/react-stickydiv.min.js` is no longer published. Use ESM or CJS via `package.json` `exports`.
- `className` is always applied, not only while stuck.

### Added

- TypeScript types.
- `onFixedChange(fixed: boolean)` — documented in 3.x but missing from the published build (it was compiled out of `index.jsx`).
- `stuckClassName` and `data-stuck` for styling the stuck state.
- `as` to render a different element type.
- `ref` forwarding.
- `'use client'` on the published entry for React Server Components.
- Dual ESM / CJS exports.

### Changed

- Default `zIndex` remains `9999` (the 3.x runtime value; the old README said `999`).
- Toolchain: TypeScript, tsdown, Biome, Vitest, Playwright, Vite playground, GitHub Actions.
