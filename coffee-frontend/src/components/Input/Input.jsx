import './Input.css'

function Input({
  value,
  placeholder = 'Загружаю',
  suffix = 'Гр',
  disabled = false,
  loading = false,
  numeric = false,
  state,
  className = '',
  ...props
}) {
  const resolvedState = disabled || loading ? 'disabled' : state
  const classes = ['input', className]

  if (resolvedState) {
    classes.push(`input--${resolvedState}`)
  }
  if (loading) {
    classes.push('input--loading')
  }

  const { onChange, ...rest } = props
  const inputProps = {
    type: 'text',
    className: 'input__field',
    placeholder,
    disabled,
    ...rest,
  }

  if (value !== undefined) {
    inputProps.value = value
  }

  return (
    <label className={classes.join(' ')}>
      <input
        {...inputProps}
        inputMode={numeric ? 'decimal' : inputProps.inputMode}
        onChange={(event) => {
          if (!numeric) {
            onChange?.(event)
            return
          }

          const raw = event.target.value
          let next = raw.replace(/[^0-9.]/g, '')
          const parts = next.split('.')
          if (parts.length > 2) {
            next = `${parts[0]}.${parts.slice(1).join('')}`
          }
          if (next !== raw) {
            event.target.value = next
          }
          onChange?.(event)
        }}
      />
      {loading ? <span className="input__spinner" aria-hidden="true" /> : null}
      <span className="input__suffix">{suffix}</span>
    </label>
  )
}

export default Input
