import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/tailwind.css';
import { initDB, getVocabularyByDifficulty, getVocabularyForReview, updateVocabularyProgress, getSetting, updateSetting } from '../utils/database';

// Define interfaces for component props and state
interface VocabularyItem {
  id?: number;
  word: string;
  transliteration: string;
  translation: string;
  examples?: string[];
  etymology?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  audioUrl?: string;
}

interface TabProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

// Tab component for navigation
const Tab: React.FC<TabProps> = ({ label, active, onClick }) => {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      } rounded-t-lg`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

// Main Popup component
const Popup: React.FC = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'flashcards' | 'reference' | 'settings'>('vocabulary');
  
  // State for vocabulary items
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([]);
  
  // State for flashcards
  const [flashcards, setFlashcards] = useState<VocabularyItem[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  
  // State for settings
  const [settings, setSettings] = useState({
    dailyGoal: 10,
    notificationsEnabled: true,
    theme: 'auto' as 'light' | 'dark' | 'auto'
  });
  
  // State for reference phrases
  const [referenceItems] = useState([
    { arabic: 'السلام عليكم', transliteration: 'Assalamu alaikum', translation: 'Peace be upon you' },
    { arabic: 'الحمد لله', transliteration: 'Alhamdulillah', translation: 'Praise be to Allah' },
    { arabic: 'بسم الله الرحمن الرحيم', transliteration: 'Bismillah ir-Rahman ir-Rahim', translation: 'In the name of Allah, the Most Gracious, the Most Merciful' },
    { arabic: 'ما شاء الله', transliteration: 'Masha Allah', translation: 'As Allah has willed' },
    { arabic: 'جزاك الله خيرا', transliteration: 'Jazak Allahu Khayran', translation: 'May Allah reward you with goodness' }
  ]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Initialize database
        await initDB();
        
        // Load vocabulary items
        const items = await getVocabularyByDifficulty('beginner', 10);
        setVocabularyItems(items);
        
        // Load flashcards for review
        const cards = await getVocabularyForReview();
        setFlashcards(cards);
        
        // Load settings
        const dailyGoal = await getSetting('dailyGoal') || 10;
        const notificationsEnabled = await getSetting('notificationsEnabled') !== false;
        const theme = await getSetting('theme') || 'auto';
        
        setSettings({
          dailyGoal,
          notificationsEnabled,
          theme: theme as 'light' | 'dark' | 'auto'
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);
  
  // Handle flashcard response
  const handleFlashcardResponse = async (correct: boolean) => {
    if (flashcards.length === 0 || currentFlashcardIndex >= flashcards.length) return;
    
    const currentCard = flashcards[currentFlashcardIndex];
    if (currentCard.id) {
      await updateVocabularyProgress(currentCard.id, correct);
    }
    
    // Move to next flashcard
    if (currentFlashcardIndex < flashcards.length - 1) {
      setCurrentFlashcardIndex(currentFlashcardIndex + 1);
      setShowTranslation(false);
    } else {
      // End of flashcards
      setFlashcards([]);
      setCurrentFlashcardIndex(0);
    }
  };
  
  // Handle setting change
  const handleSettingChange = async (key: string, value: any) => {
    await updateSetting(key, value);
    setSettings({ ...settings, [key]: value });
  };
  
  // Render vocabulary tab content
  const renderVocabularyTab = () => (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Arabic Vocabulary</h2>
      <div className="space-y-4">
        {vocabularyItems.length > 0 ? (
          vocabularyItems.map((item, index) => (
            <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
              <p className="text-xl font-bold text-right">{item.word}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.transliteration}</p>
              <p>{item.translation}</p>
              {item.tags && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {item.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Loading vocabulary...</p>
        )}
      </div>
    </div>
  );
  
  // Render flashcards tab content
  const renderFlashcardsTab = () => (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Flashcards</h2>
      {flashcards.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
          <p className="text-3xl font-bold mb-6 text-right">{flashcards[currentFlashcardIndex].word}</p>
          
          {showTranslation ? (
            <>
              <p className="text-xl mb-6">{flashcards[currentFlashcardIndex].translation}</p>
              <div className="flex space-x-4">
                <button
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                  onClick={() => handleFlashcardResponse(true)}
                >
                  I knew it
                </button>
                <button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
                  onClick={() => handleFlashcardResponse(false)}
                >
                  Still learning
                </button>
              </div>
            </>
          ) : (
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              onClick={() => setShowTranslation(true)}
            >
              Show Translation
            </button>
          )}
          
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Card {currentFlashcardIndex + 1} of {flashcards.length}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No flashcards due for review!</p>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={async () => {
              const cards = await getVocabularyByDifficulty('beginner', 5);
              setFlashcards(cards);
              setCurrentFlashcardIndex(0);
              setShowTranslation(false);
            }}
          >
            Practice Random Words
          </button>
        </div>
      )}
    </div>
  );
  
  // Render reference tab content
  const renderReferenceTab = () => (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Common Islamic Phrases</h2>
      <div className="space-y-4">
        {referenceItems.map((item, index) => (
          <div key={index} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <p className="text-xl font-bold text-right">{item.arabic}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{item.transliteration}</p>
            <p>{item.translation}</p>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Render settings tab content
  const renderSettingsTab = () => (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Daily Goal (words)
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={settings.dailyGoal}
            onChange={(e) => handleSettingChange('dailyGoal', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
          />
        </div>
        
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-gray-700 dark:text-gray-300">Enable notifications</span>
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (follow browser)</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-96 h-96 bg-white dark:bg-gray-800 text-gray-900 dark:text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4">
        <h1 className="text-xl font-bold">Arabic Learning Extension</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <Tab
          label="Vocabulary"
          active={activeTab === 'vocabulary'}
          onClick={() => setActiveTab('vocabulary')}
        />
        <Tab
          label="Flashcards"
          active={activeTab === 'flashcards'}
          onClick={() => setActiveTab('flashcards')}
        />
        <Tab
          label="Reference"
          active={activeTab === 'reference'}
          onClick={() => setActiveTab('reference')}
        />
        <Tab
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </div>
      
      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'vocabulary' && renderVocabularyTab()}
        {activeTab === 'flashcards' && renderFlashcardsTab()}
        {activeTab === 'reference' && renderReferenceTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
    </div>
  );
};

// Render the popup
const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.createRoot(root).render(<Popup />);
