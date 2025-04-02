import { openDB } from 'idb';

// Define the database schema
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

interface UserProgress {
  wordId: number;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: Date;
  nextReview: Date;
  easeFactor: number;
}

interface UserSettings {
  id: string;
  value: any;
}

// Database interface
interface ArabicLearningDB {
  vocabulary: {
    key: number;
    value: VocabularyItem;
    indexes: {
      word: string;
      difficulty: string;
      tags: string[];
    };
  };
  progress: {
    key: number;
    value: UserProgress;
    indexes: {
      nextReview: Date;
    };
  };
  settings: {
    key: string;
    value: UserSettings;
  };
}

// Initialize the database
export const initDB = async () => {
  const db = await openDB<ArabicLearningDB>('ArabicLearningDB', 1, {
    upgrade(db) {
      // Create vocabulary store
      const vocabularyStore = db.createObjectStore('vocabulary', { keyPath: 'id', autoIncrement: true });
      vocabularyStore.createIndex('word', 'word', { unique: true });
      vocabularyStore.createIndex('difficulty', 'difficulty', { unique: false });
      vocabularyStore.createIndex('tags', 'tags', { multiEntry: true });

      // Create progress store
      const progressStore = db.createObjectStore('progress', { keyPath: 'wordId' });
      progressStore.createIndex('nextReview', 'nextReview', { unique: false });

      // Create settings store
      db.createObjectStore('settings', { keyPath: 'id' });
    },
  });

  return db;
};

// Load vocabulary data from JSON files
export const loadVocabularyData = async () => {
  try {
    // Import the JSON data
    const arabicWords = await import('../data/uthmani-qurancom.json');
    const translations = await import('../data/en-quranwbw.json');
    const metadata = await import('../data/word-metadata.json');

    // Open the database
    const db = await initDB();

    // Check if vocabulary is already loaded
    const count = await db.count('vocabulary');
    if (count > 0) {
      console.log('Vocabulary already loaded, skipping import');
      return;
    }

    // Process and store the first 1000 words (for MVP)
    const transaction = db.transaction('vocabulary', 'readwrite');
    const store = transaction.objectStore('vocabulary');

    // Create a mapping of difficulty levels based on frequency
    const difficultyMap: { [key: string]: 'beginner' | 'intermediate' | 'advanced' } = {};
    
    // Process the first 1000 words
    const wordLimit = 1000;
    let processedCount = 0;

    for (const [wordId, arabicWord] of Object.entries(arabicWords)) {
      if (processedCount >= wordLimit) break;
      
      const translation = translations[wordId as keyof typeof translations];
      const meta = metadata[wordId as keyof typeof metadata];
      
      if (!arabicWord || !translation || !meta) continue;

      // Determine difficulty based on word ID (lower IDs are more common)
      let difficulty: 'beginner' | 'intermediate' | 'advanced';
      const numericId = parseInt(wordId);
      if (numericId <= 300) {
        difficulty = 'beginner';
      } else if (numericId <= 700) {
        difficulty = 'intermediate';
      } else {
        difficulty = 'advanced';
      }

      // Create tags based on metadata
      const tags = ['quranic'];
      if (meta.surah_id <= 9) tags.push('frequently-used');
      
      // Create vocabulary item
      const vocabItem: VocabularyItem = {
        word: arabicWord as string,
        transliteration: '', // Will be populated later
        translation: translation as string,
        difficulty,
        tags,
      };

      // Add to database
      await store.add(vocabItem);
      processedCount++;
    }

    await transaction.done;
    console.log(`Loaded ${processedCount} vocabulary items into the database`);
    
    // Add default settings
    await db.put('settings', { id: 'dailyGoal', value: 10 });
    await db.put('settings', { id: 'notificationsEnabled', value: true });
    await db.put('settings', { id: 'theme', value: 'auto' });
    
    return processedCount;
  } catch (error) {
    console.error('Error loading vocabulary data:', error);
    throw error;
  }
};

// Get vocabulary items by difficulty
export const getVocabularyByDifficulty = async (difficulty: 'beginner' | 'intermediate' | 'advanced', limit = 20) => {
  const db = await initDB();
  return db.getAllFromIndex('vocabulary', 'difficulty', difficulty, limit);
};

// Get vocabulary items by tags
export const getVocabularyByTag = async (tag: string, limit = 20) => {
  const db = await initDB();
  return db.getAllFromIndex('vocabulary', 'tags', tag, limit);
};

// Get vocabulary items for review
export const getVocabularyForReview = async (limit = 10) => {
  const db = await initDB();
  const now = new Date();
  
  // Get words due for review
  const dueItems = await db.getAllFromIndex(
    'progress', 
    'nextReview', 
    IDBKeyRange.upperBound(now),
    limit
  );
  
  // Get the actual vocabulary items
  const vocabularyItems = await Promise.all(
    dueItems.map(item => db.get('vocabulary', item.wordId))
  );
  
  return vocabularyItems.filter(Boolean);
};

// Update progress for a vocabulary item
export const updateVocabularyProgress = async (wordId: number, correct: boolean) => {
  const db = await initDB();
  
  // Get existing progress or create new
  let progress = await db.get('progress', wordId) || {
    wordId,
    correctCount: 0,
    incorrectCount: 0,
    lastReviewed: new Date(0),
    nextReview: new Date(),
    easeFactor: 2.5, // Initial ease factor for SM-2 algorithm
  };
  
  // Update progress using SM-2 algorithm
  const now = new Date();
  progress.lastReviewed = now;
  
  if (correct) {
    progress.correctCount++;
    // Increase ease factor slightly
    progress.easeFactor = Math.min(progress.easeFactor + 0.1, 3.0);
    
    // Calculate next review date based on ease factor
    const days = Math.round(progress.correctCount * progress.easeFactor);
    progress.nextReview = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  } else {
    progress.incorrectCount++;
    // Decrease ease factor
    progress.easeFactor = Math.max(progress.easeFactor - 0.2, 1.3);
    
    // Review again sooner
    progress.nextReview = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour later
  }
  
  // Save updated progress
  await db.put('progress', progress);
  
  return progress;
};

// Get user settings
export const getSetting = async (id: string) => {
  const db = await initDB();
  const setting = await db.get('settings', id);
  return setting ? setting.value : null;
};

// Update user settings
export const updateSetting = async (id: string, value: any) => {
  const db = await initDB();
  await db.put('settings', { id, value });
};
