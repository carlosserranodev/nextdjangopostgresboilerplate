const Checkbox = ({
    label,
    checked,
    onChange,
    name,
    disabled = false,
    className = ''
  }) => {
    return (
      <label className={`flex items-center space-x-2 ${className}`}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-4 h-4 text-blue-600 border-gray-300 rounded
            focus:ring-blue-500
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        {label && (
          <span className={`text-sm ${disabled ? 'text-gray-500' : 'text-gray-700'}`}>
            {label}
          </span>
        )}
      </label>
    )
  }
  
  export default Checkbox