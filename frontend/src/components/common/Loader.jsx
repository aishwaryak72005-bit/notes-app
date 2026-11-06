import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-forest animate-spin`} />
      {message && <p className="text-sm font-medium text-muted">{message}</p>}
    </div>
  );
};

export default Loader;
