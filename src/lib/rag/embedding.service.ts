import { OpenAIEmbeddings } from '@langchain/openai'
import { EmbeddingsInterface } from '@langchain/core/embeddings'

/**
 * Use LangChain's interface for our service, but with a more suitable name.
 */
export type EmbeddingService = EmbeddingsInterface;

/**
 * Creates the {@link EmbeddingService} instance to use in the app.
 */
export function createEmbeddingService(): EmbeddingService {
  return new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY!,
    model: 'text-embedding-3-small',
  })
}