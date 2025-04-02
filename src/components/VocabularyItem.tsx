// VocabularyItem component for the Arabic Learning Extension
import React from 'react';

// Define interfaces for component props
interface VocabularyItemProps {
  word: string;
  transliteration: string;
  translation: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onSave?: () => void;
  saved?: boolean;
}

const VocabularyItem: React.FC<VocabularyItemProps> = ({
  word,
  transliteration,
  translation,
  tags = [],
  difficulty,
  onSave,
  saved = false
}) => {
  // Get color based on difficulty
  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-4">
        {/* Arabic word */}
        <p className="text-2xl font-bold mb-1 text-gray-900 dark:text-white text-right" dir="rtl">{word}</p>
        
        {/* Transliteration */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{transliteration}</p>
        
        {/* Translation */}
        <p className="text-base text-gray-700 dark:text-gray-300 mb-3">{translation}</p>
        
        {/* Tags and difficulty */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {difficulty && (
            <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor()}`}>
              {difficulty}
            </span>
          )}
          
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Save button */}
        {onSave && (
          <button
            onClick={onSave}
            disabled={saved}
            className={`w-full mt-2 py-1.5 px-3 rounded-md text-sm font-medium transition-colors duration-200 ${
              saved
                ? 'bg-green-500 text-white cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {saved ? 'Saved for Review' : 'Save for Review'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VocabularyItem;
