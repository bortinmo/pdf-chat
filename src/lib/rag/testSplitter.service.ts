import { RecursiveCharacterTextSplitter, TextSplitter } from '@langchain/textsplitters'

/**
 * Use LangChain's interface for our service, but with a more suitable name.
 */
export type TextSplitterService = TextSplitter;

/**
 * Creates the {@link TextSplitterService} instance to use in the app.
 */
export function createSplitterService(): TextSplitterService {
  return new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  })
}