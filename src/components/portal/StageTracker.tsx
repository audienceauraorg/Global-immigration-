import { Check } from 'lucide-react'

const STAGES = [
  { key: 'Intake',          label: 'Intake',      desc: 'File opened' },
  { key: 'Docs Collection', label: 'Documents',   desc: 'Uploading docs' },
  { key: 'Review',          label: 'Review',      desc: 'Under review' },
  { key: 'Submitted',       label: 'Submitted',   desc: 'Sent to IRCC' },
  { key: 'Decision',        label: 'Decision',    desc: 'Awaiting result' },
  { key: 'Closed',          label: 'Complete',    desc: 'File closed' },
]

interface StageTrackerProps {
  currentStage: string
}

export function StageTracker({ currentStage }: StageTrackerProps) {
  const currentIndex = STAGES.findIndex(s => s.key === currentStage)

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="flex items-start min-w-max sm:min-w-0">
        {STAGES.map((stage, index) => {
          const isDone     = index < currentIndex
          const isCurrent  = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <div key={stage.key} className="flex items-start flex-1 last:flex-none">
              {/* Step */}
              <div className="flex flex-col items-center gap-2">
                {/* Circle */}
                <div
                  className="relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                  style={
                    isDone
                      ? { background: '#10b981', color: '#fff' }
                      : isCurrent
                      ? {
                          background: 'linear-gradient(135deg, #C9A84C, #e8c76a)',
                          color: '#0B1C3A',
                          boxShadow: '0 0 0 4px rgba(201,168,76,0.2)',
                        }
                      : { background: 'rgba(11,28,58,0.08)', color: 'rgba(11,28,58,0.3)' }
                  }
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : <span>{index + 1}</span>}
                </div>

                {/* Label */}
                <div className="flex flex-col items-center w-16">
                  <span
                    className="text-[10.5px] font-bold text-center leading-tight"
                    style={
                      isDone
                        ? { color: '#10b981' }
                        : isCurrent
                        ? { color: '#C9A84C' }
                        : { color: 'rgba(11,28,58,0.3)' }
                    }
                  >
                    {stage.label}
                  </span>
                  <span
                    className="text-[9.5px] text-center leading-tight mt-0.5 hidden sm:block"
                    style={{ color: 'rgba(11,28,58,0.28)' }}
                  >
                    {stage.desc}
                  </span>
                </div>
              </div>

              {/* Connector */}
              {index < STAGES.length - 1 && (
                <div
                  className="flex-1 mt-4 mx-1"
                  style={{
                    height: 2,
                    borderRadius: 1,
                    background: isDone ? '#10b981' : 'rgba(11,28,58,0.1)',
                    transition: 'background 0.3s ease',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
