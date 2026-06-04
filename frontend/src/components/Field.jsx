// Small labelled input wrapper to keep forms consistent.
export default function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  placeholder,
  autoComplete,
  textarea = false,
  hint,
  children,
}) {
  return (
    <label className="field" htmlFor={name}>
      <span className="field__label">
        {label}
        {required && <span className="field__required"> *</span>}
      </span>
      {children ? (
        children
      ) : textarea ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      )}
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  )
}
