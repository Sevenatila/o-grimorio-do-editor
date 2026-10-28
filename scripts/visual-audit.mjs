import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const output = new URL('../docs/screenshots/', import.meta.url)
await mkdir(output, { recursive: true })
console.log('Launching Chromium')
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, timeout: 20000 })
console.log('Browser ready')
const results = []
try {
  for (const width of [390, 768, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    console.log(`Auditing ${width}px`)
    await page.route('https://**/*', route => route.abort())
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForFunction(() => document.documentElement.dataset.fontSource)
    await page.evaluate(() => document.fonts.ready)
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth, headings: [...document.querySelectorAll('h2')].map(heading => heading.textContent), skills: document.querySelectorAll('.skill-card').length, fontSource: document.documentElement.dataset.fontSource, loadedFontFaces: [...document.fonts].filter(face => face.status === 'loaded').map(face => face.family), heroVideo: document.querySelector('.hero-video').getBoundingClientRect().top, heroText: document.querySelector('.hero-copy').getBoundingClientRect().top }))
    assert.ok(dimensions.content <= width, `Overflow at ${width}px`)
    assert.equal(dimensions.skills, 7)
    assert.deepEqual(dimensions.headings, ['De onde vim e onde cheguei: A Jornada', 'Acervo de contos Portfólio', 'O meu arsenal O Grimório', 'Feedbacks Dos Clientes', 'Vamos contar A Sua História?'])
    if (width < 1050) {
      assert.ok(dimensions.heroVideo < dimensions.heroText)
      const menu = page.locator('.menu-toggle')
      await menu.click()
      await page.getByRole('button', { name: 'Fechar menu' }).waitFor()
      assert.equal(await menu.getAttribute('aria-expanded'), 'true')
      await page.locator('#main-navigation a').first().focus()
      await page.keyboard.press('Escape')
      await page.getByRole('button', { name: 'Abrir menu' }).waitFor()
      assert.equal(await menu.getAttribute('aria-expanded'), 'false')
      assert.ok(await menu.evaluate(element => element === document.activeElement))
    }
    await page.getByRole('button', { name: 'Próximo projeto', exact: true }).click()
    await page.getByRole('heading', { name: 'A essência de uma marca' }).waitFor()
    await page.getByRole('button', { name: 'Comercial', exact: true }).click()
    await page.getByRole('heading', { name: 'Cada quadro, uma intenção' }).waitFor()
    await page.getByRole('button', { name: 'Todos', exact: true }).click()
    assert.equal(await page.locator('.feedback-card').count(), 15)
    const feedbackImages = await page.locator('.feedback-preview img').evaluateAll(async images => {
      await Promise.all(images.map(async element => {
        const image = new Image()
        image.src = element.src
        await image.decode()
      }))
      return images.length
    })
    assert.equal(feedbackImages, 15)
    await page.getByRole('button', { name: 'Próximo feedback', exact: true }).click()
    await page.waitForFunction(() => document.querySelector('#feedback-track').scrollLeft > 50)
    await page.locator('#feedback-track').evaluate(track => track.scrollTo({ left: track.scrollWidth, behavior: 'instant' }))
    await page.getByRole('button', { name: 'Ampliar feedback 15', exact: true }).click()
    await page.locator('.feedback-dialog[open] img').waitFor()
    assert.match(await page.locator('.feedback-dialog img').getAttribute('src'), /21\.33\.44/)
    await page.keyboard.press('Escape')
    await page.locator('.feedback-dialog').waitFor({ state: 'hidden' })
    assert.ok(await page.getByRole('button', { name: 'Ampliar feedback 15', exact: true }).evaluate(element => element === document.activeElement))
    await page.locator('#feedback-track').evaluate(track => track.scrollTo({ left: 0, behavior: 'instant' }))
    await page.getByRole('button', { name: 'Ampliar feedback 1', exact: true }).click()
    await page.getByRole('button', { name: 'Fechar feedback ampliado' }).click()
    await page.locator('.feedback-dialog').waitFor({ state: 'hidden' })
    await page.locator('#feedbacks').screenshot({ path: fileURLToPath(new URL(`feedbacks-${width}.png`, output)) })
    await page.getByRole('button', { name: /Escreva o Seu Próximo Capítulo/i }).click()
    assert.match(await page.locator('#contact-notice').innerText(), /disponibilizado em breve/)
    await page.getByRole('button', { name: /Escreva o Seu Próximo Capítulo/i }).click()
    const order = await page.locator('main > section').evaluateAll(elements => elements.map(element => element.id || 'hero'))
    assert.deepEqual(order, ['hero', 'jornada', 'acervo', 'grimorio', 'feedbacks', 'epilogo'])
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.screenshot({ path: fileURLToPath(new URL(`viewport-${width}.png`, output)), fullPage: true })
    assert.deepEqual(errors, [])
    results.push({ width, ...dimensions, errors, order, controls: 'passed', feedbackImages, feedbackModalAndNavigation: 'passed' })
    await page.close()
  }
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
  await page.route('https://**/*', route => route.abort())
  await page.goto('http://127.0.0.1:5173/')
  const media = await page.evaluate(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 320
    canvas.height = 180
    const context = canvas.getContext('2d')
    context.fillStyle = '#722c32'
    context.fillRect(0, 0, 320, 180)
    const stream = canvas.captureStream(10)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' })
    const chunks = []
    recorder.ondataavailable = event => chunks.push(event.data)
    const complete = new Promise(resolve => { recorder.onstop = async () => resolve([...new Uint8Array(await new Blob(chunks).arrayBuffer())]) })
    const started = new Promise(resolve => { recorder.onstart = resolve })
    recorder.start(100)
    await started
    for (let frame = 0; frame < 20; frame++) {
      context.fillStyle = frame % 2 ? '#e8d7b3' : '#722c32'
      context.fillRect(0, 0, 320, 180)
      stream.getVideoTracks()[0].requestFrame()
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    recorder.stop()
    const bytes = await complete
    stream.getTracks().forEach(track => track.stop())
    return bytes
  })
  assert.ok(media.length > 100, 'Synthetic video must contain recorded frames')
  await page.locator('.hero-video input[type=file]').setInputFiles({ name: 'qa-synthetic.webm', mimeType: 'video/webm', buffer: Buffer.from(media) })
  await page.waitForFunction(() => document.querySelector('#demoreel-player').src.startsWith('blob:'))
  const video = page.locator('#demoreel-player')
  await video.evaluate(async element => { element.load(); await element.play(); element.pause() })
  assert.equal(await page.locator('.hero-video .video-placeholder').count(), 0)
  results.push({ videoUploadAndPlayback: 'passed', media: 'Synthetic QA-only canvas recording, not a portfolio asset.' })
  await writeFile(new URL('results.json', output), JSON.stringify(results, null, 2))
  console.log(JSON.stringify(results, null, 2))
} finally {
  await browser.close()
}
