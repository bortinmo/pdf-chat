import 'dotenv/config'
import { extractPdf } from './pdfExtract'
import fs from 'fs/promises'
import { createRagService } from '@/lib/rag/rag.service'

async function ingest() {
  // Read PDF
  const text = await extractPdf('docs/marketing-ops.pdf')

  // Save text for manual inspection
  await fs.mkdir('scripts/_output', { recursive: true })
  await fs.writeFile('scripts/_output/marketing-ops.txt', text, 'utf8')

  // Process and store in vector DB
  const ragService = createRagService()
  // Clear stored chunks
  await ragService.clearStore()
  const chunkCount = await ragService.embedAndStore(text)

  console.log(`Stored ${chunkCount} chunks`)
}

ingest()


