// @ts-ignore – pdf-text-extract has no types
import extract from 'pdf-text-extract'
import { promisify } from 'node:util'

const pdfExtract = promisify(extract)

export async function extractPdf(path: string) {

  const pages: string[] = await pdfExtract(path, { layout: 'raw' })

  const text = pages.join('\n\n')
  if (!text) {
    throw new Error('Poppler extracted no text')
  }
  return text
}
