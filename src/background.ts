// Service worker for the Arabic Learning Extension
import { initDB, loadVocabularyData, getSetting, updateSetting } from './utils/database';

// Initialize the extension
const initialize = async () => {
  try {
    // Initialize the database
    const db = await initDB();
    console.log('Database initialized successfully');
    
    // Load vocabulary data if needed
    await loadVocabularyData();
    
    // Set up alarms for spaced repetition notifications
    setupAlarms();
    
    console.log('Arabic Learning Extension initialized successfully');
  } catch (error) {
    console.error('Failed to initialize extension:', error);
  }
};

// Set up alarms for spaced repetition notifications
const setupAlarms = () => {
  // Daily review reminder
  chrome.alarms.create('dailyReview', {
    delayInMinutes: 60,
    periodInMinutes: 24 * 60 // Daily
  });
  
  // Check for browsing pauses to show flashcards
  chrome.alarms.create('checkBrowsingPause', {
    delayInMinutes: 1,
    periodInMinutes: 5 // Check every 5 minutes
  });
};

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReview') {
    // Send notification for daily review
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Arabic Learning Reminder',
      message: 'Time for your daily Arabic vocabulary review!'
    });
  } else if (alarm.name === 'checkBrowsingPause') {
    // Check if user is in a browsing pause and show flashcards if appropriate
    checkBrowsingActivity();
  }
});

// Check for browsing activity to determine if user is in a pause
let lastActiveTime = Date.now();
const checkBrowsingActivity = async () => {
  const now = Date.now();
  const inactiveTime = now - lastActiveTime;
  
  // If user has been inactive for more than 2 minutes but less than 10 minutes
  // (to avoid showing flashcards during long breaks)
  if (inactiveTime > 2 * 60 * 1000 && inactiveTime < 10 * 60 * 1000) {
    // Check if notifications are enabled in settings
    const notificationsEnabled = await getSetting('notificationsEnabled');
    if (notificationsEnabled) {
      // Show flashcard notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Arabic Learning Opportunity',
        message: 'Take a quick moment to review some Arabic vocabulary?',
        buttons: [
          { title: 'Review Now' }
        ]
      });
    }
  }
  
  // Update last active time
  lastActiveTime = now;
};

// Listen for user activity to update lastActiveTime
chrome.tabs.onUpdated.addListener(() => {
  lastActiveTime = Date.now();
});

chrome.tabs.onActivated.addListener(() => {
  lastActiveTime = Date.now();
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) { // "Review Now" button
    // Open popup for flashcard review
    chrome.action.openPopup();
  }
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyzePageContent') {
    // Analyze page content for relevant vocabulary
    analyzePageContent(message.content)
      .then(relevantWords => sendResponse({ relevantWords }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  } else if (message.action === 'saveWord') {
    // Save new vocabulary word to database
    // Implementation will be added later
    sendResponse({ success: true });
  } else if (message.action === 'getProgress') {
    // Retrieve user progress data
    // Implementation will be added later
    sendResponse({ progress: {} });
  } else if (message.action === 'updateSetting') {
    // Update user setting
    updateSetting(message.key, message.value)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indicates async response
  }
});

// Analyze page content for relevant Arabic vocabulary
const analyzePageContent = async (content: string) => {
  // This is a placeholder for the actual text analysis algorithm
  // In a real implementation, this would use NLP techniques to identify
  // relevant Arabic words based on the page content
  
  // For now, we'll return a simple mock result
  return [
    { id: 1, word: 'الله', translation: 'Allah' },
    { id: 2, word: 'الرحمن', translation: 'The Most Gracious' },
    { id: 3, word: 'الرحيم', translation: 'The Most Merciful' }
  ];
};

// Initialize the extension when the service worker starts
initialize();
