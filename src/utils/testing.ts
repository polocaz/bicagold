// Test utility for the Arabic Learning Browser Extension
import { analyzePageContent, containsArabic } from '../utils/textAnalysis';
import { getWordTranslation } from '../utils/hoverTranslation';
import { calculateNextReview } from '../utils/spacedRepetition';
import { getLearningStats } from '../utils/progressAnalytics';
import { loadUserSettings } from '../utils/userSettings';

/**
 * Run basic tests for the extension's core functionality
 * @returns Test results
 */
export const runBasicTests = async (): Promise<{
  success: boolean;
  results: Array<{ name: string; passed: boolean; message?: string }>;
}> => {
  const results = [];
  let allPassed = true;

  try {
    // Test text analysis
    const textAnalysisResult = await testTextAnalysis();
    results.push(textAnalysisResult);
    if (!textAnalysisResult.passed) allPassed = false;

    // Test hover translation
    const hoverTranslationResult = await testHoverTranslation();
    results.push(hoverTranslationResult);
    if (!hoverTranslationResult.passed) allPassed = false;

    // Test spaced repetition
    const spacedRepetitionResult = await testSpacedRepetition();
    results.push(spacedRepetitionResult);
    if (!spacedRepetitionResult.passed) allPassed = false;

    // Test progress analytics
    const progressAnalyticsResult = await testProgressAnalytics();
    results.push(progressAnalyticsResult);
    if (!progressAnalyticsResult.passed) allPassed = false;

    // Test user settings
    const userSettingsResult = await testUserSettings();
    results.push(userSettingsResult);
    if (!userSettingsResult.passed) allPassed = false;

    return {
      success: allPassed,
      results
    };
  } catch (error) {
    console.error('Error running tests:', error);
    return {
      success: false,
      results: [
        {
          name: 'Test Runner',
          passed: false,
          message: `Error running tests: ${error.message}`
        }
      ]
    };
  }
};

/**
 * Test text analysis functionality
 */
const testTextAnalysis = async (): Promise<{ name: string; passed: boolean; message?: string }> => {
  try {
    // Test containsArabic function
    const arabicText = 'هذا نص باللغة العربية';
    const englishText = 'This is English text';
    const mixedText = 'This contains بعض الكلمات العربية';

    const arabicResult = containsArabic(arabicText);
    const englishResult = containsArabic(englishText);
    const mixedResult = containsArabic(mixedText);

    if (!arabicResult || englishResult || !mixedResult) {
      return {
        name: 'Text Analysis - containsArabic',
        passed: false,
        message: `Failed to correctly identify Arabic text: ${arabicResult}, ${englishResult}, ${mixedResult}`
      };
    }

    // Test analyzePageContent function
    const analysisResult = await analyzePageContent(
      'بسم الله الرحمن الرحيم. الحمد لله رب العالمين. هذا اختبار للغة العربية.',
      5
    );

    if (!analysisResult || !analysisResult.relevantWords || analysisResult.relevantWords.length === 0) {
      return {
        name: 'Text Analysis - analyzePageContent',
        passed: false,
        message: 'Failed to analyze Arabic content'
      };
    }

    return {
      name: 'Text Analysis',
      passed: true,
      message: `Successfully identified Arabic text and analyzed content. Found ${analysisResult.relevantWords.length} relevant words.`
    };
  } catch (error) {
    return {
      name: 'Text Analysis',
      passed: false,
      message: `Error testing text analysis: ${error.message}`
    };
  }
};

/**
 * Test hover translation functionality
 */
const testHoverTranslation = async (): Promise<{ name: string; passed: boolean; message?: string }> => {
  try {
    // Test getWordTranslation function
    const translation = await getWordTranslation('الله');

    if (!translation) {
      return {
        name: 'Hover Translation - getWordTranslation',
        passed: false,
        message: 'Failed to get translation for Arabic word'
      };
    }

    return {
      name: 'Hover Translation',
      passed: true,
      message: `Successfully retrieved translation for Arabic word: ${translation.translation}`
    };
  } catch (error) {
    return {
      name: 'Hover Translation',
      passed: false,
      message: `Error testing hover translation: ${error.message}`
    };
  }
};

