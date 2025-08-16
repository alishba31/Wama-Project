import React from 'react';

interface LoadingBarProps {
  progress: number; // Progress percentage (0 - 100)
}

const LoadingBar: React.FC<LoadingBarProps> = ({ progress }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50"> {/* Top of the viewport */}
      <div
        style={{ width: `${progress}%` }}
        className="h-full bg-primary transition-all duration-300"
      />
    </div>
  );
};

export default LoadingBar;