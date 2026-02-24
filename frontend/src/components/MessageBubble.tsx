import type { Message } from '../types'
import MarkdownRenderer from './MarkdownRenderer'
import ThinkingBlock from './ThinkingBlock'

interface MessageBubbleProps {
  message: Message
}

function UserAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
      </svg>
    </div>
  )
}

function AssistantAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(139,92,246,0.3)]">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    </div>
  )
}

function StreamingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:0ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:150ms]" />
      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-bounce [animation-delay:300ms]" />
    </div>
  )
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[70%]">
          <div className="bg-gradient-to-r from-blue-600/80 to-cyan-600/80 text-white rounded-2xl rounded-br-sm px-4 py-3 text-[15px] leading-relaxed border border-blue-500/20 shadow-[0_2px_16px_rgba(59,130,246,0.15)]">
            {message.content}
          </div>
        </div>
        <UserAvatar />
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <AssistantAvatar />
      <div className="max-w-[80%] min-w-0">
        {message.reasoning_content !== undefined && (
          <ThinkingBlock
            content={message.reasoning_content || ''}
            isStreaming={message.streaming && !message.content}
          />
        )}
        {message.content ? (
          message.content.startsWith('⚠️') ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] leading-relaxed text-red-300">
              {message.content}
            </div>
          ) : (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] leading-relaxed text-gray-200 prose-invert">
              <MarkdownRenderer content={message.content} />
              {message.streaming && (
                <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-pulse align-text-bottom" />
              )}
            </div>
          )
        ) : message.streaming && message.reasoning_content === undefined ? (
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-bl-sm px-4 py-3">
            <StreamingDots />
          </div>
        ) : null}
      </div>
    </div>
  )
}
