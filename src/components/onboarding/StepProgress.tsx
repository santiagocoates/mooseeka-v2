const STEPS = [
  { n: 1, label: 'Tu perfil' },
  { n: 2, label: 'Roles' },
  { n: 3, label: 'Géneros' },
  { n: 4, label: 'Objetivo' },
]

export default function StepProgress({ current }: { current: number }) {
  return (
    <div className="w-full mb-8">
      {/* Step dots + line */}
      <div className="flex items-center gap-0 mb-3">
        {STEPS.map((s, i) => {
          const done    = current > s.n
          const active  = current === s.n
          const pending = current < s.n
          return (
            <div key={s.n} className="flex items-center flex-1 last:flex-none">
              {/* Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all`}
                style={
                  done    ? { background: 'linear-gradient(135deg,#8B3FFF,#FF1A8C)', color: '#fff' } :
                  active  ? { background: 'rgba(139,63,255,0.2)', border: '2px solid #8B3FFF', color: '#A855F7' } :
                            { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(123,47,255,0.2)', color: '#7A6890' }
                }>
                {done ? '✓' : s.n}
              </div>
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 rounded-full transition-all"
                  style={{ background: done ? 'linear-gradient(90deg,#8B3FFF,#FF1A8C)' : 'rgba(123,47,255,0.2)' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex items-center">
        {STEPS.map((s, i) => {
          const active = current === s.n
          const done   = current > s.n
          return (
            <div key={s.n} className={`flex-1 last:flex-none text-xs font-medium ${i < STEPS.length - 1 ? '' : ''}`}
              style={{ color: active ? '#A855F7' : done ? '#7B2FFF' : '#7A6890' }}>
              {s.label}
            </div>
          )
        })}
      </div>

      {/* Step indicator */}
      <p className="text-xs mt-3" style={{ color: '#7A6890' }}>
        Paso <span style={{ color: '#A855F7' }}>{current}</span> de {STEPS.length}
      </p>
    </div>
  )
}
