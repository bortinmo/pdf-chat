import { createVectorStore, VectorStore } from './vectorStore.service'
import 'dotenv/config'
import { createEmbeddingService, EmbeddingService } from '@/lib/rag/embedding.service'
import { createSplitterService, TextSplitterService } from './testSplitter.service'

// TODO Check if LangChain has components for the whole RAG pipeline (see TODO in VectorStore as well), and if so, replace our custom code with that to simplify things

/**
 * Interface for the high-level RAG orchestration component.
 */
export interface RagService {
  /**
   * Fetches relevant context from the vector database based on a query string
   * @param query - The user's question or search query to find relevant document chunks
   * @param k - Number of most relevant document chunks to retrieve (default: 4)
   * @returns A string containing the concatenated relevant document chunks
   */
  getRelevantContent(query: string, k?: number): Promise<string>;

  /**
   * Processes text into chunks, creates embeddings, and stores them in the vector database
   * @param text - The text content to process and store
   * @returns The number of chunks stored
   */
  embedAndStore(text: string): Promise<number>;

  /**
   * Clears all data from the store.
   */
  clearStore(): Promise<void>;
}

/**
 * Implementation of {@link RagService}
 */
export class RagServiceImpl implements RagService {

  private collectionName = 'rag-chunks'

  constructor(
    private embeddingService: EmbeddingService,
    private vectorStore: VectorStore,
    private splitterService: TextSplitterService,
  ) {
  }

  async getRelevantContent(query: string, k = 4): Promise<string> {
    // Embed the user question
    const queryEmbedding = await this.embeddingService.embedQuery(query)
    // Query the vector store for relevant documents
    const documents = await this.vectorStore.query(queryEmbedding, k, this.collectionName)
    // Join the documents with double newlines
    return documents.join('\n\n')
  }

  async embedAndStore(text: string): Promise<number> {
    // Split the input text into smaller chunks using the splitter service
    const chunks = await this.splitterService.splitText(text)
    // Generate vector embeddings for each text chunk
    const vectors = await this.embeddingService.embedDocuments(chunks)
    // Store both the text chunks and their vector embeddings in the vector database
    await this.vectorStore.store(chunks, vectors, this.collectionName)
    // Return the number of chunks that were processed and stored
    return chunks.length
  }

  async clearStore(): Promise<void> {
    await this.vectorStore.deleteCollectionIfExists(this.collectionName)
  }
}

/**
 * Factory function to create a RagService instance
 */
export function createRagService(): RagService {
  return new RagServiceImpl(
    createEmbeddingService(),
    createVectorStore(),
    createSplitterService(),
  )
}
