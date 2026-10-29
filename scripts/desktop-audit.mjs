import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173/'
const output = new URL('../docs/screenshots/desktop/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
const results = []
const errors = []
const screenshotStyle = '.skip-link:not(:focus){visibility:hidden}'
try {
  for (const width of [390, 768, 1024, 1050, 1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    const requestedArt = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('request', request => { if (request.url().includes('/assets/art/')) requestedArt.push(request.url()) })
    await page.route('https://**/*', route => /fonts\.(googleapis|gstatic)\.com/.test(route.request().url()) ? route.continue() : route.abort())
    await page.goto(base, { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      await document.fonts.ready
      await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}) }))
    })
    const dimensions = await page.evaluate(() => {
      const rect = selector => {
        const box = document.querySelector(selector).getBoundingClientRect()
        return { x: box.x, y: box.y, width: box.width, height: box.height, right: box.right }
      }
      return {
        viewport: innerWidth, content: document.documentElement.scrollWidth, fontSource: document.documentElement.dataset.fontSource,
        hero: rect('.hero'), heroCopy: rect('.hero-copy'), heroVideo: rect('.hero-video'), header: rect('.header'), identity: rect('.identity'), navigation: rect('.navigation'),
        player: rect('.hero-video .youtube-player'), epilogueImage: rect('.epilogue-art img'),
        epilogueSource: document.querySelector('.epilogue-art img').currentSrc,
        backdropSource: document.querySelector('.hero-backdrop img')?.currentSrc,
        headingsOverflow: [...document.querySelectorAll('h1,h2,h3')].some(element => element.scrollWidth > element.clientWidth + 1),
        failedImages: [...document.images].filter(image => image.getBoundingClientRect().width > 0 && (!image.complete || !image.naturalWidth)).map(image => image.currentSrc),
      }
    })
    assert.ok(dimensions.content <= width, 'No page overflow at ' + width)
    assert.equal(dimensions.headingsOverflow, false, 'No clipped headings at ' + width)
    assert.deepEqual(dimensions.failedImages, [])
    assert.ok(Math.abs(dimensions.player.width / dimensions.player.height - 9 / 16) < .01)
    if (width >= 1050) {
      assert.ok(dimensions.header.height < 120)
      assert.ok(dimensions.identity.right + 16 <= dimensions.navigation.x, 'Desktop menu stays clear of identity')
      assert.ok(dimensions.navigation.right <= dimensions.header.right)
      assert.ok(dimensions.hero.height < 730, 'Desktop hero fits within a useful first viewport')
      assert.ok(dimensions.heroCopy.right < dimensions.heroVideo.x)
      assert.match(dimensions.backdropSource, /hero-editor-desktop/)
      assert.match(dimensions.epilogueSource, /epilogue-desk-desktop/)
      assert.ok(Math.abs(dimensions.epilogueImage.width / dimensions.epilogueImage.height - 3 / 2) < .01)
      const choices = page.locator('.portfolio-playlist button')
      assert.equal(await choices.count(), 6)
      await choices.nth(1).click()
      await page.locator('.portfolio-stage .youtube-launch img').evaluate(image => image.decode())
      assert.match(await page.locator('.portfolio-stage .youtube-launch img').getAttribute('src'), /9FwdP60SSpc/)
      await page.waitForFunction(() => document.activeElement?.matches('.portfolio-playlist button[aria-pressed="true"]'))
      await choices.nth(2).focus()
      await page.keyboard.press('Enter')
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Selecionar Profissão Closer Digital - Jesse' && document.activeElement?.getAttribute('aria-pressed') === 'true')
      assert.match(await page.locator('.portfolio-stage .youtube-launch img').getAttribute('src'), /QstQJOrkq2k/)
      await choices.first().click()
    } else {
      assert.ok(dimensions.heroVideo.y < dimensions.heroCopy.y)
      assert.equal(await page.locator('.portfolio-playlist').isVisible(), false)
      assert.equal(requestedArt.some(url => url.includes('-desktop')), false, 'Mobile does not download desktop artwork')
      assert.ok(Math.abs(dimensions.epilogueImage.width / dimensions.epilogueImage.height - 2) < .01)
    }
    await page.screenshot({ path: fileURLToPath(new URL('viewport-' + width + '.png', output)), fullPage: true, style: screenshotStyle })
    if (width === 1440) for (const name of ['hero', 'journey', 'portfolio', 'epilogue']) await page.locator('.' + name).screenshot({ path: fileURLToPath(new URL(name + '-1440.png', output)), style: screenshotStyle })
    results.push({ ...dimensions, navigationAndSources: 'passed', externalPlayback: 'covered by qa:youtube' })
    console.log('Desktop and responsive layout passed at ' + width + 'px')
    await page.close()
  }

  // An older backup with a custom contact image must retain its custom content.
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const existing = await (await page.request.get(new URL('/api/content', base).href)).json()
  const legacy = structuredClone(existing.content)
  assert.ok(legacy, 'Local content baseline is required for the compatibility check')
  delete legacy.hero.desktopBackdrop
  delete legacy.contact.desktopImage
  legacy.hero.title = 'Título personalizado preservado na versão anterior'
  legacy.contact.image = '/assets/art/journey-city-mobile.webp'
  await page.route('**/api/content', route => route.fulfill({ json: { ...existing, content: legacy } }))
  await page.route('https://**/*', route => route.abort())
  await page.goto(base, { waitUntil: 'networkidle' })
  await page.getByRole('heading', { level: 1, name: legacy.hero.title, exact: true }).waitFor()
  assert.equal(await page.locator('.epilogue-art source').count(), 0)
  assert.match(await page.locator('.epilogue-art img').getAttribute('src'), /journey-city-mobile/)
  assert.equal(await page.locator('.hero-backdrop source').count(), 1)
  await page.close()
  assert.deepEqual(errors, [])
  await writeFile(new URL('results.json', output), JSON.stringify({ result: 'passed', legacyCustomization: 'preserved without server mutations', errors, viewports: results }, null, 2))
} finally { await browser.close() }
