// Text analysis utility for the Arabic Learning Extension
import { getVocabularyByTag } from './database';

// Define interfaces
interface AnalysisResult {
  relevantWords: VocabularyItem[];
  arabicWordsCount: number;
}

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

// Arabic Unicode range regex
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;

// Common Arabic words to ignore (stop words)
const ARABIC_STOP_WORDS = [
  'من', 'إلى', 'عن', 'على', 'في', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
  'الذي', 'التي', 'الذين', 'اللذين', 'اللتين', 'هو', 'هي', 'هم', 'هن',
  'أنا', 'أنت', 'أنتم', 'نحن', 'كان', 'كانت', 'كانوا', 'يكون'
];

/**
 * Analyzes page content to find relevant Arabic vocabulary
 * @param content The text content of the page
 * @param maxResults Maximum number of results to return
 * @returns Promise with analysis results
 */
export const analyzePageContent = async (content: string, maxResults = 10): Promise<AnalysisResult> => {
  try {
    // Extract all Arabic words from the content
    const arabicWordsMatches = content.match(ARABIC_REGEX) || [];
    
    // Filter out stop words and count word frequencies
    const wordFrequency: Record<string, number> = {};
    
    arabicWordsMatches.forEach(word => {
      // Normalize the word (remove diacritics, convert to lowercase)
      const normalizedWord = normalizeArabicWord(word);
      
      // Skip stop words and very short words
      if (ARABIC_STOP_WORDS.includes(normalizedWord) || normalizedWord.length < 2) {
        return;
      }
      
      // Count frequency
      wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    });
    
    // Sort words by frequency
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // Get the most frequent words up to maxResults
    const topWords = sortedWords.slice(0, maxResults);
    
    // Fetch vocabulary items for these words
    // In a real implementation, this would query the database for exact matches
    // For now, we'll use a simplified approach with the 'frequently-used' tag
    const vocabularyItems = await getVocabularyByTag('frequently-used', maxResults);
    
    // Return the analysis results
    return {
      relevantWords: vocabularyItems,
      arabicWordsCount: arabicWordsMatches.length
    };
  } catch (error) {
    console.error('Error analyzing page content:', error);
    return {
      relevantWords: [],
      arabicWordsCount: 0
    };
  }
};

/**
 * Normalizes an Arabic word by removing diacritics and converting to a standard form
 * @param word The Arabic word to normalize
 * @returns Normalized word
 */
const normalizeArabicWord = (word: string): string => {
  // Remove Arabic diacritics (tashkeel)
  return word
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove diacritics
    .replace(/\s+/g, '')                   // Remove whitespace
    .trim();
};

/**
 * Checks if text contains Arabic characters
 * @param text The text to check
 * @returns Boolean indicating if text contains Arabic
 */
export const containsArabic = (text: string): boolean => {
  return ARABIC_REGEX.test(text);
};

/**
 * Extracts Arabic words from a text
 * @param text The text to extract from
 * @returns Array of Arabic words
 */
export const extractArabicWords = (text: string): string[] => {
  return text.match(ARABIC_REGEX) || [];
};

/**
 * Determines the context of Arabic text on a page
 * @param content The page content
 * @returns Context category (religious, news, educational, etc.)
 */
export const determineContentContext = (content: string): string => {
  // This is a simplified implementation
  // In a real extension, this would use more sophisticated NLP techniques
  
  // Check for religious terms
  const religiousTerms = ['قرآن', 'الله', 'محمد', 'إسلام', 'صلاة', 'مسجد'];
  const hasReligiousContext = religiousTerms.some(term => content.includes(term));
  
  if (hasReligiousContext) {
    return 'religious';
  }
  
  // Check for news terms
  const newsTerms = ['أخبار', 'عاجل', 'صحيفة', 'جريدة', 'تقرير'];
  const hasNewsContext = newsTerms.some(term => content.includes(term));
  
  if (hasNewsContext) {
    return 'news';
  }
  
  // Default to general
  return 'general';
};
