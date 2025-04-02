// User progress analytics for the Arabic Learning Extension
import { getSetting, updateSetting } from './database';

// Define interfaces
interface LearningStats {
  totalWords: number;
  learnedWords: number;
  reviewsToday: number;
  reviewsTotal: number;
  correctAnswers: number;
  incorrectAnswers: number;
  streak: number;
  lastReviewDate: Date | null;
}

interface DailyProgress {
  date: string;
  reviewCount: number;
  correctCount: number;
}

/**
 * Get user's learning statistics
 * @returns Promise with learning statistics
 */
export const getLearningStats = async (): Promise<LearningStats> => {
  try {
    // In a real implementation, this would query the database for actual statistics
    // For the MVP, we'll use stored settings or default values
    const totalWords = 1000; // Total words in the database
    const learnedWords = await getSetting('learnedWordsCount') || 0;
    const reviewsToday = await getSetting('reviewsToday') || 0;
    const reviewsTotal = await getSetting('reviewsTotal') || 0;
    const correctAnswers = await getSetting('correctAnswers') || 0;
    const incorrectAnswers = await getSetting('incorrectAnswers') || 0;
    const streak = await getSetting('streak') || 0;
    const lastReviewDateStr = await getSetting('lastReviewDate');
    const lastReviewDate = lastReviewDateStr ? new Date(lastReviewDateStr) : null;
    
    return {
      totalWords,
      learnedWords,
      reviewsToday,
      reviewsTotal,
      correctAnswers,
      incorrectAnswers,
      streak,
      lastReviewDate
    };
  } catch (error) {
    console.error('Error getting learning stats:', error);
    return {
      totalWords: 1000,
      learnedWords: 0,
      reviewsToday: 0,
      reviewsTotal: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      streak: 0,
      lastReviewDate: null
    };
  }
};

/**
 * Update learning statistics after a review
 * @param correct Whether the answer was correct
 * @returns Promise with updated statistics
 */
export const updateLearningStats = async (correct: boolean): Promise<LearningStats> => {
  try {
    // Get current stats
    const stats = await getLearningStats();
    
    // Update stats
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Check if this is the first review today
    const isNewDay = !stats.lastReviewDate || 
      stats.lastReviewDate.toISOString().split('T')[0] !== today;
    
    // Reset daily count if it's a new day
    const reviewsToday = isNewDay ? 1 : stats.reviewsToday + 1;
    
    // Update streak
    let streak = stats.streak;
    if (isNewDay) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // Check if last review was yesterday to maintain streak
      if (stats.lastReviewDate && 
          stats.lastReviewDate.toISOString().split('T')[0] === yesterdayStr) {
        streak += 1; // Increment streak
      } else if (!stats.lastReviewDate || 
                stats.lastReviewDate.toISOString().split('T')[0] !== today) {
        streak = 1; // Reset streak
      }
    }
    
    // Update correct/incorrect counts
    const correctAnswers = correct ? stats.correctAnswers + 1 : stats.correctAnswers;
    const incorrectAnswers = correct ? stats.incorrectAnswers : stats.incorrectAnswers + 1;
    
    // Calculate learned words (simplified for MVP)
    // In a real implementation, this would be based on mastery level
    const learnedWords = Math.min(stats.totalWords, Math.floor(correctAnswers / 3));
    
    // Update settings
    await updateSetting('learnedWordsCount', learnedWords);
    await updateSetting('reviewsToday', reviewsToday);
    await updateSetting('reviewsTotal', stats.reviewsTotal + 1);
    await updateSetting('correctAnswers', correctAnswers);
    await updateSetting('incorrectAnswers', incorrectAnswers);
    await updateSetting('streak', streak);
    await updateSetting('lastReviewDate', now.toISOString());
    
    // Update daily progress history
    await updateDailyProgress(today, correct);
    
    // Return updated stats
    return {
      totalWords: stats.totalWords,
      learnedWords,
      reviewsToday,
      reviewsTotal: stats.reviewsTotal + 1,
      correctAnswers,
      incorrectAnswers,
      streak,
      lastReviewDate: now
    };
  } catch (error) {
    console.error('Error updating learning stats:', error);
    throw error;
  }
};

/**
 * Update daily progress history
 * @param date Date string in YYYY-MM-DD format
 * @param correct Whether the answer was correct
 */
const updateDailyProgress = async (date: string, correct: boolean): Promise<void> => {
  try {
    // Get current progress history
    const progressHistory: DailyProgress[] = await getSetting('progressHistory') || [];
    
    // Find entry for today
    const todayEntry = progressHistory.find(entry => entry.date === date);
    
    if (todayEntry) {
      // Update existing entry
      todayEntry.reviewCount += 1;
      if (correct) {
        todayEntry.correctCount += 1;
      }
    } else {
      // Create new entry
      progressHistory.push({
        date,
        reviewCount: 1,
        correctCount: correct ? 1 : 0
      });
    }
    
    // Keep only the last 30 days
    const recentHistory = progressHistory
      .sort((a, b) => b.date.localeCompare(a.date)) // Sort by date descending
      .slice(0, 30);
    
    // Save updated history
    await updateSetting('progressHistory', recentHistory);
  } catch (error) {
    console.error('Error updating daily progress:', error);
  }
};

/**
 * Get daily progress history
 * @param days Number of days to retrieve (default: 7)
 * @returns Promise with daily progress history
 */
export const getDailyProgress = async (days = 7): Promise<DailyProgress[]> => {
  try {
    // Get progress history
    const progressHistory: DailyProgress[] = await getSetting('progressHistory') || [];
    
    // Sort by date and take the most recent entries
    return progressHistory
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, days);
  } catch (error) {
    console.error('Error getting daily progress:', error);
    return [];
  }
};

/**
 * Calculate accuracy percentage
 * @returns Promise with accuracy percentage
 */
export const getAccuracyPercentage = async (): Promise<number> => {
  try {
    const stats = await getLearningStats();
    const total = stats.correctAnswers + stats.incorrectAnswers;
    
    if (total === 0) return 0;
    
    return Math.round((stats.correctAnswers / total) * 100);
  } catch (error) {
    console.error('Error calculating accuracy percentage:', error);
    return 0;
  }
};

/**
 * Reset daily progress (called at midnight)
 */
export const resetDailyProgress = async (): Promise<void> => {
  try {
    await updateSetting('reviewsToday', 0);
  } catch (error) {
    console.error('Error resetting daily progress:', error);
  }
};
