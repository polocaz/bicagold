// Spaced repetition system for the Arabic Learning Extension
import { updateVocabularyProgress, getVocabularyForReview } from './database';

// Define interfaces
interface ReviewItem {
  id: number;
  word: string;
  transliteration: string;
  translation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lastReviewed?: Date;
  nextReview?: Date;
  easeFactor?: number;
  correctCount?: number;
  incorrectCount?: number;
}

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo SM-2 algorithm for spaced repetition
 * 
 * @param item The vocabulary item being reviewed
 * @param quality The quality of recall (0-5, where 0 is complete blackout and 5 is perfect recall)
 * @returns Updated review schedule information
 */
export const calculateNextReview = (
  item: ReviewItem,
  quality: number
): { nextReview: Date; easeFactor: number; interval: number } => {
  // Ensure quality is within bounds
  quality = Math.max(0, Math.min(5, quality));
  
  // Default values if this is the first review
  let easeFactor = item.easeFactor || 2.5;
  let interval = 1; // Default interval in days
  
  // If the item has been reviewed before
  if (item.lastReviewed) {
    // Calculate new ease factor based on quality of recall
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    
    // Calculate new interval
    if (quality < 3) {
      // If recall was difficult, reset interval to 1 day
      interval = 1;
    } else {
      // Calculate next interval based on previous interval
      const previousInterval = Math.ceil(
        (item.nextReview!.getTime() - item.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (previousInterval === 1) {
        interval = 6;
      } else if (previousInterval === 6) {
        interval = Math.round(previousInterval * easeFactor);
      } else {
        interval = Math.round(previousInterval * easeFactor);
      }
    }
  } else {
    // First review - interval depends on quality
    if (quality >= 4) {
      interval = 3; // Good recall - 3 days
    } else if (quality >= 3) {
      interval = 2; // Okay recall - 2 days
    } else {
      interval = 1; // Poor recall - 1 day
    }
  }
  
  // Calculate next review date
  const now = new Date();
  const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
  
  return {
    nextReview,
    easeFactor,
    interval
  };
};

/**
 * Process a review response
 * @param wordId The ID of the vocabulary item
 * @param correct Whether the user's response was correct
 * @returns Promise with the updated review information
 */
export const processReviewResponse = async (wordId: number, correct: boolean): Promise<void> => {
  try {
    // Convert boolean to quality score (simplified for MVP)
    // In a more advanced implementation, we could use a scale of 0-5
    const quality = correct ? 4 : 2;
    
    // Update progress in the database
    await updateVocabularyProgress(wordId, correct);
    
    console.log(`Processed review for word ${wordId}: ${correct ? 'correct' : 'incorrect'}`);
  } catch (error) {
    console.error('Error processing review response:', error);
    throw error;
  }
};

/**
 * Get vocabulary items due for review
 * @param limit Maximum number of items to return
 * @returns Promise with array of review items
 */
export const getDueReviews = async (limit = 10): Promise<ReviewItem[]> => {
  try {
    return await getVocabularyForReview(limit);
  } catch (error) {
    console.error('Error getting due reviews:', error);
    return [];
  }
};

/**
 * Calculate user's learning streak
 * @returns Promise with the current streak in days
 */
export const calculateStreak = async (): Promise<number> => {
  try {
    // In a real implementation, this would query the database for review history
    // For the MVP, we'll return a placeholder value
    return 3; // Placeholder: 3-day streak
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
};

/**
 * Get user's learning statistics
 * @returns Promise with learning statistics
 */
export const getLearningStats = async (): Promise<{
  totalWords: number;
  learnedWords: number;
  reviewsToday: number;
  streak: number;
}> => {
  try {
    // In a real implementation, this would query the database for actual statistics
    // For the MVP, we'll return placeholder values
    const streak = await calculateStreak();
    
    return {
      totalWords: 1000,
      learnedWords: 42,
      reviewsToday: 15,
      streak
    };
  } catch (error) {
    console.error('Error getting learning stats:', error);
    return {
      totalWords: 0,
      learnedWords: 0,
      reviewsToday: 0,
      streak: 0
    };
  }
};
