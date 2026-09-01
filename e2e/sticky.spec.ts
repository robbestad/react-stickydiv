import { expect, test } from '@playwright/test'

test('page header sticks after scrolling past it', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/react-stickydiv/)
  const header = page.getByTestId('page-header')
  const label = page.getByTestId('stuck-label')

  await expect(label).toHaveText('inline')
  await expect(header).not.toHaveAttribute('data-stuck', '')

  await page.evaluate(() => window.scrollTo(0, 900))

  await expect(label).toHaveText('stuck')
  await expect(header).toHaveAttribute('data-stuck', '')

  const box = await header.boundingBox()
  expect(box).toBeTruthy()
  expect(box?.y ?? 99).toBeLessThan(2)

  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(label).toHaveText('inline')
  await expect(header).not.toHaveAttribute('data-stuck', '')
})

test('nested sticky is not stuck just because it is below the fold', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/react-stickydiv/)
  await expect(page.getByTestId('page-header')).not.toHaveAttribute(
    'data-stuck',
    '',
  )
  await expect(page.getByTestId('nested-stuck-label')).toHaveText('inline')
})

test('page sticky below the fold is not stuck until scrolled to', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/react-stickydiv/)
  const sticky = page.getByTestId('below-fold-sticky')
  const label = page.getByTestId('below-fold-stuck-label')
  const viewport = page.viewportSize()

  const box = await sticky.boundingBox()
  expect(box).toBeTruthy()
  expect(box?.y ?? 0).toBeGreaterThan(viewport?.height ?? 0)

  // Flush layout + the first IntersectionObserver callback. A sentinel
  // still below the viewport must not flip the label to "stuck".
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 0)
          })
        })
      }),
  )

  await expect(label).toHaveText('inline')
  await expect(sticky).not.toHaveAttribute('data-stuck', '')

  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="below-fold-sticky"]')
    if (!(el instanceof HTMLElement)) return
    const top = el.getBoundingClientRect().top + window.scrollY
    window.scrollTo(0, top + 80)
  })

  await expect(label).toHaveText('stuck')
  await expect(sticky).toHaveAttribute('data-stuck', '')

  await page.evaluate(() => window.scrollTo(0, 0))
  await expect(label).toHaveText('inline')
  await expect(sticky).not.toHaveAttribute('data-stuck', '')
})

test('nested sticky follows the inner scroller', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/react-stickydiv/)
  const scroller = page.getByTestId('nested-scroller')
  const nested = page.getByTestId('nested-sticky')
  const label = page.getByTestId('nested-stuck-label')

  await scroller.scrollIntoViewIfNeeded()
  await expect(label).toHaveText('inline')

  await scroller.evaluate((el) => {
    el.scrollTop = 400
  })

  await expect(label).toHaveText('stuck')
  await expect(nested).toHaveAttribute('data-stuck', '')

  const scrollerBox = await scroller.boundingBox()
  const nestedBox = await nested.boundingBox()
  expect(scrollerBox && nestedBox).toBeTruthy()
  if (scrollerBox && nestedBox) {
    expect(Math.abs(nestedBox.y - scrollerBox.y)).toBeLessThan(4)
  }

  await scroller.evaluate((el) => {
    el.scrollTop = 0
  })
  await expect(label).toHaveText('inline')
})
