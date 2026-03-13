import './Input.css'

function Input({
  value,
  placeholder = 'Загружаю',
  suffix = 'Гр',
  disabled = false,
  loading = false,
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

  const inputProps = {
    type: 'text',
    className: 'input__field',
    placeholder,
    disabled,
    ...props,
  }

  if (value !== undefined) {
    inputProps.value = value
  }

  return (
    <label className={classes.join(' ')}>
      <input {...inputProps} />
      {loading ? <span className="input__spinner" aria-hidden="true" /> : null}
      <span className="input__suffix">{suffix}</span>
    </label>
  )
}

export default Input
