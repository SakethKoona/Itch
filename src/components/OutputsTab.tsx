import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { WorkspaceJSON } from '@/lib/serialize'

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

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">JSON payload</span>
        <Button
          variant="outline"
          size="xs"
          onClick={handleCopy}
          disabled={isEmpty}
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      {isEmpty ? (
        <p className="text-xs text-muted-foreground text-center py-12">
          Add blocks to the workspace to see the output here.
        </p>
      ) : (
        <pre className="flex-1 overflow-auto rounded-lg bg-muted p-3 text-xs font-mono leading-relaxed">
          {jsonString}
        </pre>
      )}
    </div>
  )
}
