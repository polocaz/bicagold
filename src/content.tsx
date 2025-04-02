// Content script for the Arabic Learning Extension
import '../styles/tailwind.css';

// Initialize the content script
const initialize = () => {
  console.log('Arabic Learning Extension content script loaded');
  
  // Set up event listeners
  setupEventListeners();
  
  // Analyze page content for relevant Arabic vocabulary
  analyzePageContent();
  
  // Set up hover translation
  setupHoverTranslation();
  
  // Set up flashcard system for browsing pauses
  setupFlashcardSystem();
};

// Set up event listeners
const setupEventListeners = () => {
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getPageContent') {
      // Return page content for analysis
      sendResponse({ content: document.body.innerText });
    } else if (message.action === 'showFlashcard') {
      // Show a flashcard in the page
      showFlashcard(message.word);
      sendResponse({ success: true });
    }
    return true; // Indicates async response
  });
  
  // Listen for DOM mutations to handle dynamically loaded content
  const observer = new MutationObserver(mutations => {
    // Re-analyze page content when significant changes occur
    if (shouldReanalyzeContent(mutations)) {
      analyzePageContent();
    }
  });
  
  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
};

// Determine if content changes warrant reanalysis
const shouldReanalyzeContent = (mutations: MutationRecord[]) => {
  // This is a simple heuristic - in a real implementation, this would be more sophisticated
  let significantChanges = 0;
  
  for (const mutation of mutations) {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      significantChanges++;
    }
  }
  
  // Only reanalyze if there are significant changes
  return significantChanges > 5;
};

// Analyze page content for relevant Arabic vocabulary
const analyzePageContent = () => {
  // Get the page content
  const content = document.body.innerText;
  
  // Send the content to the background script for analysis
  chrome.runtime.sendMessage(
    { action: 'analyzePageContent', content },
    response => {
      if (response && response.relevantWords) {
        // Display relevant vocabulary
        displayRelevantVocabulary(response.relevantWords);
      }
    }
  );
};

// Display relevant vocabulary in a sidebar
const displayRelevantVocabulary = (words: Array<{ id: number, word: string, translation: string }>) => {
  // Check if sidebar already exists
  let sidebar = document.getElementById('arabic-learning-sidebar');
  
  // Create sidebar if it doesn't exist
  if (!sidebar) {
    sidebar = document.createElement('div');
    sidebar.id = 'arabic-learning-sidebar';
    sidebar.className = 'fixed top-20 right-4 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 transition-transform transform translate-x-0';
    sidebar.style.maxHeight = 'calc(100vh - 40px)';
    sidebar.style.overflowY = 'auto';
    
    // Add toggle button
    const toggleButton = document.createElement('button');
    toggleButton.className = 'absolute -left-10 top-2 bg-blue-500 hover:bg-blue-600 text-white rounded-l-lg p-2';
    toggleButton.innerHTML = '◀';
    toggleButton.onclick = () => {
      if (sidebar.classList.contains('translate-x-0')) {
        sidebar.classList.remove('translate-x-0');
        sidebar.classList.add('translate-x-full');
        toggleButton.innerHTML = '▶';
      } else {
        sidebar.classList.remove('translate-x-full');
        sidebar.classList.add('translate-x-0');
        toggleButton.innerHTML = '◀';
      }
    };
    sidebar.appendChild(toggleButton);
    
    // Add header
    const header = document.createElement('h2');
    header.className = 'text-lg font-bold mb-4 text-gray-900 dark:text-white';
    header.textContent = 'Arabic Vocabulary';
    sidebar.appendChild(header);
    
    document.body.appendChild(sidebar);
  }
  
  // Clear existing content
  const contentContainer = sidebar.querySelector('.vocabulary-content') || (() => {
    const container = document.createElement('div');
    container.className = 'vocabulary-content';
    sidebar.appendChild(container);
    return container;
  })();
  
  // If contentContainer is a function, call it, otherwise use it directly
  const container = typeof contentContainer === 'function' ? contentContainer() : contentContainer;
  
  // Clear existing content
  container.innerHTML = '';
  
  // Add words to sidebar
  words.forEach(word => {
    const wordElement = document.createElement('div');
    wordElement.className = 'mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded';
    
    const arabicText = document.createElement('p');
    arabicText.className = 'text-xl font-bold text-gray-900 dark:text-white';
    arabicText.textContent = word.word;
    wordElement.appendChild(arabicText);
    
    const translationText = document.createElement('p');
    translationText.className = 'text-sm text-gray-600 dark:text-gray-300';
    translationText.textContent = word.translation;
    wordElement.appendChild(translationText);
    
    // Add button to save word for later review
    const saveButton = document.createElement('button');
    saveButton.className = 'mt-1 text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded';
    saveButton.textContent = 'Save for Review';
    saveButton.onclick = () => {
      chrome.runtime.sendMessage(
        { action: 'saveWord', wordId: word.id },
        response => {
          if (response && response.success) {
            saveButton.textContent = 'Saved';
            saveButton.disabled = true;
            saveButton.className = 'mt-1 text-xs bg-green-500 text-white px-2 py-1 rounded cursor-not-allowed';
          }
        }
      );
    };
    wordElement.appendChild(saveButton);
    
    container.appendChild(wordElement);
  });
};

