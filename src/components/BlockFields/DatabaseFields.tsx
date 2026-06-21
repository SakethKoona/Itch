import type { DatabaseBlock } from '@/lib/types'

type Props = {
  block: DatabaseBlock
  onUpdate: (patch: Partial<DatabaseBlock>) => void
}

export function DatabaseFields({ block, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-black/40">
          Name
        </label>
        <input
          type="text"
          className="w-full rounded border border-black/10 bg-white/70 px-2.5 py-1.5 text-xs placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
          placeholder="e.g. user_profiles"
          value={block.name}
          onChange={e => onUpdate({ name: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-wide text-black/40">
          What's stored here
        </label>
        <textarea
          rows={2}
          className="w-full resize-none rounded border border-black/10 bg-white/70 px-2.5 py-2 text-xs placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20 leading-relaxed"
          placeholder="Describe what the agent can store and retrieve…"
          value={block.description}
          onChange={e => onUpdate({ description: e.target.value })}
        />
      </div>
    </div>
  )
}
