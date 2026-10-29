import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5174/'
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) throw new Error('The English editing audit is restricted to local development.')
const output = new URL('../docs/screenshots/english/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
await context.route('https://**/*', route => /fonts\.(googleapis|gstatic)\.com/.test(route.request().url()) ? route.continue() : route.abort())
const errors = []
context.on('page', page => page.on('pageerror', error => errors.push(error.message)))
const saved = async () => {
  const response = await context.request.get(new URL('/api/content', base).href)
  assert.equal(response.status(), 200)
  return response.json()
}
let baseline
let revision
const put = async content => {
  const response = await context.request.put(new URL('/api/content', base).href, { data: { content, revision } })
  assert.equal(response.status(), 200, await response.text())
  const result = await response.json()
  revision = result.revision
  return result.content
}
const report = { widths: [], errors, editing: 'pending', sharedMedia: 'pending', dataPolicy: 'Local mutation tests only; original content restored.' }
try {
  const setup = await context.newPage()
  await setup.goto(base, { waitUntil: 'networkidle' })
  const initial = await saved()
  revision = initial.revision
  baseline = await setup.evaluate(async content => {
    const { parseContent } = await import('/src/lib/content-model.ts')
    const { defaultContent } = await import('/src/data/content.ts')
    return parseContent(content || defaultContent)
  }, initial.content)
  await setup.close()

  for (const width of [320, 390, 768, 1050, 1280, 1440, 1920]) {
    const page = await context.newPage()
    await page.setViewportSize({ width, height: 900 })
    await page.goto(new URL('/en', base).href, { waitUntil: 'networkidle' })
    await page.getByRole('heading', { level: 1, name: baseline.english.hero.title, exact: true }).waitFor()
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => { image.loading = 'eager'; return image.decode().catch(() => {}) })) })
    assert.equal(await page.locator('html').getAttribute('lang'), 'en')
    assert.ok((await page.title()).includes(baseline.english.general.name))
    assert.equal(await page.locator('.skill-card').count(), 7)
    const metrics = await page.evaluate(() => {
      const identity = document.querySelector('.identity').getBoundingClientRect()
      const navigation = document.querySelector('.navigation').getBoundingClientRect()
      const tools = document.querySelector('.header-tools').getBoundingClientRect()
      return { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, menuFont: getComputedStyle(document.querySelector('.navigation a')).fontSize, identityRight: identity.right, navigationLeft: navigation.x, navigationRight: navigation.right, toolsLeft: tools.x, headingOverflow: [...document.querySelectorAll('h1,h2,h3')].some(h => h.scrollWidth > h.clientWidth + 1) }
    })
    assert.ok(metrics.scrollWidth <= width)
    assert.equal(metrics.headingOverflow, false)
    assert.doesNotMatch(await page.locator('main').innerText(), /Assista ao demoreel|Ver conversa completa|Dos Clientes|Uma história em movimento/)
    assert.match(await page.locator('.hero-video iframe').getAttribute('src'), /hl=en/)
    if (width >= 1050) {
      assert.ok(Number.parseFloat(metrics.menuFont) >= 12)
      assert.ok(metrics.identityRight + 10 < metrics.navigationLeft)
      assert.ok(metrics.navigationRight + 10 < metrics.toolsLeft)
      await page.locator('.portfolio-playlist button').nth(1).click()
      assert.match(await page.locator('.portfolio-stage .youtube-launch img').getAttribute('src'), /9FwdP60SSpc/)
    } else {
      await page.getByRole('button', { name: 'Open menu', exact: true }).click()
      await page.locator('.navigation a').first().focus()
      await page.keyboard.press('Escape')
      assert.equal(await page.getByRole('button', { name: 'Open menu', exact: true }).getAttribute('aria-expanded'), 'false')
    }
    await page.getByRole('button', { name: 'Expand testimonial 1', exact: true }).click()
    await page.getByRole('heading', { name: 'Client testimonial', exact: true }).waitFor()
    assert.equal(await page.locator('.feedback-dialog img').getAttribute('src'), baseline.feedbacks.items[0].image)
    await page.keyboard.press('Escape')
    if ([390, 768, 1440, 1920].includes(width)) await page.screenshot({ path: fileURLToPath(new URL('viewport-' + width + '.png', output)), fullPage: true, style: '.skip-link:not(:focus){visibility:hidden}' })
    await page.locator('.header').screenshot({ path: fileURLToPath(new URL('header-' + width + '.png', output)) })
    await page.getByRole('link', { name: 'Ver site em português', exact: true }).click()
    await page.getByRole('heading', { level: 1, name: baseline.hero.title, exact: true }).waitFor()
    assert.equal(await page.locator('html').getAttribute('lang'), 'pt-BR')
    await page.getByRole('link', { name: 'View site in English', exact: true }).focus()
    await page.keyboard.press('Enter')
    await page.getByRole('heading', { level: 1, name: baseline.english.hero.title, exact: true }).waitFor()
    report.widths.push(metrics)
    await page.close()
    console.log('English layout, controls and language switching passed at ' + width)
  }

  for (const width of [390, 768, 1440]) {
    const page = await context.newPage()
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(new URL('/admin', base).href, { waitUntil: 'networkidle' })
    await page.getByRole('button', { name: 'Versão em inglês', exact: true }).click()
    await page.getByLabel('Título principal em inglês', { exact: true }).waitFor()
    if (await page.locator('.admin-preview').isVisible()) await page.frameLocator('iframe[title="Prévia personalizável do portfólio"]').getByRole('heading', { level: 1, name: baseline.english.hero.title, exact: true }).waitFor()
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.screenshot({ path: fileURLToPath(new URL('admin-' + width + '.png', output)), fullPage: true })
    await page.close()
  }
  const admin = await context.newPage()
  await admin.goto(new URL('/admin', base).href, { waitUntil: 'networkidle' })
  await admin.getByRole('button', { name: 'Versão em inglês', exact: true }).click()
  await admin.getByLabel('Título principal em inglês', { exact: true }).fill('English title used only in the local editing test')
  await admin.frameLocator('iframe[title="Prévia personalizável do portfólio"]').getByRole('heading', { name: 'English title used only in the local editing test', level: 1, exact: true }).waitFor()
  assert.equal((await saved()).revision, revision, 'English draft must not publish before Save')
  await admin.waitForFunction(() => localStorage.getItem('grimorio:admin-draft:v1')?.includes('English title used only'))
  await admin.reload({ waitUntil: 'networkidle' })
  await admin.getByRole('button', { name: 'Versão em inglês', exact: true }).click()
  assert.equal(await admin.getByLabel('Título principal em inglês', { exact: true }).inputValue(), 'English title used only in the local editing test')
  const saveUI = async () => {
    const pending = admin.waitForResponse(response => response.url().endsWith('/api/content') && response.request().method() === 'PUT')
    await admin.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
    const response = await pending
    assert.equal(response.status(), 200, await response.text())
    revision = (await response.json()).revision
    await admin.getByRole('status').filter({ hasText: 'Alterações salvas' }).waitFor()
    await admin.waitForFunction(() => localStorage.getItem('grimorio:admin-draft:v1') === null)
  }
  await saveUI()
  const after = (await saved()).content
  const { english: beforeEnglish, ...beforePortuguese } = baseline
  const { english: afterEnglish, ...afterPortuguese } = after
  assert.deepEqual(afterPortuguese, beforePortuguese, 'English editing must preserve Portuguese content')
  const legacySave = structuredClone(after)
  delete legacySave.english
  const compatible = await put(legacySave)
  assert.deepEqual(compatible.english, afterEnglish, 'A legacy admin save must preserve existing English translations')
  // Refresh the editor revision after the simulated save from an older client.
  await admin.reload({ waitUntil: 'networkidle' })
  await admin.getByRole('button', { name: 'Versão em inglês', exact: true }).click()
  const independent = await browser.newContext({ reducedMotion: 'reduce' })
  await independent.route('https://**/*', route => route.abort())
  const visitor = await independent.newPage()
  await visitor.goto(new URL('/en', base).href, { waitUntil: 'networkidle' })
  await visitor.getByRole('heading', { level: 1, name: after.english.hero.title, exact: true }).waitFor()
  await visitor.goto(base, { waitUntil: 'networkidle' })
  await visitor.getByRole('heading', { level: 1, name: baseline.hero.title, exact: true }).waitFor()
  await independent.close()

  await admin.getByRole('button', { name: 'Títulos dos vídeos', exact: true }).click()
  const firstVideo = admin.locator('.admin-skill').first()
  await firstVideo.locator('summary').click()
  await firstVideo.getByLabel('Título do vídeo em inglês', { exact: true }).fill('Video title used only in the local editing test')
  await saveUI()
  await admin.getByRole('button', { name: 'Textos dos feedbacks', exact: true }).click()
  const firstFeedback = admin.locator('.admin-skill').first()
  await firstFeedback.locator('summary').click()
  await firstFeedback.getByLabel('Depoimento em inglês', { exact: true }).fill('Feedback text used only in the local editing test')
  await saveUI()
  const feedbackView = await context.newPage()
  await feedbackView.goto(new URL('/en', base).href, { waitUntil: 'networkidle' })
  await feedbackView.getByRole('button', { name: 'Expand testimonial 1', exact: true }).click()
  await feedbackView.getByText('Feedback text used only in the local editing test', { exact: true }).waitFor()
  assert.equal(await feedbackView.locator('.feedback-dialog img').getAttribute('src'), baseline.feedbacks.items[0].image)
  await feedbackView.close()
  const changed = structuredClone((await saved()).content)
  const first = changed.portfolio.videos.shift()
  first.url = 'https://www.youtube.com/shorts/bnOoqp2OafA'
  changed.portfolio.videos.push(first)
  const shared = await put(changed)
  assert.equal(shared.english.portfolio.videos.at(-1).title, 'Video title used only in the local editing test')
  for (const pathname of ['/', '/en']) {
    const page = await context.newPage()
    await page.goto(new URL(pathname, base).href, { waitUntil: 'networkidle' })
    await page.locator('.gallery-dots button').last().click()
    assert.match(await page.locator('.portfolio-stage iframe').getAttribute('src'), /\/embed\/bnOoqp2OafA\?/)
    if (pathname === '/en') await page.getByRole('heading', { name: 'Video title used only in the local editing test', exact: true }).waitFor()
    await page.close()
  }
  report.editing = 'English draft, preview, recovery, Save and independent browser passed; Portuguese preserved'
  report.sharedMedia = 'Shared URL and translation preserved by ID after reorder'
  assert.deepEqual(errors, [])
} finally {
  try { if (baseline && (await saved()).revision === revision) await put(baseline) }
  finally { await context.close(); await browser.close() }
}
await writeFile(new URL('results.json', output), JSON.stringify({ result: 'passed', ...report }, null, 2))
console.log('English administration and shared media passed; local content restored')
