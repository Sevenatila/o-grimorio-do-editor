import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const output = new URL(pathToFileURL(resolve(process.env.QA_OUTPUT_DIR || 'docs/screenshots/one-click')).href + '/')
const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5173/'
const english = /^\/en(?:\/|$)/.test(new URL(base).pathname)
const labels = english ? { back: 'Back to cover', cta: 'Watch my showreel', next: 'Next project' } : { back: 'Voltar à capa', cta: 'Assista ao demoreel', next: 'Próximo projeto' }
const ids = ['oF7MRtebWHs', '9FwdP60SSpc', 'QstQJOrkq2k', 'rwz_finz-Y0', 'fCXZFommLOA', 'bnOoqp2OafA']
await mkdir(output, { recursive: true })
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--disable-features=PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies'],
})
const results = []

// Observe playback only. Never click inside YouTube or invoke play() from the test.
async function observePlayback(card, id) {
  assert.ok((await card.locator('iframe').getAttribute('src')).includes(`/embed/${id}?`))
  const video = card.frameLocator('iframe').locator('video').first()
  await video.waitFor({ state: 'attached', timeout: 25000 })
  await video.evaluate(element => new Promise((resolve, reject) => {
    const start = performance.now()
    const check = () => {
      if (element.currentTime > .5 && !element.paused && !element.muted && element.volume > 0) return resolve()
      if (performance.now() - start > 20000) return reject(new Error(`No audible playback after a single user action: time=${element.currentTime}, paused=${element.paused}, muted=${element.muted}`))
      setTimeout(check, 200)
    }
    check()
  }))
  return video.evaluate(element => ({ time: element.currentTime, paused: element.paused, muted: element.muted, volume: element.volume }))
}

try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: { width: mobile ? 390 : 1440, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto(base, { waitUntil: 'domcontentloaded' })
    const activate = async locator => mobile ? locator.tap() : locator.click()
    const hero = page.locator('.hero-video')
    assert.equal(await page.locator('.youtube-card.is-playing').count(), 0)
    await activate(hero.locator('.youtube-launch'))
    results.push({ mobile, action: 'one cover click/tap', id: '9FwdP60SSpc', ...(await observePlayback(hero, '9FwdP60SSpc')) })
    console.log(`Main video: one ${mobile ? 'tap' : 'click'} with sound passed`)

    await activate(hero.getByRole('button', { name: labels.back }))
    await activate(page.getByRole('link', { name: labels.cta }))
    results.push({ mobile, action: 'one presentation CTA click/tap', id: '9FwdP60SSpc', ...(await observePlayback(hero, '9FwdP60SSpc')) })

    if (!mobile) {
      await hero.getByRole('button', { name: labels.back }).click()
      await hero.locator('.youtube-launch').press('Enter')
      results.push({ mobile, action: 'one Enter key', id: '9FwdP60SSpc', ...(await observePlayback(hero, '9FwdP60SSpc')) })
    }

    const gallery = page.locator('.portfolio-stage')
    for (const id of ids) {
      await activate(gallery.locator('.youtube-launch'))
      results.push({ mobile, action: 'one gallery cover click/tap', id, ...(await observePlayback(gallery, id)) })
      assert.equal(await page.locator('.hero-video.is-playing').count(), 0)
      assert.ok(await hero.frameLocator('iframe').locator('video').first().evaluate(element => element.paused), 'The previous video must stop')
      console.log(`${id}: one ${mobile ? 'tap' : 'click'} with sound passed`)
      await activate(page.getByRole('button', { name: labels.next, exact: true }))
    }
    await context.close()
  }
  await writeFile(new URL('playback.json', output), JSON.stringify({ base, results, testPolicy: 'Fresh contexts, no autoplay-policy bypass, one user action, no internal clicks or test-triggered play commands.' }, null, 2))
  console.log(`Passed ${results.length} playback cases with one user action and sound`)
} finally {
  await browser.close()
}
