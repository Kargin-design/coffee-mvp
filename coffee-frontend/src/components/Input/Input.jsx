import './Input.css'

function Input({
  value,
  placeholder = '18',
  suffix = 'Гр',
  disabled = false,
  state,
  className = '',
  ...props
}) {
  const resolvedState = disabled ? 'disabled' : state
  const classes = ['input', className]

  if (resolvedState) {
    classes.push(`input--${resolvedState}`)
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
      <span className="input__suffix">{suffix}</span>
    </label>
  )
}

export default Input
