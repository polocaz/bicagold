// User settings management for the Arabic Learning Browser Extension
import { getSetting, updateSetting } from './database';

// Define interfaces
export interface UserSettings {
  dailyGoal: number;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  showSidebar: boolean;
  hoverTranslationEnabled: boolean;
  autoPlayAudio: boolean;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
}

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  dailyGoal: 10,
  notificationsEnabled: true,
  theme: 'auto',
  showSidebar: true,
  hoverTranslationEnabled: true,
  autoPlayAudio: false,
  difficultyLevel: 'beginner'
};

/**
 * Load user settings
 * @returns Promise with user settings
 */
export const loadUserSettings = async (): Promise<UserSettings> => {
  try {
    // Get settings from database or use defaults
    const dailyGoal = await getSetting('dailyGoal') ?? DEFAULT_SETTINGS.dailyGoal;
    const notificationsEnabled = await getSetting('notificationsEnabled') ?? DEFAULT_SETTINGS.notificationsEnabled;
    const theme = await getSetting('theme') ?? DEFAULT_SETTINGS.theme;
    const showSidebar = await getSetting('showSidebar') ?? DEFAULT_SETTINGS.showSidebar;
    const hoverTranslationEnabled = await getSetting('hoverTranslationEnabled') ?? DEFAULT_SETTINGS.hoverTranslationEnabled;
    const autoPlayAudio = await getSetting('autoPlayAudio') ?? DEFAULT_SETTINGS.autoPlayAudio;
    const difficultyLevel = await getSetting('difficultyLevel') ?? DEFAULT_SETTINGS.difficultyLevel;
    
    return {
      dailyGoal,
      notificationsEnabled,
      theme: theme as 'light' | 'dark' | 'auto',
      showSidebar,
      hoverTranslationEnabled,
      autoPlayAudio,
      difficultyLevel: difficultyLevel as 'beginner' | 'intermediate' | 'advanced'
    };
  } catch (error) {
    console.error('Error loading user settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Save user settings
 * @param settings User settings to save
 * @returns Promise indicating success
 */
export const saveUserSettings = async (settings: Partial<UserSettings>): Promise<boolean> => {
  try {
    // Save each setting to the database
    for (const [key, value] of Object.entries(settings)) {
      await updateSetting(key, value);
    }
    
    // Apply theme if it's included in the settings
    if (settings.theme) {
      applyTheme(settings.theme);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving user settings:', error);
    return false;
  }
};

/**
 * Apply theme to the extension
 * @param theme Theme to apply
 */
export const applyTheme = (theme: 'light' | 'dark' | 'auto'): void => {
  try {
    // Determine which theme to apply
    let appliedTheme: 'light' | 'dark';
    
    if (theme === 'auto') {
      // Check system preference
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      appliedTheme = theme;
    }
    
    // Apply theme to document
    if (appliedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Store the applied theme for content scripts
    chrome.storage.local.set({ appliedTheme });
  } catch (error) {
    console.error('Error applying theme:', error);
  }
};

/**
 * Reset settings to defaults
 * @returns Promise indicating success
 */
export const resetSettings = async (): Promise<boolean> => {
  try {
    await saveUserSettings(DEFAULT_SETTINGS);
    return true;
  } catch (error) {
    console.error('Error resetting settings:', error);
    return false;
  }
};

/**
 * Export user data (settings and progress)
 * @returns Promise with user data as JSON string
 */
export const exportUserData = async (): Promise<string> => {
  try {
    // Get settings
    const settings = await loadUserSettings();
    
    // Get progress data (simplified for MVP)
    const progressData = {
      learnedWords: await getSetting('learnedWordsCount') || 0,
      reviewsTotal: await getSetting('reviewsTotal') || 0,
      correctAnswers: await getSetting('correctAnswers') || 0,
      incorrectAnswers: await getSetting('incorrectAnswers') || 0,
      streak: await getSetting('streak') || 0,
      progressHistory: await getSetting('progressHistory') || []
    };
    
    // Combine data
    const userData = {
      settings,
      progress: progressData,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(userData, null, 2);
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};

/**
 * Import user data
 * @param jsonData User data as JSON string
 * @returns Promise indicating success
 */
export const importUserData = async (jsonData: string): Promise<boolean> => {
  try {
    // Parse JSON data
    const userData = JSON.parse(jsonData);
    
    // Validate data structure
    if (!userData.settings || !userData.progress) {
      throw new Error('Invalid user data format');
    }
    
    // Import settings
    await saveUserSettings(userData.settings);
    
    // Import progress data
    if (userData.progress.learnedWords) {
      await updateSetting('learnedWordsCount', userData.progress.learnedWords);
    }
    if (userData.progress.reviewsTotal) {
      await updateSetting('reviewsTotal', userData.progress.reviewsTotal);
    }
    if (userData.progress.correctAnswers) {
      await updateSetting('correctAnswers', userData.progress.correctAnswers);
    }
    if (userData.progress.incorrectAnswers) {
      await updateSetting('incorrectAnswers', userData.progress.incorrectAnswers);
    }
    if (userData.progress.streak) {
      await updateSetting('streak', userData.progress.streak);
    }
    if (userData.progress.progressHistory) {
      await updateSetting('progressHistory', userData.progress.progressHistory);
    }
    
    return true;
  } catch (error) {
    console.error('Error importing user data:', error);
    return false;
  }
};
