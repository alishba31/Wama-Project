import { cn } from '@/lib/utils'; // You can use a utility function for handling className concatenations
import React from 'react';

interface LoadingBarProps {
  progress: number;  // Progress value from 0 to 100
  className?: string;  // Additional classes for styling
}

const LoadingBar: React.FC<LoadingBarProps> = ({ progress, className }) => {
  return (
    <div className={cn("w-full h-1 bg-gray-300 rounded", className)}>
      <div
        className="h-full bg-primary rounded"
        style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
      />
    </div>
  );
};

export default LoadingBar;
