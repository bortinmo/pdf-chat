import { NextResponse } from 'next/server'
import { chatService } from '@/lib/chat/chat.service.instance'

export async function GET() {
  const history = await chatService.getChatHistory()
  return NextResponse.json(history)
}
