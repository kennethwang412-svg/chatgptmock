import { useEffect, useRef } from 'react'
import type { Message, ChatMode } from '../types'
import MessageBubble from './MessageBubble'

interface ChatWindowProps {
  messages: Message[]
  isStreaming: boolean
  loadingMessages?: boolean
  onSendPrompt?: (message: string, mode: ChatMode) => void
}

function WelcomeScreen({ onSendPrompt }: { onSendPrompt?: (message: string, mode: ChatMode) => void }) {
  const tips = ['解释量子计算原理', '写一段 Python 排序', '分析市场趋势', '对比 React vs Vue']

  return (
    <div className="flex-1 flex items-center justify-center animate-fade-in">
      <div className="text-center space-y-6 max-w-md px-6">
        {/* Logo */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 opacity-20 blur-xl" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-white/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            DeepSeek AI
          </h2>
          <p className="text-white/30 text-sm leading-relaxed">
            基于 DeepSeek 大模型的智能对话助手<br />
            支持对话模式和深度思考推理模式
          </p>
        </div>

        {/* Mode tags */}
        <div className="flex justify-center gap-3 pt-1">
          <div className="flex items-center gap-2 text-xs text-white/40 bg-white/[0.04] border border-white/[0.06] px-4 py-2 rounded-full">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            对话模式
          </div>
          <div className="flex items-center gap-2 text-xs text-white/40 bg-white/[0.04] border border-white/[0.06] px-4 py-2 rounded-full">
            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
            深度思考 R1
          </div>
        </div>

        {/* Quick tips — clickable */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {tips.map((tip) => (
            <button
              key={tip}
              onClick={() => onSendPrompt?.(tip, 'chat')}
              className="text-xs text-white/25 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2.5 hover:bg-white/[0.06] hover:border-cyan-500/20 hover:text-white/50 hover:shadow-[0_0_12px_rgba(0,212,255,0.05)] transition-all duration-200 cursor-pointer text-left"
            >
              {tip}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageSkeleton() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
      <div className="space-y-2 flex-1 max-w-[60%]">
        <div className="h-4 rounded skeleton-shimmer w-3/4" />
        <div className="h-4 rounded skeleton-shimmer w-1/2" />
      </div>
    </div>
  )
}

export default function ChatWindow({ messages, isStreaming, loadingMessages, onSendPrompt }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' })
  }, [messages, isStreaming])

  if (loadingMessages) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          <MessageSkeleton />
          <MessageSkeleton />
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return <WelcomeScreen onSendPrompt={onSendPrompt} />
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
        {messages.map((msg, i) => (
          <div key={msg.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 30, 300)}ms`, animationFillMode: 'backwards' }}>
            <MessageBubble message={msg} />
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
