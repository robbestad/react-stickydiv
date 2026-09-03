# react-stickydiv

Stick any React element with native CSS [`position: sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky). Zero dependencies, children render once, TypeScript included.

[Live demo](https://react-stickydiv.vercel.app) · React 18+ · evergreen browsers (no IE)

Using an LLM or coding agent? Copy the [agent spec](#for-llms) into the prompt.

## Why this, not a `position: fixed` clone

Most sticky libraries (including this package before 4.0) listen to window scroll, switch to `position: fixed`, and duplicate children into a hidden clone. That drops input focus, resets component state, and jumps layout.

`react-stickydiv` 4.x does none of that:

- **Native CSS sticky** — the browser does the work. No scroll listeners, no `findDOMNode`, no layout jump.
- **Children render once** — forms, cursors, and local state survive being stuck.
- **Zero runtime dependencies** — one component, dual ESM/CJS, `'use client'` so Next.js Server Components can import it.
- **Accurate stuck state** — optional `IntersectionObserver` sentinel. `onFixedChange`, `stuckClassName`, and `data-stuck` fire only after the element has crossed `offsetTop`, including after a jump-scroll from below the fold.
- **Nearest scroll ancestor** — works inside `overflow: auto` panels, not only the window.
- **Single element** — no extra wrapper unless you opt into stuck detection (then a 1px sentinel sibling).

## Install

```bash
npm install react-stickydiv
```

```tsx
import { StickyDiv } from 'react-stickydiv'

export function Page() {
  return (
    <StickyDiv offsetTop={16} zIndex={20} className="header">
      I stick when you scroll past me.
    </StickyDiv>
  )
}
```

`require('react-stickydiv')` still resolves to the component (CJS default export).

## Usage

### Stuck styles and a callback

Pass `stuckClassName` or `onFixedChange` only when you need stuck state. That turns on the sentinel observer. Otherwise the component is just a sticky element.

```tsx
import { useState } from 'react'
import { StickyDiv } from 'react-stickydiv'

export function AppHeader() {
  const [stuck, setStuck] = useState(false)

  return (
    <StickyDiv
      as="header"
      className="header"
      stuckClassName="is-stuck"
      zIndex={20}
      onFixedChange={setStuck}
    >
      Site title {stuck ? '(stuck)' : ''}
    </StickyDiv>
  )
}
```

```css
.header[data-stuck],
.header.is-stuck {
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
}
```

### Nested scroller

Sticky is scoped to the nearest scroll ancestor. Scroll the panel, not the page, to stick the inner bar.

```tsx
<div style={{ height: 240, overflow: 'auto' }}>
  <StickyDiv className="panel-bar" zIndex={1}>
    Nested sticky
  </StickyDiv>
  {/* panel content */}
</div>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `offsetTop` | `number` | `0` | Distance from the top of the scrollport. Maps to CSS `top`. |
| `zIndex` | `number` | `9999` | Stacking order. |
| `className` | `string` | — | Always applied (3.x only applied it while stuck). |
| `stuckClassName` | `string` | — | Extra class while the element is stuck. |
| `onFixedChange` | `(fixed: boolean) => void` | — | Fires when stuck state changes. `true` means stuck. Not called with `false` on mount. |
| `as` | element type | `'div'` | Render a different tag or component. |
| `style` | `CSSProperties` | — | Merged with sticky positioning. `position: sticky` is always set. |
| `children` | `ReactNode` | — | Rendered **once**. No hidden clone. |

`ref` and other HTML attributes are forwarded to the rendered element.

Stuck detection uses `IntersectionObserver` on a 1px sentinel above the element. The element is stuck only after that sentinel has crossed the sticky `offsetTop` — not while it is still below the scrollport. The observer root is expanded downward so a jump-scroll from below the fold still notifies.

## Scroll containers

`position: sticky` is scoped to the **nearest scroll ancestor**, not necessarily the window. That is what you want for a sticky bar inside an `overflow: auto` panel.

An ancestor with `overflow: hidden`, `auto`, or `scroll` that is *not* the intended scroller will prevent sticking. Move that overflow, or use `overflow: clip` when you only need to clip painting.

Avoid vertical **margins** on the sticky node (they interact poorly with sticky containing blocks). Use padding instead.

## Next.js / RSC

The published bundle starts with `'use client'`, so you can import `StickyDiv` from a Server Component file.

## For LLMs

Copy everything in the block below into an LLM or coding-agent prompt when you want it to use `react-stickydiv`.

```
Use react-stickydiv v4 to make React elements stick while scrolling.

Install: npm install react-stickydiv
Import:  import { StickyDiv } from 'react-stickydiv'
Peer:    react >= 18. Evergreen browsers only. No Internet Explorer.
Default export is the same component (CJS: require('react-stickydiv')).
The published bundle starts with 'use client' (safe to import from Next.js Server Components).

API (TypeScript):
  <StickyDiv
    as?: ElementType            // default 'div'
    offsetTop?: number          // CSS top, default 0
    zIndex?: number             // default 9999
    className?: string          // always applied
    stuckClassName?: string     // applied only while stuck
    style?: CSSProperties       // merged; position:'sticky' always wins
    onFixedChange?: (fixed: boolean) => void
    children?: ReactNode
    ref?: Ref<HTMLElement>
    ...htmlAttributes
  />

Behavior:
- Stickiness is CSS position:sticky, scoped to the nearest scroll ancestor
  (overflow auto/scroll/overlay), not the window.
- Children render once. Do not clone, portal, or switch to position:fixed.
- Renders a single element. If onFixedChange or stuckClassName is passed,
  also renders a 1px aria-hidden sentinel sibling above it and observes it
  with IntersectionObserver.
- Stuck means the sentinel has crossed offsetTop. A sentinel still below the
  viewport is NOT stuck. onFixedChange(true) / stuckClassName / data-stuck
  apply only then. onFixedChange is not called with false on mount.
- If neither onFixedChange nor stuckClassName is passed, skip stuck detection
  (no observer, no sentinel).
- While stuck (and only when observing), the element gets data-stuck="".
- Do not put vertical margin on StickyDiv; use padding.
- An ancestor with overflow hidden/auto/scroll that is not the intended
  scroller prevents sticking. Move it, or use overflow:clip to clip paint.

Do not use the 3.x API: no createReactClass, no findDOMNode, no window-only
fixed clone, no className-only-while-stuck.

Minimal header:

  import { StickyDiv } from 'react-stickydiv'

  export function Header() {
    return (
      <StickyDiv as="header" offsetTop={0} zIndex={20} className="header">
        Title
      </StickyDiv>
    )
  }

Stuck styles + callback:

  import { useState } from 'react'
  import { StickyDiv } from 'react-stickydiv'

  export function Header() {
    const [stuck, setStuck] = useState(false)
    return (
      <StickyDiv
        as="header"
        className="header"
        stuckClassName="is-stuck"
        zIndex={20}
        onFixedChange={setStuck}
      >
        Title {stuck ? '(stuck)' : ''}
      </StickyDiv>
    )
  }

  /* CSS */
  .header[data-stuck] { box-shadow: 0 4px 16px rgb(0 0 0 / 12%); }

Nested scroller:

  <div style={{ height: 240, overflow: 'auto' }}>
    <StickyDiv className="bar" zIndex={1}>Nested sticky</StickyDiv>
    {/* scrollable content */}
  </div>
```

## Development

```bash
npm install
npm test          # unit tests
npm run dev       # playground at http://127.0.0.1:5173
npm run test:e2e  # Playwright against the playground
npm run build
```

## Migrating from 3.x

4.0 is a rewrite. The old implementation used `position: fixed`, window scroll listeners, `findDOMNode`, and duplicated children while stuck.

| 3.x | 4.0 |
| --- | --- |
| `createReactClass` + `require()` | `import { StickyDiv } from 'react-stickydiv'` |
| React 0.14 / 16 | React 18+ |
| `position: fixed` + hidden clone | `position: sticky` |
| Children rendered twice when stuck | Children once |
| Window scroll only | Nearest scroll ancestor |
| `className` only while stuck | Always applied |
| `onFixedChange` documented but missing | Implemented |
| Extra wrapper `div` | Single element (plus a 1px sentinel when observing stuck state) |
| `findDOMNode` / string refs | `ref` forwarding |

See [CHANGELOG.md](./CHANGELOG.md) for the full 4.0 list.

## License

ISC
