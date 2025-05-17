import React from 'react';

// Export components
export * from './components/button';

// Direct export of placeholder if needed
export const Placeholder = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className="p-4 border border-gray-300 rounded" {...props}>
      {children}
    </div>
  );
};

// You can add your actual component exports here
// For now, let's create a placeholder
export const Button = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button 
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" 
      {...props}
    >
      {children}
    </button>
  );
}; 