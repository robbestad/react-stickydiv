import { act, cleanup, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { StickyDiv } from './StickyDiv'

type ObserverInstance = {
  callback: IntersectionObserverCallback
  observe: ReturnType<typeof vi.fn>
  unobserve: ReturnType<typeof vi.fn>
  disconnect: ReturnType<typeof vi.fn>
  elements: Element[]
  options?: IntersectionObserverInit
}

let observers: ObserverInstance[]

function installObserverMock() {
  observers = []
  const Observer = vi.fn(function MockIntersectionObserver(
    this: void,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    const instance: ObserverInstance = {
      callback,
      options,
      elements: [],
      observe: vi.fn((el: Element) => {
        instance.elements.push(el)
      }),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
    observers.push(instance)
    return instance
  })
  vi.stubGlobal('IntersectionObserver', Observer)
  return Observer
}

function makeRect(
  top: number,
  height: number,
  left = 0,
  width = 1,
): DOMRectReadOnly {
  const bottom = top + height
  const right = left + width
  return {
    x: left,
    y: top,
    top,
    left,
    width,
    height,
    bottom,
    right,
    toJSON() {
      return { x: left, y: top, top, left, width, height, bottom, right }
    },
  }
}

function trigger(
  {
    top,
    height = 1,
    rootTop = 0,
    rootBottom = 800,
    rootBounds: rootBoundsOverride,
  }: {
    top: number
    height?: number
    rootTop?: number
    rootBottom?: number
    rootBounds?: DOMRectReadOnly | null
  },
  index = 0,
) {
  const instance = observers[index]
  if (!instance) throw new Error('no observer')
  const target = instance.elements[0] ?? document.body
  const boundingClientRect = makeRect(top, height)
  const rootBounds =
    rootBoundsOverride === undefined
      ? makeRect(rootTop, rootBottom - rootTop)
      : rootBoundsOverride
  const isIntersecting =
    rootBounds != null &&
    boundingClientRect.bottom > rootBounds.top &&
    boundingClientRect.top < rootBounds.bottom

  act(() => {
    instance.callback(
      [
        {
          isIntersecting,
          target,
          time: 0,
          boundingClientRect,
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: isIntersecting
            ? boundingClientRect
            : makeRect(0, 0),
          rootBounds,
        } satisfies IntersectionObserverEntry,
      ],
      instance as unknown as IntersectionObserver,
    )
  })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('StickyDiv', () => {
  it('renders children once', () => {
    render(
      <StickyDiv>
        <span data-testid="child">hello</span>
      </StickyDiv>,
    )
    expect(screen.getAllByTestId('child')).toHaveLength(1)
  })

  it('applies position sticky and offsetTop', () => {
    render(<StickyDiv offsetTop={24}>header</StickyDiv>)
    const el = screen.getByText('header')
    expect(el).toHaveStyle({ position: 'sticky', top: '24px' })
  })

  it('applies default z-index 9999', () => {
    render(<StickyDiv>header</StickyDiv>)
    expect(screen.getByText('header')).toHaveStyle({ zIndex: '9999' })
  })

  it('always applies className, even when not stuck', () => {
    render(<StickyDiv className="toolbar">header</StickyDiv>)
    expect(screen.getByText('header')).toHaveClass('toolbar')
  })

  it('forwards ref to the sticky element', () => {
    const ref = createRef<HTMLElement>()
    render(<StickyDiv ref={ref}>header</StickyDiv>)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current?.textContent).toBe('header')
  })

  it('renders as a different element', () => {
    render(<StickyDiv as="header">Title</StickyDiv>)
    expect(screen.getByRole('banner')).toHaveTextContent('Title')
  })

  it('does not register IntersectionObserver without onFixedChange or stuckClassName', () => {
    const Observer = installObserverMock()
    render(<StickyDiv>header</StickyDiv>)
    expect(Observer).not.toHaveBeenCalled()
    expect(document.querySelector('[data-stickydiv-sentinel]')).toBeNull()
  })

  describe('stuck detection', () => {
    beforeEach(() => {
      installObserverMock()
    })

    it('observes a sentinel when onFixedChange is passed', () => {
      const onFixedChange = vi.fn()
      render(<StickyDiv onFixedChange={onFixedChange}>header</StickyDiv>)
      expect(observers).toHaveLength(1)
      expect(observers[0]?.observe).toHaveBeenCalledTimes(1)
      expect(document.querySelector('[data-stickydiv-sentinel]')).not.toBeNull()
      expect(onFixedChange).not.toHaveBeenCalled()
    })

    it('uses an overflow ancestor as the observer root', () => {
      const onFixedChange = vi.fn()
      const { container } = render(
        <div data-testid="scroller" style={{ overflow: 'auto', height: 120 }}>
          <StickyDiv onFixedChange={onFixedChange}>header</StickyDiv>
        </div>,
      )
      const scroller = container.querySelector('[data-testid="scroller"]')
      expect(observers[0]?.options?.root).toBe(scroller)
    })

    it('insets the observer root by offsetTop', () => {
      render(
        <StickyDiv offsetTop={24} onFixedChange={() => undefined}>
          header
        </StickyDiv>,
      )
      expect(observers[0]?.options?.rootMargin).toBe('-24px 0px 100000% 0px')
    })

    it('does not emit an invalid rootMargin for a negative offsetTop', () => {
      render(
        <StickyDiv offsetTop={-8} onFixedChange={() => undefined}>
          header
        </StickyDiv>,
      )
      expect(observers[0]?.options?.rootMargin).toBe('8px 0px 100000% 0px')
    })

    it('does not treat a sentinel still below the root as stuck', () => {
      const onFixedChange = vi.fn()
      render(
        <StickyDiv onFixedChange={onFixedChange} stuckClassName="is-stuck">
          header
        </StickyDiv>,
      )
      trigger({ top: 2000 })
      expect(onFixedChange).not.toHaveBeenCalled()
      expect(screen.getByText('header')).not.toHaveClass('is-stuck')
      expect(screen.getByText('header')).not.toHaveAttribute('data-stuck')
    })

    it('does not apply stuck styles while the sentinel is inside the root', () => {
      const onFixedChange = vi.fn()
      render(
        <StickyDiv onFixedChange={onFixedChange} stuckClassName="is-stuck">
          header
        </StickyDiv>,
      )
      trigger({ top: 40 })
      expect(onFixedChange).not.toHaveBeenCalled()
      expect(screen.getByText('header')).not.toHaveClass('is-stuck')
      expect(screen.getByText('header')).not.toHaveAttribute('data-stuck')
    })

    it('calls onFixedChange(true) when the sentinel crosses the top offset', () => {
      const onFixedChange = vi.fn()
      render(
        <StickyDiv onFixedChange={onFixedChange} stuckClassName="is-stuck">
          header
        </StickyDiv>,
      )
      trigger({ top: 40 })
      expect(onFixedChange).not.toHaveBeenCalled()
      trigger({ top: -10 })
      expect(onFixedChange).toHaveBeenCalledTimes(1)
      expect(onFixedChange).toHaveBeenCalledWith(true)
      expect(screen.getByText('header')).toHaveClass('is-stuck')
      expect(screen.getByText('header')).toHaveAttribute('data-stuck', '')
    })

    it('does not re-fire onFixedChange for duplicate stuck notifications', () => {
      const onFixedChange = vi.fn()
      render(<StickyDiv onFixedChange={onFixedChange}>header</StickyDiv>)
      trigger({ top: -10 })
      trigger({ top: -20 })
      expect(onFixedChange).toHaveBeenCalledTimes(1)
      expect(onFixedChange).toHaveBeenCalledWith(true)
    })

    it('calls onFixedChange(false) when becoming unstuck', () => {
      const onFixedChange = vi.fn()
      render(<StickyDiv onFixedChange={onFixedChange}>header</StickyDiv>)
      trigger({ top: -10 })
      trigger({ top: 40 })
      expect(onFixedChange.mock.calls).toEqual([[true], [false]])
      expect(screen.getByText('header')).not.toHaveAttribute('data-stuck')
    })

    it('fires onFixedChange(true) if already stuck on the first callback', () => {
      const onFixedChange = vi.fn()
      render(<StickyDiv onFixedChange={onFixedChange}>header</StickyDiv>)
      trigger({ top: -10 })
      expect(onFixedChange).toHaveBeenCalledTimes(1)
      expect(onFixedChange).toHaveBeenCalledWith(true)
    })

    it('treats a missing rootBounds as the viewport origin', () => {
      const onFixedChange = vi.fn()
      render(
        <StickyDiv onFixedChange={onFixedChange} stuckClassName="is-stuck">
          header
        </StickyDiv>,
      )
      trigger({ top: 2000, rootBounds: null })
      expect(onFixedChange).not.toHaveBeenCalled()
      trigger({ top: -10, rootBounds: null })
      expect(onFixedChange).toHaveBeenCalledWith(true)
      expect(screen.getByText('header')).toHaveClass('is-stuck')
    })

    it('disconnects the observer on unmount', () => {
      const { unmount } = render(
        <StickyDiv onFixedChange={() => undefined}>header</StickyDiv>,
      )
      expect(observers[0]?.disconnect).not.toHaveBeenCalled()
      unmount()
      expect(observers[0]?.disconnect).toHaveBeenCalledTimes(1)
    })
  })

  it('is safe to render to string without window observers', () => {
    const html = renderToString(
      <StickyDiv offsetTop={8} className="nav">
        server
      </StickyDiv>,
    )
    expect(html).toContain('server')
    expect(html).toContain('sticky')
    expect(html).toContain('nav')
  })
})

describe('default export', () => {
  it('is the same component as the named export', async () => {
    const mod = await import('./index')
    expect(mod.default).toBe(mod.StickyDiv)
  })
})