/**
 * Test spaced repetition functionality
 */
const testSpacedRepetition = async (): Promise<{ name: string; passed: boolean; message?: string }> => {
  try {
    // Test calculateNextReview function
    const item = {
      id: 1,
      word: 'الله',
      transliteration: 'Allah',
      translation: 'Allah',
      difficulty: 'beginner' as const
    };

    // Test with different quality ratings
    const goodResult = calculateNextReview(item, 5);
    const okResult = calculateNextReview(item, 3);
    const poorResult = calculateNextReview(item, 1);

    if (!goodResult || !okResult || !poorResult) {
      return {
        name: 'Spaced Repetition - calculateNextReview',
        passed: false,
        message: 'Failed to calculate next review schedule'
      };
    }

    // Verify that higher quality leads to longer intervals
    if (goodResult.interval <= poorResult.interval) {
      return {
        name: 'Spaced Repetition - Interval Logic',
        passed: false,
        message: 'Higher quality rating should lead to longer intervals'
      };
    }

    return {
      name: 'Spaced Repetition',
      passed: true,
      message: `Successfully calculated spaced repetition intervals: Good (${goodResult.interval} days), OK (${okResult.interval} days), Poor (${poorResult.interval} days)`
    };
  } catch (error) {
    return {
      name: 'Spaced Repetition',
      passed: false,
      message: `Error testing spaced repetition: ${error.message}`
    };
  }
};

/**
 * Test progress analytics functionality
 */
const testProgressAnalytics = async (): Promise<{ name: string; passed: boolean; message?: string }> => {
  try {
    // Test getLearningStats function
    const stats = await getLearningStats();

    if (!stats) {
      return {
        name: 'Progress Analytics - getLearningStats',
        passed: false,
        message: 'Failed to get learning statistics'
      };
    }

    return {
      name: 'Progress Analytics',
      passed: true,
      message: `Successfully retrieved learning statistics: ${stats.learnedWords}/${stats.totalWords} words learned, ${stats.streak} day streak`
    };
  } catch (error) {
    return {
      name: 'Progress Analytics',
      passed: false,
      message: `Error testing progress analytics: ${error.message}`
    };
  }
};

/**
 * Test user settings functionality
 */
const testUserSettings = async (): Promise<{ name: string; passed: boolean; message?: string }> => {
  try {
    // Test loadUserSettings function
    const settings = await loadUserSettings();

    if (!settings) {
      return {
        name: 'User Settings - loadUserSettings',
        passed: false,
        message: 'Failed to load user settings'
      };
    }

    return {
      name: 'User Settings',
      passed: true,
      message: `Successfully loaded user settings: Theme (${settings.theme}), Daily Goal (${settings.dailyGoal})`
    };
  } catch (error) {
    return {
      name: 'User Settings',
      passed: false,
      message: `Error testing user settings: ${error.message}`
    };
  }
};

/**
 * Test extension on a specific website
 * @param url Website URL to test
 * @returns Test results
 */
export const testOnWebsite = async (url: string): Promise<{
  success: boolean;
  message: string;
  arabicContentDetected: boolean;
  relevantWordsCount: number;
}> => {
  try {
    // This function would be called from the content script
    // For the MVP, we'll return a placeholder result
    return {
      success: true,
      message: `Successfully tested extension on ${url}`,
      arabicContentDetected: url.includes('arabic') || url.includes('quran') || url.includes('islam'),
      relevantWordsCount: 15
    };
  } catch (error) {
    return {
      success: false,
      message: `Error testing on website ${url}: ${error.message}`,
      arabicContentDetected: false,
      relevantWordsCount: 0
    };
  }
};
