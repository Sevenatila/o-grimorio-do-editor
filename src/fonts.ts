const bundledFonts = import.meta.glob<string>('./assets/fonts/*.{woff2,woff,ttf,otf}', { eager: true, query: '?url', import: 'default' })
const families = ['Cinzel', 'Lora']

async function loadLocalFamily(family: string) {
  const files = Object.entries(bundledFonts).filter(([filename]) => filename.toLowerCase().includes(family.toLowerCase()))
  if (files.length) {
    try {
      await Promise.all(files.map(async ([filename, url]) => {
        const face = new FontFace(family, `url("${url}")`, { weight: family === 'Cinzel' ? '400 900' : '400 700', style: /italic/i.test(filename) ? 'italic' : 'normal', display: 'swap' })
        document.fonts.add(await face.load())
      }))
      return true
    } catch { }
  }
  try {
    const face = new FontFace(family, `local("${family}")`, { display: 'swap' })
    document.fonts.add(await face.load())
    return true
  } catch {
    return false
  }
}

export async function loadFonts() {
  const local = await Promise.all(families.map(loadLocalFamily))
  document.documentElement.dataset.fontSource = local.every(Boolean) ? 'local' : 'fallback'
  const missing = families.filter((_, index) => !local[index])
  if (!missing.length) return
  const stylesheet = document.createElement('link')
  stylesheet.rel = 'stylesheet'
  stylesheet.href = `https://fonts.googleapis.com/css2?${missing.map(family => family === 'Cinzel' ? 'family=Cinzel:wght@400..900' : 'family=Lora:ital,wght@0,400..700;1,400..700').join('&')}&display=swap`
  stylesheet.onload = () => {
    void Promise.all(missing.map(family => document.fonts.load(`400 16px "${family}"`))).then(faces => {
      if (faces.every(loaded => loaded.length > 0)) document.documentElement.dataset.fontSource = 'google'
    }).catch(() => {})
  }
  document.head.append(stylesheet)
}
