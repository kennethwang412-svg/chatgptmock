export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  reasoning_content?: string
  model?: 'deepseek-chat' | 'deepseek-reasoner'
  created_at: string
  streaming?: boolean
}

export type ChatMode = 'chat' | 'reasoner'
