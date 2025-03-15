
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error("Error reading from localStorage", error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that 
  // persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Dispatch a custom event so other components can react to this change
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, newValue: valueToStore }
        }));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error("Error writing to localStorage", error);
    }
  };

  // Listen to changes in localStorage from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error("Error parsing localStorage update", error);
        }
      }
    };
    
    // Listen to custom event for internal updates
    const handleLocalChange = (e: CustomEvent<{ key: string, newValue: any }>) => {
      if (e.detail.key === key) {
        try {
          setStoredValue(e.detail.newValue);
        } catch (error) {
          console.error("Error handling local storage custom event", error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change' as any, handleLocalChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change' as any, handleLocalChange as EventListener);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}

// Enhanced helper functions for recipe caching in localStorage with animations effects tracking
export function cacheRecipesInLocalStorage(key: string, recipes: any[]) {
  try {
    if (recipes && recipes.length > 0) {
      localStorage.setItem(key, JSON.stringify(recipes));
      // Store last cache timestamp for better user experience
      localStorage.setItem(`${key}-timestamp`, Date.now().toString());
      
      // Track in analytics that caching occurred (for developer insights)
      if (typeof window !== 'undefined' && window.console) {
        console.info(`📦 Cached ${recipes.length} recipes in ${key}`);
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error caching recipes in localStorage", error);
    return false;
  }
}

// Enhanced helper function to get cached recipes with expiration and improved logging
export function getCachedRecipesFromLocalStorage(key: string, maxAge = 3600000) { // Default: 1 hour
  try {
    const cached = localStorage.getItem(key);
    const timestamp = localStorage.getItem(`${key}-timestamp`);
    
    if (cached && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      
      // Return cache if it's not expired
      if (age < maxAge) {
        const data = JSON.parse(cached);
        console.info(`📂 Using cached ${key} (${Math.floor(age / 1000)}s old, ${data.length} items)`);
        return data;
      } else {
        // Clean up expired cache
        console.info(`🗑️ Removing expired ${key} cache (${Math.floor(age / 1000)}s old)`);
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}-timestamp`);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting cached recipes from localStorage", error);
    return null;
  }
}

// New function to prefetch and cache all necessary data for faster app loading
export function prefetchAndCacheAppData() {
  const keys = [
    'recipes-cache',
    'community-recipes-cache',
    'user-profile',
    'recent-searches',
    'view-preferences'
  ];
  
  // Log cache status for debugging
  const cacheStatus: Record<string, boolean> = {};
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    const timestamp = localStorage.getItem(`${key}-timestamp`);
    const age = timestamp ? Math.floor((Date.now() - parseInt(timestamp)) / 1000) : null;
    
    cacheStatus[key] = !!data;
    
    console.info(
      `Cache status for ${key}: ${data ? '✅ Available' : '❌ Not available'}${age ? ` (${age}s old)` : ''}`
    );
  });
  
  // Warm up animations by preloading necessary resources
  if (typeof document !== 'undefined') {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'style';
    preloadLink.href = '/animations.css';
    document.head.appendChild(preloadLink);
  }
  
  return {
    hasRecipesCache: cacheStatus['recipes-cache'],
    hasCommunityCache: cacheStatus['community-recipes-cache'],
    hasUserProfile: cacheStatus['user-profile']
  };
}

// Check and clean up old/expired caches to prevent localStorage from filling up
export function cleanupOldCaches(maxAge = 86400000) { // Default: 24 hours
  if (typeof localStorage === 'undefined') return;
  
  try {
    const now = Date.now();
    let itemsRemoved = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      
      // Check if it's a timestamp entry
      if (key.endsWith('-timestamp')) {
        const timestamp = parseInt(localStorage.getItem(key) || '0');
        const age = now - timestamp;
        
        if (age > maxAge) {
          // This cache is old, remove it and its associated data
          const dataKey = key.replace('-timestamp', '');
          localStorage.removeItem(dataKey);
          localStorage.removeItem(key);
          itemsRemoved += 2;
          console.info(`🧹 Cleaned up old cache: ${dataKey} (${Math.floor(age / 86400000)} days old)`);
        }
      }
    }
    
    if (itemsRemoved > 0) {
      console.info(`🧹 Cleaned up ${itemsRemoved} old cache items`);
    }
  } catch (error) {
    console.error("Error cleaning up old caches", error);
  }
}
