const Form = ({ 
    onSubmit, 
    children, 
    className = '' 
  }) => {
    const handleSubmit = (e) => {
      e.preventDefault()
      onSubmit(e)
    }
  
    return (
      <form 
        onSubmit={handleSubmit} 
        className={`space-y-6 ${className}`}
      >
        {children}
      </form>
    )
  }
  
  export default Form
