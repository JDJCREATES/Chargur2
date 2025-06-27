import React from 'react';
import { Zap } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  // Size classes for the logo
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center">
      <h2 className={`font-nova-round ${sizeClasses[size]} text-gray-800 flex items-center`}>
        <span>Charg</span>
        <span className="relative mx-0.5 text-blue-600">
          <Zap className="w-5 h-5 transform rotate-90" />
        </span>
        <span>r</span>
      </h2>
    </div>
  );
};