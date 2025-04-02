// Performance optimization for the Arabic Learning Browser Extension
import { debounce, throttle } from './utils';

/**
 * Optimize DOM operations by batching updates
 * @param updateFn Function that performs DOM updates
 * @param delay Delay in milliseconds
 * @returns Debounced update function
 */
export const batchDOMUpdates = (updateFn: Function, delay = 100): Function => {
  return debounce(updateFn, delay);
};

/**
 * Optimize event handlers for scroll and resize events
 * @param handlerFn Event handler function
 * @param limit Throttle limit in milliseconds
 * @returns Throttled handler function
 */
export const optimizeEventHandler = (handlerFn: Function, limit = 100): Function => {
  return throttle(handlerFn, limit);
};

/**
 * Utility functions for debounce and throttle
 */
export const utils = {
  /**
   * Debounce function to limit the rate at which a function can fire
   * @param func Function to debounce
   * @param wait Wait time in milliseconds
   * @returns Debounced function
   */
  debounce: (func: Function, wait = 100): Function => {
    let timeout: number | null = null;
    
    return function(...args: any[]) {
      const context = this;
      
      if (timeout) {
        clearTimeout(timeout);
      }
      
      timeout = setTimeout(() => {
        func.apply(context, args);
        timeout = null;
      }, wait);
    };
  },
  
  /**
   * Throttle function to limit the rate at which a function can fire
   * @param func Function to throttle
   * @param limit Limit in milliseconds
   * @returns Throttled function
   */
  throttle: (func: Function, limit = 100): Function => {
    let inThrottle = false;
    
    return function(...args: any[]) {
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }
};

/**
 * Optimize memory usage by cleaning up unused resources
 */
export const optimizeMemoryUsage = (): void => {
  // Clear any cached data that's no longer needed
  const clearCaches = () => {
    // Clear any in-memory caches
    if (window._arabicLearningCache) {
      window._arabicLearningCache = {};
    }
  };
  
  // Add event listener for visibilitychange to clean up when tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      clearCaches();
    }
  });
};

/**
 * Lazy load resources when needed
 * @param resourceLoader Function that loads the resource
 * @returns Promise that resolves with the loaded resource
 */
export const lazyLoadResource = async (resourceLoader: () => Promise<any>): Promise<any> => {
  try {
    return await resourceLoader();
  } catch (error) {
    console.error('Error lazy loading resource:', error);
    throw error;
  }
};

/**
 * Check browser compatibility
 * @returns Object with compatibility information
 */
export const checkBrowserCompatibility = (): {
  compatible: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Check for IndexedDB support
  if (!window.indexedDB) {
    issues.push('IndexedDB is not supported in this browser');
  }
  
  // Check for Chrome/Firefox compatibility
  const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  
  if (!isChrome && !isFirefox) {
    issues.push('This extension is optimized for Chrome and Firefox browsers');
  }
  
  // Check for service worker support
  if (!('serviceWorker' in navigator)) {
    issues.push('Service Workers are not supported in this browser');
  }
  
  return {
    compatible: issues.length === 0,
    issues
  };
};

// Add a type declaration for the window object
declare global {
  interface Window {
    _arabicLearningCache?: Record<string, any>;
  }
}
