// HoverTranslation component for the Arabic Learning Extension
import React, { useState, useEffect, useRef } from 'react';

// Define interfaces for component props
interface HoverTranslationProps {
  word: string;
  translation: string;
  position: {
    x: number;
    y: number;
  };
  onClose: () => void;
}

const HoverTranslation: React.FC<HoverTranslationProps> = ({
  word,
  translation,
  position,
  onClose
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  
  // Position the tooltip and handle animation
  useEffect(() => {
    setVisible(true);
    
    // Close tooltip when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={tooltipRef}
      className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, 10px)'
      }}
    >
      {/* Tooltip arrow */}
      <div 
        className="absolute w-3 h-3 bg-white dark:bg-gray-800 transform rotate-45"
        style={{
          top: '-6px',
          left: '50%',
          marginLeft: '-6px'
        }}
      ></div>
      
      {/* Content */}
      <div className="relative">
        <p className="text-lg font-bold mb-1 text-gray-900 dark:text-white text-right" dir="rtl">{word}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{translation}</p>
        
        {/* Save button */}
        <button
          className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
          onClick={(e) => {
            e.stopPropagation();
            // Here you would implement saving the word
            // For now, just close the tooltip
            onClose();
          }}
        >
          Save for Review
        </button>
        
        {/* Close button */}
        <button
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default HoverTranslation;
