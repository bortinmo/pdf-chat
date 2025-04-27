import { createChatService } from '@/lib/chat/chat.service'
import { ragService } from '@/lib/rag/rag.service.instance'

export const chatService = createChatService(ragService)