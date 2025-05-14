import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string; // Allow passing custom classes to the tooltip itself
  arrowClassName?: string; // Allow custom classes for the arrow
  delay?: number; // Optional delay in ms before showing
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = 'top',
  className = '',
  arrowClassName = '',
  delay = 100, // Default delay of 100ms
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'left-1/2 -translate-x-1/2 bottom-[-4px] border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700';
      case 'bottom':
        return 'left-1/2 -translate-x-1/2 top-[-4px] border-l-transparent border-r-transparent border-b-gray-900 dark:border-b-gray-700';
      case 'left':
        return 'top-1/2 -translate-y-1/2 right-[-4px] border-t-transparent border-b-transparent border-l-gray-900 dark:border-l-gray-700';
      case 'right':
        return 'top-1/2 -translate-y-1/2 left-[-4px] border-t-transparent border-b-transparent border-r-gray-900 dark:border-r-gray-700';
      default:
        return 'left-1/2 -translate-x-1/2 bottom-[-4px] border-l-transparent border-r-transparent border-t-gray-900 dark:border-t-gray-700';
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-pointer"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`absolute z-20 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg dark:bg-gray-700 transition-opacity duration-150 ease-in-out ${getPositionClasses()} ${className}`}
          role="tooltip"
          style={{ opacity: 1 }} // Initial opacity for transition
        >
          {text}
          <div
            className={`absolute w-0 h-0 border-[4px] ${getArrowPositionClasses()} ${arrowClassName}`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
