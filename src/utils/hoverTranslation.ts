// Hover translation functionality for the Arabic Learning Extension
import { containsArabic, extractArabicWords } from './textAnalysis';
import { getVocabularyByTag } from './database';

// Define interfaces
interface TranslationResult {
  word: string;
  translation: string;
  transliteration?: string;
  id?: number;
}

/**
 * Get translation for an Arabic word
 * @param word The Arabic word to translate
 * @returns Promise with translation result
 */
export const getWordTranslation = async (word: string): Promise<TranslationResult | null> => {
  try {
    // Normalize the word
    const normalizedWord = normalizeArabicWord(word);
    
    // In a real implementation, this would query the database for an exact match
    // For the MVP, we'll use a simplified approach with the 'frequently-used' tag
    // and filter the results to find a matching word
    const vocabularyItems = await getVocabularyByTag('frequently-used', 100);
    
    // Find a matching word
    const matchingItem = vocabularyItems.find(item => 
      normalizeArabicWord(item.word) === normalizedWord
    );
    
    if (matchingItem) {
      return {
        word: matchingItem.word,
        translation: matchingItem.translation,
        transliteration: matchingItem.transliteration,
        id: matchingItem.id
      };
    }
    
    // If no exact match is found, return a placeholder
    return {
      word,
      translation: 'Translation not available',
      transliteration: ''
    };
  } catch (error) {
    console.error('Error getting word translation:', error);
    return null;
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
 * Process text element for hover translation
 * @param element The DOM element to process
 * @returns Boolean indicating if element contains Arabic
 */
export const processElementForHoverTranslation = (element: HTMLElement): boolean => {
  // Check if element contains Arabic text
  const text = element.textContent || '';
  if (!containsArabic(text)) {
    return false;
  }
  
  // Element contains Arabic, mark it for hover translation
  element.classList.add('arabic-hover-translation');
  
  // Add data attribute with extracted Arabic words
  const arabicWords = extractArabicWords(text);
  if (arabicWords.length > 0) {
    element.setAttribute('data-arabic-words', JSON.stringify(arabicWords));
  }
  
  return true;
};

/**
 * Set up hover translation for a page
 * @param rootElement The root element to process (defaults to document.body)
 * @returns Number of elements processed
 */
export const setupHoverTranslation = (rootElement: HTMLElement = document.body): number => {
  // Find all text nodes that might contain Arabic
  const textElements: HTMLElement[] = [];
  
  // Walk through the DOM tree
  const walker = document.createTreeWalker(
    rootElement,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip script and style elements
        const parentNode = node.parentNode as HTMLElement;
        if (
          parentNode.nodeName === 'SCRIPT' ||
          parentNode.nodeName === 'STYLE' ||
          parentNode.classList.contains('arabic-hover-translation-tooltip')
        ) {
          return NodeFilter.FILTER_REJECT;
        }
        
        // Accept nodes with Arabic text
        const text = node.textContent || '';
        return containsArabic(text)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP;
      }
    }
  );
  
  // Process each text node
  let node;
  let processedCount = 0;
  
  while ((node = walker.nextNode())) {
    const parentElement = node.parentNode as HTMLElement;
    if (parentElement && processElementForHoverTranslation(parentElement)) {
      processedCount++;
    }
  }
  
  return processedCount;
};

/**
 * Create a tooltip element for hover translation
 * @returns The tooltip element
 */
export const createTranslationTooltip = (): HTMLElement => {
  // Check if tooltip already exists
  let tooltip = document.getElementById('arabic-hover-translation-tooltip');
  
  if (!tooltip) {
    // Create tooltip element
    tooltip = document.createElement('div');
    tooltip.id = 'arabic-hover-translation-tooltip';
    tooltip.className = 'arabic-hover-translation-tooltip fixed bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-50 hidden';
    tooltip.style.maxWidth = '300px';
    document.body.appendChild(tooltip);
  }
  
  return tooltip;
};

/**
 * Show translation tooltip for an element
 * @param element The element to show translation for
 * @param tooltip The tooltip element
 */
export const showTranslationTooltip = async (
  element: HTMLElement,
  tooltip: HTMLElement,
  position: { x: number, y: number }
): Promise<void> => {
  // Get Arabic words from the element
  const arabicWordsAttr = element.getAttribute('data-arabic-words');
  if (!arabicWordsAttr) return;
  
  try {
    const arabicWords = JSON.parse(arabicWordsAttr);
    if (!arabicWords.length) return;
    
    // Get translation for the first word
    const translation = await getWordTranslation(arabicWords[0]);
    if (!translation) return;
    
    // Update tooltip content
    tooltip.innerHTML = `
      <div class="relative">
        <p class="text-lg font-bold mb-1 text-gray-900 dark:text-white text-right" dir="rtl">${translation.word}</p>
        ${translation.transliteration ? `<p class="text-xs text-gray-500 dark:text-gray-400 mb-1">${translation.transliteration}</p>` : ''}
        <p class="text-sm text-gray-700 dark:text-gray-300">${translation.translation}</p>
        
        ${translation.id ? `
          <button
            class="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded save-word-button"
            data-word-id="${translation.id}"
          >
            Save for Review
          </button>
        ` : ''}
        
        <button
          class="absolute top-0 right-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 close-tooltip-button"
        >
          ✕
        </button>
      </div>
    `;
    
    // Position the tooltip
    tooltip.style.top = `${position.y + 20}px`;
    tooltip.style.left = `${position.x}px`;
    
    // Show the tooltip
    tooltip.classList.remove('hidden');
    
    // Add event listeners
    const saveButton = tooltip.querySelector('.save-word-button');
    if (saveButton) {
      saveButton.addEventListener('click', (e) => {
        e.stopPropagation();
        const wordId = saveButton.getAttribute('data-word-id');
        if (wordId) {
          // Save word for review
          chrome.runtime.sendMessage(
            { action: 'saveWord', wordId: parseInt(wordId) },
            () => {
              saveButton.textContent = 'Saved';
              saveButton.classList.add('bg-green-500');
              saveButton.classList.remove('bg-blue-500', 'hover:bg-blue-600');
              (saveButton as HTMLButtonElement).disabled = true;
            }
          );
        }
      });
    }
    
    const closeButton = tooltip.querySelector('.close-tooltip-button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        tooltip.classList.add('hidden');
      });
    }
  } catch (error) {
    console.error('Error showing translation tooltip:', error);
  }
};

/**
 * Hide translation tooltip
 * @param tooltip The tooltip element
 */
export const hideTranslationTooltip = (tooltip: HTMLElement): void => {
  tooltip.classList.add('hidden');
};
