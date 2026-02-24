import { useState, useRef, useCallback, useEffect } from 'react'
import type { ChatMode } from '../types'

interface InputAreaProps {
  onSend: (message: string, mode: ChatMode) => void
  disabled?: boolean
  onStop?: () => void
}

export default function InputArea({ onSend, disabled = false, onStop }: InputAreaProps) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<ChatMode>('chat')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [text, adjustHeight])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed, mode)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, mode, disabled, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend],
  )

  return (
    <div className="relative border-t border-white/[0.06] px-4 py-4" style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}>
      <div className="max-w-3xl mx-auto space-y-3">
        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('chat')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
              mode === 'chat'
                ? 'bg-emerald-500/15 text-emerald-400 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.3)] shadow-[0_0_12px_rgba(52,211,153,0.1)]'
                : 'bg-white/[0.03] text-white/30 hover:text-white/50 hover:bg-white/[0.06]'
            }`}
          >
            对话模式
          </button>
          <button
            onClick={() => setMode('reasoner')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 flex items-center gap-1.5 ${
              mode === 'reasoner'
                ? 'bg-purple-500/15 text-purple-400 shadow-[inset_0_0_0_1px_rgba(168,85,247,0.3)] shadow-[0_0_12px_rgba(168,85,247,0.1)]'
                : 'bg-white/[0.03] text-white/30 hover:text-white/50 hover:bg-white/[0.06]'
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            深度思考 R1
          </button>
        </div>

        {/* Input row */}
        <div className={`flex items-end rounded-2xl border transition-all duration-300 ${
          disabled
            ? 'bg-white/[0.03] border-white/[0.06]'
            : 'bg-white/[0.04] border-white/[0.08] focus-within:border-cyan-500/30 focus-within:shadow-[0_0_20px_rgba(0,212,255,0.08)]'
        }`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'reasoner' ? '输入问题，AI 将深度思考后回答...' : '输入消息...'}
            disabled={disabled}
            rows={1}
            className="flex-1 resize-none bg-transparent px-4 py-3.5 text-[15px] text-gray-100 placeholder-white/20 focus:outline-none disabled:opacity-40 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          />
          {disabled ? (
            <button
              onClick={onStop}
              className="flex items-center justify-center w-9 h-9 m-1.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-200 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className={`flex items-center justify-center w-9 h-9 m-1.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                text.trim()
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 hover:shadow-[0_0_12px_rgba(0,212,255,0.15)] cursor-pointer'
                  : 'bg-transparent border border-white/[0.06] text-white/10 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          )}
        </div>

        <p className="text-center text-[11px] text-white/15">
          {mode === 'reasoner' ? 'DeepSeek R1 推理模式' : 'DeepSeek V3 对话模式'} · Enter 发送，Shift+Enter 换行
        </p>
      </div>
    </div>
  )
}
