import { useRef, useCallback } from 'react'
import type { ChatMode } from '../types'

interface SSEEvent {
  type: 'reasoning' | 'content' | 'done' | 'error' | 'title'
  content?: string
  message_id?: string
}

interface UseChatOptions {
  onReasoningToken: (token: string) => void
  onContentToken: (token: string) => void
  onDone: (messageId?: string) => void
  onError: (error: string) => void
  onTitle?: (title: string) => void
}

export function useChat(options: UseChatOptions) {
  const abortRef = useRef<AbortController | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const send = useCallback(
    async (conversationId: string, message: string, mode: ChatMode) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversation_id: conversationId,
            message,
            mode,
          }),
          signal: controller.signal,
        })

        if (controller.signal.aborted) return

        if (!res.ok) {
          optionsRef.current.onError(`请求失败: HTTP ${res.status}`)
          return
        }

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let finished = false

        while (!finished) {
          const { done, value } = await reader.read()
          if (done) break
          if (controller.signal.aborted) return

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (finished || controller.signal.aborted) break
            const trimmed = line.trim()
            if (!trimmed.startsWith('data: ')) continue
            const payload = trimmed.slice(6)
            if (!payload || payload === '[DONE]') continue

            try {
              const event: SSEEvent = JSON.parse(payload)
              const opts = optionsRef.current
              switch (event.type) {
                case 'reasoning':
                  if (event.content) opts.onReasoningToken(event.content)
                  break
                case 'content':
                  if (event.content) opts.onContentToken(event.content)
                  break
                case 'done':
                  opts.onDone(event.message_id)
                  finished = true
                  break
                case 'title':
                  if (event.content) opts.onTitle?.(event.content)
                  break
                case 'error':
                  opts.onError(event.content || '未知错误')
                  finished = true
                  break
              }
            } catch {
              // skip malformed JSON
            }
          }
        }

        if (!finished && !controller.signal.aborted) {
          optionsRef.current.onDone()
        }
      } catch {
        if (controller.signal.aborted) return
        optionsRef.current.onError('网络错误')
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null
        }
      }
    },
    [],
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  return { send, abort }
}
