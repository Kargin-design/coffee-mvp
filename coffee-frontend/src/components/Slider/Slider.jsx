import './Slider.css'

function Slider({
  min = 12,
  max = 18,
  step = 1,
  value,
  onChange,
  leftLabel = 'Менее насыщенно',
  rightLabel = 'Более насыщенно',
  showTicks = false,
  reverse = false,
  className = '',
}) {
  const safeValue = Number.isFinite(value) ? value : min
  const normalized = (safeValue - min) / (max - min)
  const percent = (reverse ? 1 - normalized : normalized) * 100
  const steps = Math.floor((max - min) / step)

  return (
    <div className={`slider ${className}`.trim()}>
      <div className="slider__header">Ratio 1:{safeValue}</div>
      <div className="slider__track" style={{ '--percent': `${percent}%` }}>
        <div className="slider__ticks">
          {showTicks
            ? Array.from({ length: steps + 1 }).map((_, index) => {
                const tickValue = min + index * step
                const active = reverse
                  ? tickValue >= safeValue
                  : tickValue <= safeValue
                return (
                  <span
                    key={tickValue}
                    className={`slider__tick ${active ? 'slider__tick--active' : ''}`}
                  />
                )
              })
            : null}
        </div>
        <input
          className="slider__input"
          type="range"
          min={min}
          max={max}
          step={step}
          value={safeValue}
          onChange={(event) => onChange?.(Number(event.target.value))}
          aria-label="Ratio"
        />
        <div className="slider__thumb" aria-hidden="true" />
      </div>
      <div className="slider__labels">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

export default Slider
