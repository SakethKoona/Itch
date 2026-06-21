import { useState } from 'react'
import { Search } from 'lucide-react'
import { DraggableBlockTemplate } from './DraggableBlockTemplate'
import { BLOCK_TEMPLATES, SUB_BLOCK_TEMPLATES, INTEGRATION_TEMPLATES } from '@/lib/types'

type Props = {
  envBlockExists: boolean
}

export function BlocksTab({ envBlockExists }: Props) {
  const [query, setQuery] = useState('')
  const q = query.toLowerCase().trim()

  const filteredCanvas       = BLOCK_TEMPLATES.filter(t => !q || t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  const filteredIntegrations = INTEGRATION_TEMPLATES.filter(t => !q || t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
  const filteredGraders      = SUB_BLOCK_TEMPLATES.filter(t => !q || t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))

  const noResults = filteredCanvas.length === 0 && filteredIntegrations.length === 0 && filteredGraders.length === 0

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search blocks…"
          className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {noResults ? (
        <p className="text-[11px] text-muted-foreground text-center py-6">No blocks match "{query}"</p>
      ) : (
        <>
          {filteredCanvas.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Canvas blocks</p>
              <div className="flex flex-col gap-1.5">
                {filteredCanvas.map(t => (
                  <DraggableBlockTemplate
                    key={t.type}
                    template={t}
                    disabled={t.type === 'env' && envBlockExists}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredIntegrations.length > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Integrations</p>
                <div className="flex flex-col gap-1.5">
                  {filteredIntegrations.map(t => (
                    <DraggableBlockTemplate key={t.type} template={t} />
                  ))}
                </div>
              </div>
            </>
          )}

          {filteredGraders.length > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sub-blocks</p>
                <div className="flex flex-col gap-1.5">
                  {filteredGraders.map(t => (
                    <DraggableBlockTemplate key={t.type} template={t} />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
