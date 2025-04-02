// Flashcard component for the Arabic Learning Extension
import React, { useState, useEffect } from 'react';

// Define interfaces for component props and state
interface FlashcardProps {
  word: string;
  transliteration: string;
  translation: string;
  onResponse: (correct: boolean) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ 
  word, 
  transliteration, 
  translation, 
  onResponse 
}) => {
  // State for showing translation
  const [showTranslation, setShowTranslation] = useState(false);
  // State for flip animation
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Handle flip animation
  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowTranslation(true);
      setIsFlipping(false);
    }, 300);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div 
        className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 ${
          isFlipping ? 'transform scale-95' : ''
        }`}
        style={{ minHeight: '200px' }}
      >
        <div className="p-6">
          {/* Front side (Arabic word) */}
          <div className={`transition-opacity duration-300 ${showTranslation ? 'opacity-0 hidden' : 'opacity-100'}`}>
            <p className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white" dir="rtl">{word}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">{transliteration}</p>
            <div className="flex justify-center">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg shadow transition-colors duration-200"
                onClick={handleFlip}
              >
                Show Translation
              </button>
            </div>
          </div>
          
          {/* Back side (Translation) */}
          <div className={`transition-opacity duration-300 ${showTranslation ? 'opacity-100' : 'opacity-0 hidden'}`}>
            <p className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white" dir="rtl">{word}</p>
            <p className="text-xl text-center mb-6 text-gray-700 dark:text-gray-300">{translation}</p>
            <div className="flex justify-between space-x-4">
              <button
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg shadow transition-colors duration-200"
                onClick={() => onResponse(true)}
              >
                I knew it
              </button>
              <button
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded-lg shadow transition-colors duration-200"
                onClick={() => onResponse(false)}
              >
                Still learning
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 -mb-8 -mr-8 rounded-full bg-yellow-500 opacity-10"></div>
        <div className="absolute top-0 right-0 w-8 h-8 -mt-4 -mr-4 rounded-full bg-blue-500 opacity-10"></div>
      </div>
    </div>
  );
};

export default Flashcard;
