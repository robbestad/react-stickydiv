import { useState } from 'react'
import { StickyDiv } from 'react-stickydiv'

const paragraphs = Array.from({ length: 12 }, (_, i) => i)

export function App() {
  const [pageStuck, setPageStuck] = useState(false)
  const [nestedStuck, setNestedStuck] = useState(false)
  const [belowFoldStuck, setBelowFoldStuck] = useState(false)

  return (
    <div className="page">
      <StickyDiv
        as="header"
        className="page-header"
        stuckClassName="is-stuck"
        zIndex={20}
        onFixedChange={setPageStuck}
        data-testid="page-header"
      >
        <div className="page-header-inner">
          <strong>react-stickydiv</strong>
          <span data-testid="stuck-label" className="status">
            {pageStuck ? 'stuck' : 'inline'}
          </span>
        </div>
      </StickyDiv>

      <main className="main">
        <p className="lede">
          Scroll the page. The header uses CSS <code>position: sticky</code> and
          reports stuck state through <code>onFixedChange</code>.
        </p>

        {paragraphs.map((n) => (
          <p key={n}>
            Section {n + 1}. Sticky positioning keeps the header in the document
            flow, so layout does not jump and children are not duplicated.
          </p>
        ))}

        <section className="panel">
          <h2>Nested scroller</h2>
          <p>
            CSS sticky is scoped to the nearest scroll ancestor. Scroll inside
            this box — not the page — to stick the inner bar.
          </p>
          <div className="scroller" data-testid="nested-scroller">
            <StickyDiv
              className="nested-header"
              stuckClassName="is-stuck"
              zIndex={1}
              onFixedChange={setNestedStuck}
              data-testid="nested-sticky"
            >
              Nested sticky
              <span data-testid="nested-stuck-label" className="status">
                {nestedStuck ? 'stuck' : 'inline'}
              </span>
            </StickyDiv>
            {paragraphs.map((n) => (
              <p key={n}>Nested row {n + 1}.</p>
            ))}
          </div>
        </section>

        <section className="panel warning">
          <h2>Overflow caveat</h2>
          <p>
            An ancestor with <code>overflow: hidden</code> (or <code>auto</code>
            /<code>scroll</code>) that is not the intended scroller prevents
            sticking. Move the overflow, or use <code>overflow: clip</code> when
            you only need to clip paint.
          </p>
        </section>

        {paragraphs.map((n) => (
          <p key={`after-${n}`}>
            More page content {n + 1}, so you can scroll past the nested example
            and unstick the header.
          </p>
        ))}

        <div className="below-fold-spacer" data-testid="below-fold-spacer" />

        <StickyDiv
          className="below-fold-header"
          stuckClassName="is-stuck"
          onFixedChange={setBelowFoldStuck}
          data-testid="below-fold-sticky"
        >
          Below-fold sticky
          <span data-testid="below-fold-stuck-label" className="status">
            {belowFoldStuck ? 'stuck' : 'inline'}
          </span>
        </StickyDiv>

        <div className="below-fold-tail" data-testid="below-fold-tail" />
      </main>
    </div>
  )
}
