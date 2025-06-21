import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg';
  src?: string;
  alt?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  size = 'md', 
  src, 
  alt = 'User avatar' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center overflow-hidden`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <User size={iconSizes[size]} className="text-gray-500" />
      )}
    </div>
  );
};