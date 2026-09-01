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

function trigger(isIntersecting: boolean, index = 0) {
  const instance = observers[index]
  if (!instance) throw new Error('no observer')
  const target = instance.elements[0] ?? document.body
  act(() => {
    instance.callback(
      [
        {
          isIntersecting,
          target,
          time: 0,
          boundingClientRect: target.getBoundingClientRect(),
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: target.getBoundingClientRect(),
          rootBounds: null,
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

    it('calls onFixedChange(true) when the sentinel leaves the root', () => {
      const onFixedChange = vi.fn()
      render(
        <StickyDiv onFixedChange={onFixedChange} stuckClassName="is-stuck">
          header
        </StickyDiv>,
      )
      trigger(true)
      expect(onFixedChange).not.toHaveBeenCalled()
      trigger(false)
      expect(onFixedChange).toHaveBeenCalledTimes(1)
      expect(onFixedChange).toHaveBeenCalledWith(true)
      expect(screen.getByText('header')).toHaveClass('is-stuck')
      expect(screen.getByText('header')).toHaveAttribute('data-stuck', '')
    })

    it('does not re-fire onFixedChange for duplicate stuck notifications', () => {
      const onFixedChange = vi.fn()
      render(<StickyDiv onFixedChange={onFixedChange}>header</StickyDiv>)
      trigger(false)
      trigger(false)
      expect(onFixedChange).toHaveBeenCalledTimes(1)
      expect(onFixedChange).toHaveBeenCalledWith(true)
    })

    it('calls onFixedChange(false) when becoming unstuck', () => {
      const onFixedChange = vi.fn()
      render(<StickyDiv onFixedChange={onFixedChange}>header</StickyDiv>)
      trigger(false)
      trigger(true)
      expect(onFixedChange.mock.calls).toEqual([[true], [false]])
      expect(screen.getByText('header')).not.toHaveAttribute('data-stuck')
    })

    it('fires onFixedChange(true) if already stuck on the first callback', () => {
      const onFixedChange = vi.fn()
      render(<StickyDiv onFixedChange={onFixedChange}>header</StickyDiv>)
      trigger(false)
      expect(onFixedChange).toHaveBeenCalledTimes(1)
      expect(onFixedChange).toHaveBeenCalledWith(true)
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
