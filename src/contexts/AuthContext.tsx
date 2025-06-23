
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, role?: 'user' | 'admin') => Promise<boolean>;
  logout: () => void;
  updateUserSchedule: (schedule: any[], userId?: string) => void;
  getAllUsers: () => User[];
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

  useEffect(() => {
    const savedAuth = localStorage.getItem('plannerAuth');
    const savedUsers = localStorage.getItem('plannerUsers');
    
    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      setAuthState(prev => ({ ...prev, user: parsed.user, isAuthenticated: true }));
    }
    
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setAuthState(prev => ({ ...prev, users: parsedUsers }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = authState.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const newAuthState = { user, isAuthenticated: true, users: authState.users };
      setAuthState(newAuthState);
      localStorage.setItem('plannerAuth', JSON.stringify({ user, isAuthenticated: true }));
      return true;
    }
    return false;
  };

  const register = async (username: string, email: string, password: string, role: 'user' | 'admin' = 'user'): Promise<boolean> => {
    if (authState.users.find(u => u.email === email)) {
      return false; // User already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
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
    localStorage.setItem('plannerUsers', JSON.stringify(updatedUsers));
    return true;
  };

  const logout = () => {
    setAuthState(prev => ({ ...prev, user: null, isAuthenticated: false }));
    localStorage.removeItem('plannerAuth');
  };

  const updateUserSchedule = (schedule: any[], userId?: string) => {
    const targetUserId = userId || authState.user?.id;
    if (!targetUserId) return;

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
          localStorage.setItem('plannerAuth', JSON.stringify({ user: updatedUser, isAuthenticated: true }));
        }
        
        return updatedUser;
      }
      return user;
    });

    setAuthState(prev => ({ ...prev, users: updatedUsers }));
    localStorage.setItem('plannerUsers', JSON.stringify(updatedUsers));
  };

  const getAllUsers = () => authState.users;

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      register,
      logout,
      updateUserSchedule,
      getAllUsers
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
