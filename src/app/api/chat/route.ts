import { chatService } from '@/lib/chat/chat.service.instance'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const { messages } = await req.json()
  const latestUserMsg = messages.at(-1)?.content ?? ''

  const result = await chatService.processChat(messages)
  const response = result.toDataStreamResponse()

  // Save user prompt and answer in the background
  chatService.savePromptAnswer(result, latestUserMsg)
    .catch(console.error)

  return response
}
