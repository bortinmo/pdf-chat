import { ChromaClient } from 'chromadb'
import 'dotenv/config'

// TODO LangChain also has VectorStore and Chroma component, use that directly to simplify our code

/**
 * Interface for vector database operations
 */
export interface VectorStore {
  /**
   * Query the vector store for relevant documents
   * @param queryEmbedding - The embedding of the query
   * @param k - Number of most relevant document chunks to retrieve
   * @param collectionName - The name of the collection to query
   * @returns An array of relevant documents
   */
  query(queryEmbedding: number[], k: number, collectionName: string): Promise<string[]>;

  /**
   * Store documents and their embeddings in the vector database
   * @param documents - The text chunks to store
   * @param embeddings - The embeddings of the text chunks
   * @param collectionName - The name of the collection to store the chunks in
   * @returns The number of chunks stored
   */
  store(documents: string[], embeddings: number[][], collectionName: string): Promise<number>;

  /**
   * Delete a collection from the vector database
   * @param collectionName - The name of the collection to delete
   */
  deleteCollectionIfExists(collectionName: string): void;
}

/**
 * Implementation of VectorStore using ChromaDB
 */
export class ChromaVectorStore implements VectorStore {
  private client: ChromaClient

  constructor(chromaUrl: string) {
    this.client = new ChromaClient({
      path: chromaUrl,
      tenant: 'default_tenant',
      database: 'default_database',
    })
  }

  /**
   * Delete a collection from the vector database
   * @param collectionName - The name of the collection to delete
   * @returns A boolean indicating whether the deletion was successful
   */
  async deleteCollectionIfExists(collectionName: string) {
    const collections = await this.client.listCollections()
    const collectionExists = collections.some(collection => collection === collectionName)
    if (collectionExists) {
      await this.client.deleteCollection({ name: collectionName })
    }
  }

  /**
   * Query the vector store for relevant documents
   * @param queryEmbedding - The embedding of the query
   * @param k - Number of most relevant document chunks to retrieve
   * @param collectionName - The name of the collection to query
   * @returns An array of relevant documents
   */
  async query(queryEmbedding: number[], k: number, collectionName: string): Promise<string[]> {
    const collection = await this.client.getCollection({ name: collectionName })

    // Perform semantic similarity search using the query embedding
    const { documents } = await collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: k,
    })

    // Flatten the nested string[][] to a single string[] and filter out nulls
    return documents.flat().filter((doc): doc is string => doc !== null)
  }

  /**
   * Store documents and their embeddings in the vector database
   * @param documents - The text chunks to store
   * @param embeddings - The embeddings of the text chunks
   * @param collectionName - The name of the collection to store the chunks in
   * @returns The number of chunks stored
   */
  async store(documents: string[], embeddings: number[][], collectionName: string): Promise<number> {
    // Create a new collection
    const collection = await this.client.createCollection({ name: collectionName })

    // Add documents and embeddings to the collection
    await collection.add({
      ids: documents.map((_, i) => `chunk-${i}`),
      documents: documents,
      embeddings: embeddings,
    })

    return documents.length
  }
}

/**
 * Factory function to create a ChromaVectorStore instance
 * @returns A VectorStore instance
 */
export function createVectorStore(): VectorStore {
  const chromaUrl = process.env.CHROMA_URL ?? 'http://localhost:8000'
  return new ChromaVectorStore(chromaUrl)
}
