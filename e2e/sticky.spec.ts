import { expect, test } from '@playwright/test'

test('page header sticks after scrolling past it', async ({ page }) => {
  await page.goto('/')
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
  await expect(page.getByTestId('page-header')).not.toHaveAttribute(
    'data-stuck',
    '',
  )
  await expect(page.getByTestId('nested-stuck-label')).toHaveText('inline')
})

test('nested sticky follows the inner scroller', async ({ page }) => {
  await page.goto('/')
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
