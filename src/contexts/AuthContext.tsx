import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, role?: 'user' | 'admin') => Promise<boolean>;
  logout: () => void;
  updateUserSchedule: (schedule: any[], userId?: string) => void;
  updateUserEmail: (newEmail: string) => Promise<boolean>;
  updateUserPassword: (newPassword: string) => Promise<boolean>;
  getAllUsers: () => User[];
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data - in production this would be a database
const initialUsers: User[] = [
  {
    id: 'admin1',
    username: 'admin',
    email: 'admin@planner.com',
    password: 'admin123',
    role: 'admin',
    schedule: [],
    history: [],
    lastEdited: new Date().toISOString()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    users: initialUsers
  });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on app load
  useEffect(() => {
    const initializeAuth = () => {
      console.log('🔄 Initializing authentication...');
      
      try {
        // Load users from localStorage or use initial users
        const savedUsers = localStorage.getItem('plannerUsers');
        let users = initialUsers;
        
        if (savedUsers) {
          const parsedUsers = JSON.parse(savedUsers);
          // Merge with initial users to ensure admin exists
          const adminExists = parsedUsers.some((u: User) => u.email === 'admin@planner.com');
          users = adminExists ? parsedUsers : [...parsedUsers, ...initialUsers];
          console.log('👥 Loaded users from storage:', users.length);
        } else {
          // Save initial users to localStorage
          localStorage.setItem('plannerUsers', JSON.stringify(initialUsers));
          console.log('💾 Saved initial users to storage');
        }

        // Check for saved authentication state
        const savedAuth = localStorage.getItem('plannerAuth');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          console.log('🔐 Found saved auth state for:', parsed.user?.email);
          
          // Verify user still exists in users list
          const userExists = users.find((u: User) => u.id === parsed.user?.id);
          if (userExists && parsed.isAuthenticated) {
            console.log('✅ Restoring authenticated session');
            setAuthState({
              user: userExists, // Use fresh user data
              isAuthenticated: true,
              users
            });
          } else {
            console.log('❌ Saved user not found, clearing auth');
            localStorage.removeItem('plannerAuth');
            setAuthState(prev => ({ ...prev, users }));
          }
        } else {
          console.log('🔍 No saved auth found');
          setAuthState(prev => ({ ...prev, users }));
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        // Reset to safe state
        localStorage.removeItem('plannerAuth');
        localStorage.setItem('plannerUsers', JSON.stringify(initialUsers));
        setAuthState({
          user: null,
          isAuthenticated: false,
          users: initialUsers
        });
      } finally {
        setIsLoading(false);
        console.log('✅ Authentication initialization complete');
      }
    };

    initializeAuth();
  }, []);

  const saveAuthState = (user: User, isAuthenticated: boolean) => {
    const authData = { user, isAuthenticated, timestamp: Date.now() };
    localStorage.setItem('plannerAuth', JSON.stringify(authData));
    console.log('💾 Saved auth state for:', user.email);
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('plannerUsers', JSON.stringify(users));
    console.log('💾 Saved users to storage:', users.length);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Attempting login for:', email);
    
    const user = authState.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      console.log('✅ Login successful for:', email, 'Role:', user.role);
      const newAuthState = { user, isAuthenticated: true, users: authState.users };
      setAuthState(newAuthState);
      saveAuthState(user, true);
      return true;
    }
    
    console.log('❌ Login failed for:', email);
    return false;
  };

  const register = async (username: string, email: string, password: string, role: 'user' | 'admin' = 'user'): Promise<boolean> => {
    console.log('📝 Attempting registration for:', email);
    
    if (authState.users.find(u => u.email === email)) {
      console.log('❌ Registration failed - user already exists:', email);
      return false; // User already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      password,
      role,
      schedule: [
        { start: '6:00 AM', end: '9:00 AM', task: 'Morning Routine' },
        { start: '9:00 AM', end: '12:00 PM', task: 'Work/Study' },
        { start: '12:00 PM', end: '1:00 PM', task: 'Lunch Break' },
        { start: '1:00 PM', end: '5:00 PM', task: 'Afternoon Work' },
        { start: '5:00 PM', end: '7:00 PM', task: 'Exercise/Hobby' },
        { start: '7:00 PM', end: '9:00 PM', task: 'Dinner & Family' },
        { start: '9:00 PM', end: '10:00 PM', task: 'Personal Time' }
      ],
      history: [],
      lastEdited: new Date().toISOString()
    };

    const updatedUsers = [...authState.users, newUser];
    setAuthState(prev => ({ ...prev, users: updatedUsers }));
    saveUsers(updatedUsers);
    
    console.log('✅ Registration successful for:', email);
    return true;
  };

  const logout = () => {
    console.log('🚪 Logging out user:', authState.user?.email);
    setAuthState(prev => ({ ...prev, user: null, isAuthenticated: false }));
    localStorage.removeItem('plannerAuth');
    console.log('✅ Logout complete');
  };

  const updateUserSchedule = (schedule: any[], userId?: string) => {
    const targetUserId = userId || authState.user?.id;
    if (!targetUserId) {
      console.log('❌ No target user ID for schedule update');
      return;
    }

    console.log('📅 Updating schedule for user:', targetUserId);

    const updatedUsers = authState.users.map(user => {
      if (user.id === targetUserId) {
        const updatedUser = {
          ...user,
          schedule,
          history: [...user.history, user.schedule],
          lastEdited: new Date().toISOString()
        };
        
        if (user.id === authState.user?.id) {
          setAuthState(prev => ({ ...prev, user: updatedUser }));
          saveAuthState(updatedUser, true);
        }
        
        return updatedUser;
      }
      return user;
    });

    setAuthState(prev => ({ ...prev, users: updatedUsers }));
    saveUsers(updatedUsers);
    console.log('✅ Schedule updated successfully');
  };

  const updateUserEmail = async (newEmail: string): Promise<boolean> => {
    if (!authState.user) {
      console.log('❌ No authenticated user for email update');
      return false;
    }

    console.log('📧 Updating email for user:', authState.user.id, 'to:', newEmail);

    // Check if email already exists
    const emailExists = authState.users.some(u => u.email === newEmail && u.id !== authState.user?.id);
    if (emailExists) {
      console.log('❌ Email already exists:', newEmail);
      return false;
    }

    try {
      const updatedUsers = authState.users.map(user => {
        if (user.id === authState.user?.id) {
          return {
            ...user,
            email: newEmail,
            lastEdited: new Date().toISOString()
          };
        }
        return user;
      });

      const updatedUser = updatedUsers.find(u => u.id === authState.user?.id);
      if (updatedUser) {
        setAuthState(prev => ({ ...prev, user: updatedUser, users: updatedUsers }));
        saveAuthState(updatedUser, true);
        saveUsers(updatedUsers);
        console.log('✅ Email updated successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Error updating email:', error);
    }

    return false;
  };

  const updateUserPassword = async (newPassword: string): Promise<boolean> => {
    if (!authState.user) {
      console.log('❌ No authenticated user for password update');
      return false;
    }

    console.log('🔒 Updating password for user:', authState.user.id);

    try {
      const updatedUsers = authState.users.map(user => {
        if (user.id === authState.user?.id) {
          return {
            ...user,
            password: newPassword,
            lastEdited: new Date().toISOString()
          };
        }
        return user;
      });

      const updatedUser = updatedUsers.find(u => u.id === authState.user?.id);
      if (updatedUser) {
        setAuthState(prev => ({ ...prev, user: updatedUser, users: updatedUsers }));
        saveAuthState(updatedUser, true);
        saveUsers(updatedUsers);
        console.log('✅ Password updated successfully');
        return true;
      }
    } catch (error) {
      console.error('❌ Error updating password:', error);
    }

    return false;
  };

  const getAllUsers = () => authState.users;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading your session...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateUserSchedule,
      updateUserEmail,
      updateUserPassword,
      getAllUsers,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
