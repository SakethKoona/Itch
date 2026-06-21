import type { EnvBlock } from '@/lib/types'

type Props = {
  block: EnvBlock
  onUpdate: (patch: Partial<EnvBlock>) => void
}

export function EnvFields({ block, onUpdate }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-black/40">
        Description
      </label>
      <textarea
        className="min-h-[80px] w-full resize-none rounded border border-black/10 bg-white/70 px-2.5 py-2 text-xs placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-black/20"
        placeholder="Describe what this environment is and what agents do inside it..."
        value={block.description}
        onChange={e => onUpdate({ description: e.target.value })}
      />
    </div>
  )
}
