import { useState } from 'react'
import { Brain, Blocks, ListChecks, ArrowRight, ArrowLeft, X } from 'lucide-react'

const STORAGE_KEY = 'itch-tutorial-seen'

type Step = {
  icon: React.ReactNode
  eyebrow: string
  title: string
  body: React.ReactNode
  color: string        // block-accent color for the icon badge
  colorLight: string   // body bg for the icon badge
}

const STEPS: Step[] = [
  {
    icon: <Brain className="size-7" />,
    eyebrow: 'Step 1 of 3',
    title: 'How does AI actually learn?',
    color: '#BE5A2E',
    colorLight: '#f7ebe6',
    body: (
      <>
        <p>
          Imagine teaching a dog a new trick. Every time it does the right thing,
          you give it a treat. Over time it figures out exactly what to do.
        </p>
        <p className="mt-3">
          AI learns the exact same way — it tries things, sees what works, and
          gets better with practice. That's called <strong>Reinforcement Learning</strong>.
          This tool lets you design the world your AI will train in.
        </p>
      </>
    ),
  },
  {
    icon: <Blocks className="size-7" />,
    eyebrow: 'Step 2 of 3',
    title: "Build your AI's world",
    color: '#3F7A74',
    colorLight: '#e8efee',
    body: (
      <>
        <p>
          Every AI needs a place to live. The <strong>Environment</strong> block
          is that place — think of it like the rules of a game.
        </p>
        <p className="mt-3">
          <strong>Tools</strong> are things your AI can actually use to solve
          problems — like a calculator, a search engine, or anything you dream up.
          Drag them from the left panel onto the canvas to add them.
        </p>
      </>
    ),
  },
  {
    icon: <ListChecks className="size-7" />,
    eyebrow: 'Step 3 of 3',
    title: 'Give your AI challenges',
    color: '#B26B74',
    colorLight: '#f5edee',
    body: (
      <>
        <p>
          <strong>Tasks</strong> are the actual problems you want your AI to
          practice — like answering a question or solving a puzzle.
        </p>
        <p className="mt-3">
          Group them into a <strong>Task Set</strong> to train on lots of
          different challenges at once. The more good tasks you give it, the
          smarter it gets!
        </p>
      </>
    ),
  },
]

type Props = {
  onDone: () => void
}

export function TutorialOverlay({ onDone }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'oklch(0.16 0.035 58 / 0.55)', backdropFilter: 'blur(4px)' }}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'oklch(0.99 0.01 82)' }}
      >
        {/* Skip button */}
        <button
          type="button"
          onClick={onDone}
          className="absolute top-4 right-4 rounded-full p-1.5 transition-colors"
          style={{ color: 'oklch(0.40 0.04 62)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.92 0.015 75)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          aria-label="Skip tutorial"
        >
          <X className="size-4" />
        </button>

        {/* Content */}
        <div className="px-8 pt-10 pb-8">
          {/* Icon badge */}
          <div
            className="flex items-center justify-center size-16 rounded-2xl mb-6"
            style={{ background: current.colorLight, color: current.color }}
          >
            {current.icon}
          </div>

          {/* Eyebrow */}
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-1"
            style={{ color: current.color }}
          >
            {current.eyebrow}
          </p>

          {/* Title */}
          <h2
            className="text-xl font-bold mb-4 leading-snug"
            style={{ color: 'oklch(0.16 0.035 58)' }}
          >
            {current.title}
          </h2>

          {/* Body */}
          <div
            className="text-[14px] leading-relaxed"
            style={{ color: 'oklch(0.32 0.04 62)' }}
          >
            {current.body}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-8 py-5 border-t"
          style={{ borderColor: 'oklch(0.16 0.035 58 / 0.10)', background: 'oklch(0.96 0.018 82)' }}
        >
          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className="rounded-full transition-all"
                style={{
                  width:  i === step ? 20 : 8,
                  height: 8,
                  background: i === step ? current.color : 'oklch(0.16 0.035 58 / 0.18)',
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12px] font-semibold transition-colors border"
                style={{
                  color: 'oklch(0.40 0.04 62)',
                  borderColor: 'oklch(0.16 0.035 58 / 0.18)',
                  background: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.92 0.015 75)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <ArrowLeft className="size-3.5" />
                Back
              </button>
            )}

            <button
              type="button"
              onClick={() => isLast ? onDone() : setStep(s => s + 1)}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-all"
              style={{ background: current.color }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.08)')}
              onMouseLeave={e => (e.currentTarget.style.filter = '')}
            >
              {isLast ? "Let's build!" : 'Next'}
              {!isLast && <ArrowRight className="size-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function useTutorial() {
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY))

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  const show = () => setVisible(true)

  return { visible, dismiss, show }
}
