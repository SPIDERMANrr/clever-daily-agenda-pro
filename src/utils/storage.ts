
import { User } from '@/types/auth';

const STORAGE_KEYS = {
  USERS: 'plannerUsers',
  AUTH: 'plannerAuth',
} as const;

export const StorageService = {
  // Users management
  getUsers: (): User[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading users from storage:', error);
      return [];
    }
  },

  saveUsers: (users: User[]): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to storage:', error);
    }
  },

  // Auth state management
  getAuthState: (): { user: User; isAuthenticated: boolean; timestamp: number } | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading auth state from storage:', error);
      return null;
    }
  },

  saveAuthState: (user: User, isAuthenticated: boolean): void => {
    try {
      const authData = {
        user,
        isAuthenticated,
        timestamp: Date.now()
      };
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving auth state to storage:', error);
    }
  },

  clearAuthState: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH);
    } catch (error) {
      console.error('Error clearing auth state from storage:', error);
    }
  },

  // Check if session is valid (within 30 days)
  isSessionValid: (): boolean => {
    const authState = StorageService.getAuthState();
    if (!authState) return false;
    
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const isExpired = Date.now() - authState.timestamp > maxAge;
    
    if (isExpired) {
      StorageService.clearAuthState();
      return false;
    }
    
    return true;
  },

  // Clear all app data
  clearAll: (): void => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing all storage:', error);
    }
  }
};

// Legacy exports for backward compatibility (but not used in AuthContext anymore)
export const getStoredUsers = StorageService.getUsers;
export const storeUsers = StorageService.saveUsers;
