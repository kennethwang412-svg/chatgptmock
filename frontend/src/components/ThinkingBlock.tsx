import { useState, useEffect } from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface ThinkingBlockProps {
  content: string
  isStreaming?: boolean
}

export default function ThinkingBlock({ content, isStreaming = false }: ThinkingBlockProps) {
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    if (isStreaming) {
      setExpanded(true)
    } else if (content) {
      setExpanded(false)
    }
  }, [isStreaming, content])

  if (!content && !isStreaming) return null

  return (
    <div className="mb-3 animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm transition-all duration-200 mb-1.5 group"
      >
        <svg
          className={`w-3.5 h-3.5 text-purple-400/60 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-purple-400/80 font-medium group-hover:text-purple-400 transition-colors">思考过程</span>
        {isStreaming && (
          <span className="inline-flex items-center gap-1.5 ml-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-40" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-400/80" />
            </span>
            <span className="text-xs text-purple-400/60">思考中...</span>
          </span>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-l-2 border-purple-500/30 bg-purple-500/[0.04] rounded-r-xl pl-4 pr-4 py-3 text-sm text-white/50">
          {content ? (
            <MarkdownRenderer content={content} />
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
