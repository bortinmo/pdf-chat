import { openai } from '@ai-sdk/openai'
import { streamText, StreamTextResult, ToolSet } from 'ai'
import { prisma } from '@/lib/app-db/prisma'
import { createSystemPrompt } from '@/lib/prompts/system.prompt'
import { RagService } from '@/lib/rag/rag.service'

/**
 * Interface for the Chat service component.
 */
export interface ChatService {
  /**
   * Processes a chat message, generates a response using RAG and LLM, and returns a stream
   * @param messages - The chat messages
   * @returns A StreamTextResult containing the response
   */
  processChat(messages: any[]): Promise<StreamTextResult<ToolSet, never>>;

  /**
   * Saves a user prompt and the corresponding answer to the database
   * @param result - The stream result containing the answer
   * @param userMessage - The user's message
   * @returns A promise that resolves when the save operation is complete
   */
  savePromptAnswer(result: StreamTextResult<ToolSet, never>, userMessage: string): Promise<void>;

  /**
   * Retrieves the chat history
   * @param limit - The maximum number of history items to retrieve (default: 20)
   * @returns An array of chat history items
   */
  getChatHistory(limit?: number): Promise<any[]>;
}

/**
 * Implementation of {@link ChatService}
 */
export class ChatServiceImpl implements ChatService {

  private model = openai('gpt-4o-mini')
  private maxTokens = 512

  constructor(
    private ragService: RagService,
  ) {
  }

  async processChat(messages: any[]): Promise<StreamTextResult<ToolSet, never>> {
    const latestUserMsg = messages.at(-1)?.content ?? ''

    const context = await this.ragService.getRelevantContent(latestUserMsg)

    const system = createSystemPrompt(context)

    return streamText({
      model: this.model,
      maxTokens: this.maxTokens,
      system,
      messages,
    })
  }

  async savePromptAnswer(result: StreamTextResult<ToolSet, never>, userMessage: string): Promise<void> {
    const steps = await result.steps
    const reply = steps.map(s => s.text).join('')
    await prisma.prompt.create({
      data: { question: userMessage, answer: reply },
    })
  }

  async getChatHistory(limit = 20): Promise<any[]> {
    const history = await prisma.prompt.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
    return history.reverse()
  }
}

/**
 * Factory function to create a ChatService instance
 */
export function createChatService(ragService: RagService): ChatService {
  return new ChatServiceImpl(ragService)
}