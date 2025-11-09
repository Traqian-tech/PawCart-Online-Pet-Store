/**
 * Safe localStorage utilities that handle tracking prevention and other storage errors
 */

/**
 * Safely get an item from localStorage
 * Returns null if storage is unavailable or item doesn't exist
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch (error: any) {
    // Handle tracking prevention and other storage errors
    if (
      error.name === 'SecurityError' ||
      error.message?.includes('Tracking Prevention') ||
      error.message?.includes('storage')
    ) {
      console.warn('Storage access blocked by browser tracking prevention')
      return null
    }
    console.error('Failed to get item from localStorage:', error)
    return null
  }
}

/**
 * Safely set an item in localStorage
 * Returns true if successful, false otherwise
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error: any) {
    // Handle tracking prevention and other storage errors
    if (
      error.name === 'SecurityError' ||
      error.message?.includes('Tracking Prevention') ||
      error.message?.includes('storage')
    ) {
      console.warn('Storage access blocked by browser tracking prevention')
      return false
    }
    // Handle quota exceeded errors
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      console.warn('localStorage quota exceeded, attempting to clear old data')
      try {
        // Try to clear some old data and retry
        const keysToKeep = ['meow_meow_auth_user', 'connection_stats']
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && !keysToKeep.includes(key)) {
            localStorage.removeItem(key)
          }
        }
        // Retry setting the item
        localStorage.setItem(key, value)
        return true
      } catch (retryError) {
        console.error('Failed to set item after cleanup:', retryError)
        return false
      }
    }
    console.error('Failed to set item in localStorage:', error)
    return false
  }
}

/**
 * Safely remove an item from localStorage
 * Returns true if successful, false otherwise
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error: any) {
    if (
      error.name === 'SecurityError' ||
      error.message?.includes('Tracking Prevention') ||
      error.message?.includes('storage')
    ) {
      console.warn('Storage access blocked by browser tracking prevention')
      return false
    }
    console.error('Failed to remove item from localStorage:', error)
    return false
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}








