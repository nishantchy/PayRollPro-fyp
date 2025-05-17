import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}: ButtonProps) => {
  const baseStyles = 'px-4 py-2 rounded font-medium transition-colors';
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-100'
  };
  
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${className}`;
  
  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
}; 