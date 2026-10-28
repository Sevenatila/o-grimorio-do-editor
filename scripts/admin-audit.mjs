import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const base = process.env.QA_BASE_URL || 'http://127.0.0.1:5174/'
if (!['127.0.0.1', 'localhost'].includes(new URL(base).hostname)) throw new Error('This mutation audit is restricted to local development.')
const output = new URL('../docs/screenshots/admin/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
const page = await context.newPage()
page.on('dialog', dialog => dialog.accept())
const errors = []
page.on('pageerror', error => errors.push(error.message))
let baseline
let ownedRevision = null
const getSaved = async () => {
  const response = await context.request.get(new URL('/api/content', base).href)
  assert.equal(response.status(), 200)
  return response.json()
}
const writeSaved = async content => {
  const current = await getSaved()
  const response = await context.request.put(new URL('/api/content', base).href, { data: { content, revision: current.revision } })
  assert.equal(response.status(), 200, await response.text())
  const saved = await response.json()
  ownedRevision = saved.revision
  return saved
}
const saveThroughUI = async () => {
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/api/content') && response.request().method() === 'PUT')
  await page.getByRole('button', { name: 'Salvar alterações', exact: true }).click()
  const response = await responsePromise
  assert.equal(response.status(), 200, await response.text())
  ownedRevision = (await response.json()).revision
  await page.getByRole('status').filter({ hasText: 'Alterações salvas' }).waitFor()
}

try {
  await page.goto(new URL('/admin', base).href, { waitUntil: 'networkidle' })
  baseline = (await getSaved()).content || await page.evaluate(async () => (await import('/src/data/content.ts')).defaultContent)
  await page.getByRole('button', { name: 'Textos do site', exact: true }).click()
  await page.getByLabel('Título principal', { exact: true }).fill('Título exclusivo do teste do painel')
  assert.equal((await getSaved()).content?.hero.title || baseline.hero.title, baseline.hero.title, 'Drafts must not publish before Save')
  await page.frameLocator('iframe[title="Prévia personalizável do portfólio"]').getByRole('heading', { level: 1, name: 'Título exclusivo do teste do painel', exact: true }).waitFor()
  await page.waitForFunction(() => localStorage.getItem('grimorio:admin-draft:v1') !== null)
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Textos do site', exact: true }).click()
  assert.equal(await page.getByLabel('Título principal', { exact: true }).inputValue(), 'Título exclusivo do teste do painel')
  await saveThroughUI()
  const visitorContext = await browser.newContext({ reducedMotion: 'reduce' })
  const visitor = await visitorContext.newPage()
  await visitor.goto(base, { waitUntil: 'networkidle' })
  await visitor.getByRole('heading', { level: 1, name: 'Título exclusivo do teste do painel', exact: true }).waitFor()
  await visitorContext.close()
  console.log('Save button and persistence in an independent browser context passed')

  await page.getByRole('button', { name: 'Vídeos', exact: true }).click()
  await page.getByRole('button', { name: 'Adicionar vídeo', exact: true }).click()
  const videoGroup = page.getByRole('group', { name: 'Vídeo ' + (baseline.portfolio.videos.length + 1), exact: true })
  await videoGroup.getByLabel('Link do vídeo', { exact: true }).fill('https://youtu.be/oF7MRtebWHs')
  await videoGroup.getByLabel('Título do vídeo', { exact: true }).fill('Vídeo exclusivo do teste do painel')
  await saveThroughUI()
  assert.equal((await getSaved()).content.portfolio.videos.length, baseline.portfolio.videos.length + 1)
  await page.getByRole('button', { name: 'Mover vídeo ' + (baseline.portfolio.videos.length + 1) + ' para cima', exact: true }).click()
  await saveThroughUI()
  assert.equal((await getSaved()).content.portfolio.videos.at(-2).title, 'Vídeo exclusivo do teste do painel')
  await page.getByRole('button', { name: 'Remover vídeo ' + baseline.portfolio.videos.length, exact: true }).click()
  await saveThroughUI()
  assert.equal((await getSaved()).content.portfolio.videos.length, baseline.portfolio.videos.length)
  console.log('Adding, reordering, removing and saving videos passed')

  await page.getByRole('button', { name: 'Feedbacks', exact: true }).click()
  await page.getByRole('button', { name: 'Adicionar feedback', exact: true }).click()
  const feedbackGroup = page.getByRole('group', { name: 'Feedback ' + (baseline.feedbacks.items.length + 1), exact: true })
  await feedbackGroup.getByLabel('Depoimento escrito', { exact: true }).fill('Texto exclusivo do teste local de administração. Não é um depoimento real.')
  await feedbackGroup.locator('input[type=file]').setInputFiles(fileURLToPath(new URL('../public/assets/testimonials/WhatsApp Image 2026-10-27 at 21.33.41.jpeg', import.meta.url)))
  await page.waitForFunction(() => [...document.querySelectorAll('input')].some(input => input.value.startsWith('/uploads/')))
  await saveThroughUI()
  const feedback = (await getSaved()).content.feedbacks.items.at(-1)
  assert.ok(feedback.image.startsWith('/uploads/'))
  assert.equal((await context.request.get(new URL(feedback.image, base).href)).status(), 200)
  await page.getByRole('button', { name: 'Mover feedback ' + (baseline.feedbacks.items.length + 1) + ' para cima', exact: true }).click()
  await saveThroughUI()
  assert.equal((await getSaved()).content.feedbacks.items.at(-2).id, feedback.id)
  console.log('Feedback editing, image upload, ordering and persistence passed')

  await page.getByRole('button', { name: 'Backup', exact: true }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Exportar backup', exact: true }).click()
  const backup = JSON.parse(await readFile(await (await downloadPromise).path(), 'utf8'))
  assert.equal(backup.format, 'grimorio-site-content')
  backup.content.footer.tagline = 'Frase exclusiva do teste local de backup'
  await page.locator('input[type=file]').setInputFiles({ name: 'admin-backup-test.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) })
  await page.getByRole('status').filter({ hasText: 'Backup importado' }).waitFor()
  await saveThroughUI()
  assert.equal((await getSaved()).content.footer.tagline, backup.content.footer.tagline)
  console.log('Backup export and import passed')

  await page.getByRole('button', { name: 'Aparência', exact: true }).click()
  await page.getByLabel('Bordô e botões hexadecimal', { exact: true }).fill('#603344')
  await page.getByLabel('Exibir Portfólio', { exact: true }).uncheck()
  await saveThroughUI()
  assert.equal((await getSaved()).content.appearance.accent, '#603344')
  assert.equal((await getSaved()).content.visible.portfolio, false)
  const themedContext = await browser.newContext({ reducedMotion: 'reduce' })
  const themedPage = await themedContext.newPage()
  await themedPage.goto(base, { waitUntil: 'networkidle' })
  await themedPage.waitForFunction(() => !document.querySelector('#acervo') && getComputedStyle(document.documentElement).getPropertyValue('--burgundy').trim() === '#603344')
  await themedContext.close()
  console.log('Theme and section visibility passed')

  const stale = await getSaved()
  await writeSaved(stale.content)
  const conflict = await context.request.put(new URL('/api/content', base).href, { data: { content: stale.content, revision: stale.revision } })
  assert.equal(conflict.status(), 409)
  const invalid = JSON.parse(JSON.stringify(stale.content))
  invalid.portfolio.videos[0].url = 'javascript:alert(1)'
  const badRequest = await context.request.put(new URL('/api/content', base).href, { data: { content: invalid, revision: ownedRevision } })
  assert.equal(badRequest.status(), 400)
  const empty = JSON.parse(JSON.stringify(baseline))
  empty.portfolio.videos = []; empty.feedbacks.items = []; empty.hero.featuredId = ''
  await writeSaved(empty)
  const emptyContext = await browser.newContext({ reducedMotion: 'reduce' })
  const emptyPage = await emptyContext.newPage()
  await emptyPage.goto(base, { waitUntil: 'networkidle' })
  await emptyPage.getByText(empty.portfolio.empty, { exact: true }).waitFor()
  await emptyPage.getByText(empty.feedbacks.empty, { exact: true }).waitFor()
  await emptyContext.close()
  console.log('Concurrent save protection, unsafe link rejection and empty lists passed')
  assert.deepEqual(errors, [])
} finally {
  try {
    if (baseline && (await getSaved()).revision === ownedRevision) await writeSaved(baseline)
  } finally { await context.close() }
}

try {
  for (const width of [390, 768, 1440]) {
    const screenshotContext = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' })
    const screenshotPage = await screenshotContext.newPage()
    await screenshotPage.goto(new URL('/admin', base).href, { waitUntil: 'networkidle' })
    await screenshotPage.getByText('Conteúdo salvo', { exact: true }).waitFor()
    const dimensions = await screenshotPage.evaluate(() => ({ width: innerWidth, content: document.documentElement.scrollWidth }))
    assert.ok(dimensions.content <= width, 'Admin must not overflow at ' + width)
    await screenshotPage.screenshot({ path: fileURLToPath(new URL('overview-' + width + '.png', output)), fullPage: true })
    await screenshotPage.getByRole('button', { name: 'Vídeos', exact: true }).click()
    await screenshotPage.screenshot({ path: fileURLToPath(new URL('videos-' + width + '.png', output)), fullPage: true })
    await screenshotPage.getByRole('button', { name: 'Feedbacks', exact: true }).click()
    await screenshotPage.screenshot({ path: fileURLToPath(new URL('feedbacks-' + width + '.png', output)), fullPage: true })
    console.log('Admin layout passed at ' + width)
    await screenshotContext.close()
  }
  await writeFile(new URL('results.json', output), JSON.stringify({ result: 'passed', widths: [390, 768, 1440], persistence: 'independent browser context', videoCrud: 'passed', feedbackCrudAndUpload: 'passed', themeAndVisibility: 'passed', staleRevision: '409', unsafeLink: '400', emptyLists: 'passed', errors, dataPolicy: 'All mutation tests ran only on the local development API; baseline restored.' }, null, 2))
} finally { await browser.close() }
