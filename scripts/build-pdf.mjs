// Genera los PDF de public/ a partir de pdf.html y ats.html con Chrome
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const run = promisify(execFile)
const root = fileURLToPath(new URL('..', import.meta.url))
const chrome = process.env.CHROME_PATH ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const server = await createServer({ root, server: { port: 5199, strictPort: true }, logLevel: 'error' })
await server.listen()

try {
  // El visual, para personas, y el ATS, de una columna, para los sistemas que filtran CVs
  const versions = [
    { page: 'pdf.html', name: 'cv-eric-bastida' },
    { page: 'ats.html', name: 'cv-eric-bastida-ats' },
  ]
  for (const { page, name } of versions) {
    for (const lang of ['es', 'en']) {
      const output = `${root}public/${name}-${lang}.pdf`
      await run(chrome, [
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        '--run-all-compositor-stages-before-draw',
        '--virtual-time-budget=15000',
        `--print-to-pdf=${output}`,
        `http://localhost:5199/${page}?lang=${lang}`,
      ])
      console.log(`PDF listo: ${output}`)
    }
  }
} finally {
  await server.close()
}