// Set up hover translation for Arabic text
const setupHoverTranslation = () => {
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'fixed bg-white dark:bg-gray-800 p-2 rounded shadow-lg z-50 hidden';
  tooltip.style.maxWidth = '300px';
  document.body.appendChild(tooltip);
  
  // Add event listeners to detect Arabic text
  document.addEventListener('mouseover', event => {
    const target = event.target as HTMLElement;
    
    // Check if the element contains Arabic text
    if (target.textContent && containsArabic(target.textContent)) {
      // Show tooltip with translation
      showTooltip(target, tooltip);
    }
  });
  
  document.addEventListener('mouseout', () => {
    // Hide tooltip
    tooltip.classList.add('hidden');
  });
};

// Check if text contains Arabic characters
const containsArabic = (text: string) => {
  // Arabic Unicode range
  const arabicRegex = /[\u0600-\u06FF]/;
  return arabicRegex.test(text);
};

// Show tooltip with translation
const showTooltip = (element: HTMLElement, tooltip: HTMLElement) => {
  // Get the Arabic text
  const text = element.textContent;
  
  // In a real implementation, this would look up the translation in the database
  // For now, we'll just show a placeholder
  tooltip.textContent = `Translation: ${text}`;
  
  // Position the tooltip near the element
  const rect = element.getBoundingClientRect();
  tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
  
  // Show the tooltip
  tooltip.classList.remove('hidden');
};

// Set up flashcard system for browsing pauses
const setupFlashcardSystem = () => {
  // This will be implemented with the actual spaced repetition algorithm
  console.log('Setting up flashcard system for browsing pauses');
  
  // In a real implementation, this would detect browsing pauses and show flashcards
  // For now, we'll just log a message
};

// Show a flashcard in the page
const showFlashcard = (word: { id: number, arabic: string, translation: string }) => {
  // Create flashcard element
  const flashcard = document.createElement('div');
  flashcard.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl z-50';
  flashcard.style.minWidth = '300px';
  
  // Add word
  const wordElement = document.createElement('p');
  wordElement.className = 'text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white';
  wordElement.textContent = word.arabic;
  flashcard.appendChild(wordElement);
  
  // Add translation (hidden initially)
  const translationElement = document.createElement('p');
  translationElement.className = 'text-xl text-center mb-6 text-gray-600 dark:text-gray-300 hidden';
  translationElement.textContent = word.translation;
  flashcard.appendChild(translationElement);
  
  // Add "Show Translation" button
  const showButton = document.createElement('button');
  showButton.className = 'w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded mb-2';
  showButton.textContent = 'Show Translation';
  showButton.onclick = () => {
    translationElement.classList.remove('hidden');
    showButton.classList.add('hidden');
    buttonsContainer.classList.remove('hidden');
  };
  flashcard.appendChild(showButton);
  
  // Add buttons container (hidden initially)
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'flex justify-between hidden';
  
  // Add "I knew it" button
  const knewButton = document.createElement('button');
  knewButton.className = 'flex-1 mr-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded';
  knewButton.textContent = 'I knew it';
  knewButton.onclick = () => {
    // Update progress in the database
    chrome.runtime.sendMessage(
      { action: 'updateProgress', wordId: word.id, correct: true },
      () => {
        // Remove flashcard
        document.body.removeChild(flashcard);
      }
    );
  };
  buttonsContainer.appendChild(knewButton);
  
  // Add "Still learning" button
  const learningButton = document.createElement('button');
  learningButton.className = 'flex-1 ml-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded';
  learningButton.textContent = 'Still learning';
  learningButton.onclick = () => {
    // Update progress in the database
    chrome.runtime.sendMessage(
      { action: 'updateProgress', wordId: word.id, correct: false },
      () => {
        // Remove flashcard
        document.body.removeChild(flashcard);
      }
    );
  };
  buttonsContainer.appendChild(learningButton);
  
  flashcard.appendChild(buttonsContainer);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.className = 'absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200';
  closeButton.textContent = '✕';
  closeButton.onclick = () => {
    document.body.removeChild(flashcard);
  };
  flashcard.appendChild(closeButton);
  
  // Add flashcard to page
  document.body.appendChild(flashcard);
};

// Initialize the content script when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initialize);
