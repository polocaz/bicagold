// ProgressTracker component for the Arabic Learning Extension
import React from 'react';

// Define interfaces for component props
interface ProgressTrackerProps {
  totalWords: number;
  learnedWords: number;
  dailyGoal: number;
  dailyProgress: number;
  streakDays: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  totalWords,
  learnedWords,
  dailyGoal,
  dailyProgress,
  streakDays
}) => {
  // Calculate percentages
  const overallProgress = Math.round((learnedWords / totalWords) * 100) || 0;
  const todayProgress = Math.round((dailyProgress / dailyGoal) * 100) || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Progress</h3>
      
      {/* Overall progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {learnedWords} of {totalWords} words learned
        </p>
      </div>
      
      {/* Today's progress */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Today's Goal</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{todayProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${
              todayProgress >= 100 ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(todayProgress, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {dailyProgress} of {dailyGoal} words reviewed today
        </p>
      </div>
      
      {/* Streak */}
      <div className="flex items-center">
        <div className="flex items-center justify-center bg-orange-100 dark:bg-orange-900 rounded-full w-10 h-10 mr-3">
          <span className="text-orange-500 dark:text-orange-300">🔥</span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {streakDays} day{streakDays !== 1 ? 's' : ''} streak
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Keep it going!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
