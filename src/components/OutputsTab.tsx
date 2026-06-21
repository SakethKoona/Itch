import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { WorkspaceJSON } from '@/lib/serialize'

// Basic JSON syntax highlighting — no external lib needed
function highlight(json: string): string {
  return json
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      match => {
        if (/^"/.test(match)) {
          if (/:$/.test(match)) return `<span style="color:#7dd3fc">${match}</span>` // key - sky
          return `<span style="color:#86efac">${match}</span>`  // string - green
        }
        if (/true|false/.test(match)) return `<span style="color:#fcd34d">${match}</span>` // amber
        if (/null/.test(match))        return `<span style="color:#f87171">${match}</span>` // rose
        return `<span style="color:#c4b5fd">${match}</span>` // number - purple
      }
    )
}

type Props = {
  workspaceJSON: WorkspaceJSON
}

export function OutputsTab({ workspaceJSON }: Props) {
  const [copied, setCopied] = useState(false)
  const isEmpty = workspaceJSON.blocks.length === 0
  const jsonString = JSON.stringify(workspaceJSON, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-4">
        <p className="text-[13px] font-medium text-muted-foreground">No blocks yet</p>
        <p className="text-[11px] text-muted-foreground/50 leading-snug">
          Add blocks to the canvas to see the JSON payload here.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Payload
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium transition-colors border"
          style={{
            background: copied ? '#f0fdf4' : 'transparent',
            color: copied ? '#16a34a' : '#94a3b8',
            borderColor: copied ? '#bbf7d0' : '#e2e8f0',
          }}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Highlighted JSON */}
      <pre
        className="flex-1 overflow-auto p-3 text-[11px] font-mono leading-relaxed"
        style={{ background: '#0f172a', color: '#e2e8f0' }}
        dangerouslySetInnerHTML={{ __html: highlight(jsonString) }}
      />
    </div>
  )
}
