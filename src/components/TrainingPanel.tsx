export type TrainingConfig = {
  modelSize: 'small' | 'medium' | 'large'
  steps: number
}

export const DEFAULT_TRAINING: TrainingConfig = {
  modelSize: 'medium',
  steps: 1000,
}

const MODEL_SIZES: { value: TrainingConfig['modelSize']; label: string; sub: string }[] = [
  { value: 'small',  label: 'Small',  sub: '7B'  },
  { value: 'medium', label: 'Medium', sub: '13B' },
  { value: 'large',  label: 'Large',  sub: '70B' },
]

type Props = {
  config: TrainingConfig
  onChange: (patch: Partial<TrainingConfig>) => void
}

export function TrainingPanel({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Training Setup
      </p>

      {/* Model size */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-foreground/60">Model size</label>
        <div className="flex gap-1">
          {MODEL_SIZES.map(({ value, label, sub }) => {
            const active = config.modelSize === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ modelSize: value })}
                className="flex-1 flex flex-col items-center gap-0.5 rounded-lg border py-2 text-center cursor-pointer select-none"
                style={{
                  backgroundColor: active ? '#BE5A2E' : 'transparent',
                  borderColor:     active ? '#BE5A2E' : '#e2e8f0',
                  color:           active ? '#ffffff' : '#64748b',
                }}
              >
                <span className="text-[11px] font-semibold leading-none">{label}</span>
                <span className="text-[10px] leading-none" style={{ opacity: active ? 0.8 : 0.6 }}>{sub}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] text-foreground/60">Steps</label>
          <span className="text-[11px] font-mono tabular-nums text-foreground/60">
            {config.steps.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={10000}
          step={100}
          value={config.steps}
          onChange={e => onChange({ steps: Number(e.target.value) })}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-border"
          style={{ accentColor: '#BE5A2E' }}
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>100</span>
          <span>10,000</span>
        </div>
      </div>
    </div>
  )
}
