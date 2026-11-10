// Genera public/cv-eric-bastida-{es,en}.pdf a partir de pdf.html con Chrome
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
  for (const lang of ['es', 'en']) {
    const output = `${root}public/cv-eric-bastida-${lang}.pdf`
    await run(chrome, [
      '--headless',
      '--disable-gpu',
      '--no-pdf-header-footer',
      '--run-all-compositor-stages-before-draw',
      '--virtual-time-budget=15000',
      `--print-to-pdf=${output}`,
      `http://localhost:5199/pdf.html?lang=${lang}`,
    ])
    console.log(`PDF listo: ${output}`)
  }
} finally {
  await server.close()
}
