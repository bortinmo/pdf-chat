# PDF Chat

Implementation for the [DESelect Technical Assessment](docs/ASSESSMENT.md).

## Features

* **Ingest a PDF**: split, embed, store chunks in a local vector DB
* **Chat with AI**: web UI and AI integration
* **RAG**: similarity search per question, topic guarded prompt
* **Prompts & answers saved**: in local DB

## Tech stack

* Web & API: **Next.js 14**, React 19, Tailwind
* LLM and Chat UI: OpenAI **gpt-4o-mini** via **Vercel AI SDK**
* PDF extraction: **Poppler** via `pdf-text-extract`
* Chunking: **RecursiveCharacterTextSplitter** via LangChain
* Embeddings: OpenAI **text-embedding-3-small** via LangChain
* Vector DB: **Chroma 0.6** with Docker
* Persistence: **Prisma + SQLite**

## PDF parsing

`pdf-parse` (also used by LangChain’s PDFLoader) can't seem to parse this marketing PDF (results in 600 new lines), so
Poppler's `pdftotext` is used instead.

## Setup instructions

```bash
# 1) clone
git clone https://github.com/bortinmo/pdf-chat.git
cd pdf-chat

# 2) install deps (prisma client is generated postinstall)
pnpm install

# 3) install Poppler
brew install poppler
# or other applicable installation methods

# 4) add secrets (OpenAI key)
cp .env.example .env
#   OPENAI_API_KEY=sk-...
#   CHROMA_URL=http://localhost:8000
#   DATABASE_URL="file:./dev.db"

# 5) create the schema
pnpm dlx prisma migrate dev --name init
```

## Running Instructions

```bash
# 1) run Chroma
docker run -d --name chroma \
  -p 8000:8000 \
  -e CHROMA_SERVER_ENABLE_TENANTS=true \
  ghcr.io/chroma-core/chroma:0.6.3

# 2) process the PDF
pnpm ingest

# 3) run the app
pnpm dev
```

## Chunking Strategy

This overview from LangChain mentions four splitting approaches:  
https://js.langchain.com/docs/concepts/text_splitters/

- Length-based
- Text-structure based
- Document-structure based
- Semantic meaning based

Text-structured based splitting is used (RecursiveCharacterTextSplitter) in the assessment.

The pick could be influenced by aspects of the real world use-case, for example:

- If we need to process only a low number of PDFs, that are queried a lot in chats, then we could ask an LLM directly
  to extract the content and split it, as the cost for that would not be high. This could likely result in the highest
  quality extraction and chunks.
- If we need to process a high number of PDFs, and the cost of using LLMs directly is
  prohibitive, then we could use an algorithmic approach (like the one used here), and test and adjust it to best fit
  the PDFs we serve.

(And I assume the whole use-case of chatting with documents, or knowledge bases in general, may have already been
implemented by the primary AI providers
themselves via their cloud services, APIs and SDKs - I haven't checked it. The downside of using them directly over
open-source ecosystems (like LangChain and underlying providers) could be potential vendor lock-in, depending on the
details and APIs as well.)

## Project Structure

```bash
pdf-chat/
├─ src/
│  ├─ app/                 # Next.js routes and UI (using App Router)
│  │   ├─ api/             # /api/chat, /api/history
│  │   └─ page.tsx         # chat front-end
│  └─ lib/
│      └─ rag/             # RAG pipeline
├─ prisma/                 # schema.prisma and SQL migrations
├─ scripts/                # CLI scripts (not bundled)
│  └─ ingest.ts            # PDF processing
└─ docs/marketing-ops.pdf  # source PDF (not exposed)
```

## Notes

### AI use

I used AIs extensively for the assignment, namely OpenAI o3 and Gemini 2.5 via the web interfaces, Claude Code through
CLI, and JetBrains Junie in WebStorm.
This is because most of the technologies involved here are new to me (TypeScript, Next.js, Prisma,
LangChain), and so the AIs helped a lot to quickly put things together and discuss things, which would have otherwise
taken much more time.  
And also because I think using AI is part of the development workflow now.  
But this also resulted in bigger chunks of AI-generated code with tech I am new too, and less double-checking and deep
involvement from me, than what I would normally do. So I overall see the repo more as a quick proof of concept.

### LangChain for VectorStore and RAG pipeline

I realized only late that LangChain provides VectorStore components, so the custom interface and implementation could
have been replaced with simply using LangChain for that too. And maybe the RagService orchestration layer as well.

## License

MIT