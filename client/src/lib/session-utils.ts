/**
 * Session ID utilities for tracking anonymous users
 */

const SESSION_ID_KEY = 'recommendation_session_id';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export function getOrCreateSessionId(): string {
  try {
    const stored = localStorage.getItem(SESSION_ID_KEY);
    if (stored) {
      const { sessionId, createdAt } = JSON.parse(stored);
      const age = Date.now() - createdAt;
      
      // If session is still valid, return it
      if (age < SESSION_DURATION) {
        return sessionId;
      }
    }
  } catch (error) {
    console.error('Error reading session ID:', error);
  }

  // Create new session ID
  const newSessionId = generateSessionId();
  try {
    localStorage.setItem(SESSION_ID_KEY, JSON.stringify({
      sessionId: newSessionId,
      createdAt: Date.now()
    }));
  } catch (error) {
    console.error('Error storing session ID:', error);
  }

  return newSessionId;
}

function generateSessionId(): string {
  // Generate a unique session ID
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${random}`;
}

export function getSessionId(): string | null {
  try {
    const stored = localStorage.getItem(SESSION_ID_KEY);
    if (stored) {
      const { sessionId, createdAt } = JSON.parse(stored);
      const age = Date.now() - createdAt;
      
      if (age < SESSION_DURATION) {
        return sessionId;
      }
    }
  } catch (error) {
    console.error('Error reading session ID:', error);
  }
  
  return null;
}

