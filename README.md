# Sticky Div

Zero-dependency React component that sticks an element with CSS [`position: sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky).

Requires **React 18+** and a current evergreen browser. There is no Internet Explorer support.

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

While stuck (and only when `onFixedChange` or `stuckClassName` is passed), the element gets a `data-stuck` attribute for CSS:

```css
.header[data-stuck] {
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
}
```

Stuck detection uses `IntersectionObserver` on a 1px sentinel above the element. The element is stuck only after that sentinel has crossed the sticky `offsetTop` — not while it is still below the scrollport. The observer root is expanded downward so a jump-scroll from below the fold still notifies. If you pass neither `onFixedChange` nor `stuckClassName`, the component is a sticky element with no observers.

## Scroll containers

`position: sticky` is scoped to the **nearest scroll ancestor**, not necessarily the window. That is what you want for a sticky bar inside an `overflow: auto` panel.

An ancestor with `overflow: hidden`, `auto`, or `scroll` that is *not* the intended scroller will prevent sticking. Move that overflow, or use `overflow: clip` when you only need to clip painting.

Avoid vertical **margins** on the sticky node (they interact poorly with sticky containing blocks). Use padding instead.

## Next.js / RSC

The published bundle starts with `'use client'`, so you can import `StickyDiv` from a Server Component file.

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
