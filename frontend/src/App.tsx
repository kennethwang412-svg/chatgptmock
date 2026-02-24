import { useState, useCallback, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import InputArea from './components/InputArea'
import Toast from './components/Toast'
import { useChat } from './hooks/useChat'
import * as api from './services/api'
import type { Conversation, Message, ChatMode } from './types'

function generateTempId() {
  return 'tmp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({})
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarLoading, setSidebarLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const streamingMsgId = useRef<string | null>(null)
  const streamingConvId = useRef<string | null>(null)

  const currentMessages = currentId ? messagesMap[currentId] ?? [] : []

  useEffect(() => {
    setSidebarLoading(true)
    api
      .fetchConversations()
      .then((convs) => {
        setConversations(convs)
        if (convs.length > 0) {
          setCurrentId(convs[0].id)
        }
      })
      .catch(() => setToast('加载会话列表失败'))
      .finally(() => setSidebarLoading(false))
  }, [])

  useEffect(() => {
    if (!currentId) return
    if (messagesMap[currentId]) return
    setMessagesLoading(true)
    api
      .fetchMessages(currentId)
      .then((msgs) => {
        setMessagesMap((prev) => ({ ...prev, [currentId]: msgs }))
      })
      .catch(() => setToast('加载消息历史失败'))
      .finally(() => setMessagesLoading(false))
  }, [currentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStreamingMsg = useCallback(
    (updater: (msg: Message) => Message) => {
      const convId = streamingConvId.current
      const msgId = streamingMsgId.current
      if (!convId || !msgId) return
      setMessagesMap((prev) => {
        const msgs = prev[convId] ?? []
        return {
          ...prev,
          [convId]: msgs.map((m) => (m.id === msgId ? updater(m) : m)),
        }
      })
    },
    [],
  )

  const { send, abort } = useChat({
    onReasoningToken(token) {
      updateStreamingMsg((m) => ({
        ...m,
        reasoning_content: (m.reasoning_content ?? '') + token,
      }))
    },
    onContentToken(token) {
      updateStreamingMsg((m) => ({ ...m, content: m.content + token }))
    },
    onDone(messageId) {
      updateStreamingMsg((m) => ({
        ...m,
        id: messageId || m.id,
        streaming: false,
      }))
      setIsStreaming(false)
      streamingMsgId.current = null
      streamingConvId.current = null
    },
    onError(error) {
      updateStreamingMsg((m) => ({
        ...m,
        content: m.content || `⚠️ 错误: ${error}`,
        streaming: false,
      }))
      setIsStreaming(false)
      streamingMsgId.current = null
      streamingConvId.current = null
    },
    onTitle(title) {
      const convId = streamingConvId.current
      if (convId) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title } : c)),
        )
      }
    },
  })

  const handleNewConversation = useCallback(async () => {
    try {
      const conv = await api.createConversation()
      setConversations((prev) => [conv, ...prev])
      setMessagesMap((prev) => ({ ...prev, [conv.id]: [] }))
      setCurrentId(conv.id)
    } catch {
      setToast('创建对话失败')
    }
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await api.deleteConversation(id)
        setConversations((prev) => prev.filter((c) => c.id !== id))
        setMessagesMap((prev) => {
          const next = { ...prev }
          delete next[id]
          return next
        })
        if (currentId === id) {
          setCurrentId((prev) => {
            const remaining = conversations.filter((c) => c.id !== id)
            return remaining[0]?.id ?? null
          })
        }
      } catch {
        setToast('删除对话失败')
      }
    },
    [currentId, conversations],
  )

  const handleRename = useCallback(async (id: string, title: string) => {
    try {
      const updated = await api.updateConversationTitle(id, title)
      setConversations((prev) => prev.map((c) => (c.id === id ? updated : c)))
    } catch {
      setToast('重命名失败')
    }
  }, [])

  const handleSelect = useCallback((id: string) => {
    setCurrentId(id)
  }, [])

  const handleSend = useCallback(
    async (message: string, mode: ChatMode) => {
      let convId = currentId

      if (!convId) {
        try {
          const conv = await api.createConversation()
          setConversations((prev) => [conv, ...prev])
          setMessagesMap((prev) => ({ ...prev, [conv.id]: [] }))
          setCurrentId(conv.id)
          convId = conv.id
        } catch {
          setToast('创建对话失败')
          return
        }
      }

      if (isStreaming) return

      const userMsg: Message = {
        id: generateTempId(),
        conversation_id: convId,
        role: 'user',
        content: message,
        created_at: new Date().toISOString(),
      }

      const assistantMsgId = generateTempId()
      const assistantMsg: Message = {
        id: assistantMsgId,
        conversation_id: convId,
        role: 'assistant',
        content: '',
        reasoning_content: mode === 'reasoner' ? '' : undefined,
        model: 'deepseek-chat',
        created_at: new Date().toISOString(),
        streaming: true,
      }

      streamingConvId.current = convId
      streamingMsgId.current = assistantMsgId

      setMessagesMap((prev) => ({
        ...prev,
        [convId]: [...(prev[convId] ?? []), userMsg, assistantMsg],
      }))
      setIsStreaming(true)
      send(convId, message, mode)
    },
    [currentId, isStreaming, send],
  )

  const handleStop = useCallback(() => {
    abort()
    updateStreamingMsg((m) => ({ ...m, streaming: false }))
    setIsStreaming(false)
    streamingMsgId.current = null
    streamingConvId.current = null
  }, [abort, updateStreamingMsg])

  return (
    <div className="flex h-screen text-gray-100 overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/[0.03] blur-[120px]" />
      </div>

      <Sidebar
        conversations={conversations}
        currentId={currentId}
        loading={sidebarLoading}
        onSelect={handleSelect}
        onNew={handleNewConversation}
        onDelete={handleDelete}
        onRename={handleRename}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <ChatWindow
          messages={currentMessages}
          isStreaming={isStreaming}
          loadingMessages={messagesLoading}
          onSendPrompt={handleSend}
        />
        <InputArea onSend={handleSend} disabled={isStreaming} onStop={handleStop} />
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
