import { useState, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.min.css'

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  return (
    <button
      onClick={handleCopy}
      className={`px-2.5 py-1 text-[11px] rounded-md transition-all duration-200 ${
        copied
          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          : 'bg-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.1] border border-white/[0.06]'
      }`}
    >
      {copied ? '已复制' : '复制'}
    </button>
  )
}

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      components={{
        pre({ children, ...props }) {
          const codeEl = props.node?.children?.[0] as { type?: string; children?: { value?: string }[]; properties?: { className?: string[] } } | undefined
          const codeText =
            codeEl?.type === 'element' && codeEl.children?.[0]?.value
              ? codeEl.children[0].value
              : ''

          const langClass = codeEl?.properties?.className?.find((c: string) => c.startsWith('language-'))
          const lang = langClass ? langClass.replace('language-', '') : ''

          return (
            <div className="relative group my-4 rounded-xl overflow-hidden border border-white/[0.06]">
              <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/[0.06]">
                <span className="text-[11px] text-white/25 font-mono uppercase tracking-wider">
                  {lang || 'code'}
                </span>
                <CopyButton code={codeText} />
              </div>
              <pre className="!bg-[#080810] !rounded-none !m-0 !p-4 overflow-x-auto text-sm" {...props}>
                {children}
              </pre>
            </div>
          )
        },
        code({ className, children, ...props }) {
          const isInline = !className
          if (isInline) {
            return (
              <code className="bg-white/[0.08] text-cyan-300/80 px-1.5 py-0.5 rounded-md text-[13px] border border-white/[0.06]" {...props}>
                {children}
              </code>
            )
          }
          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        table({ children, ...props }) {
          return (
            <div className="overflow-x-auto my-4 rounded-lg border border-white/[0.08]">
              <table className="min-w-full border-collapse" {...props}>
                {children}
              </table>
            </div>
          )
        },
        th({ children, ...props }) {
          return (
            <th className="border-b border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-left text-sm font-medium text-white/60" {...props}>
              {children}
            </th>
          )
        },
        td({ children, ...props }) {
          return (
            <td className="border-b border-white/[0.04] px-4 py-2.5 text-sm text-white/50" {...props}>
              {children}
            </td>
          )
        },
        a({ children, href, ...props }) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-cyan-400/80 hover:text-cyan-300 underline decoration-cyan-400/30 underline-offset-2 transition-colors" {...props}>
              {children}
            </a>
          )
        },
        blockquote({ children, ...props }) {
          return (
            <blockquote className="border-l-2 border-cyan-500/30 pl-4 my-4 text-white/40 italic" {...props}>
              {children}
            </blockquote>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
