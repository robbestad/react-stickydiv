'use client'

import {
  type CSSProperties,
  createElement,
  type ElementType,
  forwardRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useEffect,
  useRef,
  useState,
} from 'react'

const DEFAULT_Z_INDEX = 9999

export type StickyDivProps<T extends ElementType = 'div'> = {
  /** Element type to render. Default: `'div'`. */
  as?: T
  /**
   * Distance from the top of the scrollport when stuck.
   * Maps to CSS `top`. Default: `0`.
   */
  offsetTop?: number
  /** Stacking order. Default: `9999`. */
  zIndex?: number
  className?: string
  /** Extra class name applied only while the element is stuck. */
  stuckClassName?: string
  style?: CSSProperties
  /**
   * Called when stuck state changes. `true` when the element is stuck
   * to `offsetTop`. Not called with `false` on mount.
   */
  onFixedChange?: (fixed: boolean) => void
  children?: ReactNode
} & Omit<HTMLAttributes<HTMLElement>, 'as' | 'children' | 'className' | 'style'>

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function getScrollParent(el: Element): Element | null {
  let node = el.parentElement
  while (node && node !== document.documentElement) {
    const style = getComputedStyle(node)
    const overflow = `${style.overflow}${style.overflowY}${style.overflowX}`
    if (/(auto|scroll|overlay)/.test(overflow)) return node
    node = node.parentElement
  }
  return null
}

function StickyDivInner(
  {
    as,
    offsetTop = 0,
    zIndex = DEFAULT_Z_INDEX,
    className,
    stuckClassName,
    style,
    onFixedChange,
    children,
    ...rest
  }: StickyDivProps,
  ref: Ref<HTMLElement>,
): ReactElement {
  const Comp: ElementType = as ?? 'div'
  const sentinelRef = useRef<HTMLSpanElement | null>(null)
  const onFixedChangeRef = useRef(onFixedChange)
  const [stuck, setStuck] = useState(false)

  onFixedChangeRef.current = onFixedChange

  const shouldObserve = onFixedChange != null || Boolean(stuckClassName)

  useEffect(() => {
    if (!shouldObserve) {
      setStuck(false)
      return
    }

    const sentinel = sentinelRef.current
    if (!sentinel) return

    let previous: boolean | null = null
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        const next = !entry.isIntersecting
        setStuck(next)
        if (previous === null) {
          previous = next
          if (next) onFixedChangeRef.current?.(true)
          return
        }
        if (previous !== next) {
          previous = next
          onFixedChangeRef.current?.(next)
        }
      },
      {
        root: getScrollParent(sentinel),
        threshold: 0,
        rootMargin: `-${offsetTop}px 0px 0px 0px`,
      },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [offsetTop, shouldObserve])

  const stickyStyle: CSSProperties = {
    zIndex,
    ...style,
    position: 'sticky',
    top: style?.top ?? offsetTop,
  }

  const stickyClassName = classNames(className, stuck && stuckClassName)

  const sticky = createElement(
    Comp,
    {
      ...rest,
      ref,
      className: stickyClassName || undefined,
      style: stickyStyle,
      'data-stuck': shouldObserve && stuck ? '' : undefined,
    },
    children,
  )

  if (!shouldObserve) return sticky

  return (
    <>
      <span
        ref={sentinelRef}
        aria-hidden="true"
        data-stickydiv-sentinel=""
        style={{
          display: 'block',
          height: 1,
          marginBottom: -1,
          overflow: 'hidden',
          pointerEvents: 'none',
          visibility: 'hidden',
        }}
      />
      {sticky}
    </>
  )
}

/**
 * Sticks its element with CSS `position: sticky`.
 *
 * Children render once. Stuck detection (for `onFixedChange`,
 * `stuckClassName`, and `data-stuck`) uses IntersectionObserver
 * and is skipped when none of those props are passed.
 */
export const StickyDiv = forwardRef(StickyDivInner) as <
  T extends ElementType = 'div',
>(
  props: StickyDivProps<T> & { ref?: Ref<HTMLElement> },
) => ReactElement

;(StickyDiv as { displayName?: string }).displayName = 'StickyDiv'

export default StickyDiv
