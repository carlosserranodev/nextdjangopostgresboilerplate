const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'medium', 
    type = 'button',
    disabled = false,
    onClick,
    className = ''
  }) => {
    const baseStyles = 'rounded-md font-semibold focus:outline-none transition-colors'
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700'
    }
  
    const sizes = {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg'
    }
  
    return (
      <button
        type={type}
        disabled={disabled}
        onClick={onClick}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${sizes[size]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
      >
        {children}
      </button>
    )
  }
  
export default Button
