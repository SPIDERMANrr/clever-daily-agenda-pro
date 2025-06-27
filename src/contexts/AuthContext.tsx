
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User as LocalUser, ScheduleItem } from '@/types/auth';
import { getStoredUsers, storeUsers } from '@/utils/storage';

interface AuthContextType {
  user: LocalUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserSchedule: (schedule: ScheduleItem[]) => Promise<void>;
  getAllUsers: () => LocalUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          // Load or create user data from Supabase
          const { data: timetableData } = await supabase
            .from('timetables')
            .select('data')
            .eq('user_id', session.user.id)
            .single();

          const userData = timetableData?.data || {
            id: session.user.id,
            username: session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            password: '', 
            role: session.user.email === 'admin@planner.com' ? 'admin' : 'user',
            schedule: [
              { start: '6:00 AM', end: '7:00 AM', task: 'Morning Exercise' },
              { start: '7:00 AM', end: '8:00 AM', task: 'Breakfast' },
              { start: '8:00 AM', end: '12:00 PM', task: 'Work/Study' },
              { start: '12:00 PM', end: '1:00 PM', task: 'Lunch Break' },
              { start: '1:00 PM', end: '5:00 PM', task: 'Afternoon Work' },
              { start: '5:00 PM', end: '6:00 PM', task: 'Recreation' },
              { start: '6:00 PM', end: '7:00 PM', task: 'Dinner' },
              { start: '7:00 PM', end: '10:00 PM', task: 'Personal Time' }
            ],
            history: [],
            lastEdited: new Date().toISOString()
          };

          setUser(userData);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('Existing session found:', session.user?.email);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureAdminUser = async () => {
    try {
      // Call the database function to ensure admin user exists
      const { error } = await supabase.rpc('ensure_admin_user');
      if (error) {
        console.error('Error ensuring admin user:', error);
      }
    } catch (error) {
      console.error('Error calling ensure_admin_user:', error);
    }
  };

  const createAdminUser = async () => {
    try {
      console.log('Creating admin user...');
      const { data, error } = await supabase.auth.signUp({
        email: 'admin@planner.com',
        password: 'admin123',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: 'admin'
          }
        }
      });

      if (error) {
        console.error('Error creating admin user:', error);
        return false;
      }

      if (data.user) {
        // Confirm the email immediately for admin user
        console.log('Admin user created, confirming email...');
        
        // Insert admin user data into timetables
        const adminData = {
          id: data.user.id,
          username: 'admin',
          email: 'admin@planner.com',
          password: 'admin123',
          role: 'admin' as const,
          schedule: [
            { start: '6:00 AM', end: '7:00 AM', task: 'Morning Exercise' },
            { start: '7:00 AM', end: '8:00 AM', task: 'Breakfast' },
            { start: '8:00 AM', end: '12:00 PM', task: 'Work/Study' },
            { start: '12:00 PM', end: '1:00 PM', task: 'Lunch Break' },
            { start: '1:00 PM', end: '5:00 PM', task: 'Afternoon Work' },
            { start: '5:00 PM', end: '6:00 PM', task: 'Recreation' },
            { start: '6:00 PM', end: '7:00 PM', task: 'Dinner' },
            { start: '7:00 PM', end: '10:00 PM', task: 'Personal Time' }
          ],
          history: [],
          lastEdited: new Date().toISOString()
        };

        await supabase
          .from('timetables')
          .insert({
            user_id: data.user.id,
            data: adminData
          });

        console.log('Admin user created successfully');
        return true;
      }
    } catch (error) {
      console.error('Error in createAdminUser:', error);
      return false;
    }
    return false;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);
      
      // First ensure admin user exists if this is an admin login
      if (email === 'admin@planner.com') {
        await ensureAdminUser();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // If admin login fails and user doesn't exist, try to create admin user
        if (email === 'admin@planner.com' && error.message.includes('Invalid login credentials')) {
          console.log('Admin login failed, attempting to create admin user...');
          const adminCreated = await createAdminUser();
          
          if (adminCreated) {
            // Try login again after creating admin user
            const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (retryError) {
              console.error('Retry login error:', retryError);
              return false;
            }
            
            return !!retryData?.user;
          }
        }
        
        return false;
      }

      return !!data?.user;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        return false;
      }

      if (data.user) {
        // Create user data in timetables
        const userData = {
          id: data.user.id,
          username,
          email,
          password: '',
          role: 'user' as const,
          schedule: [
            { start: '6:00 AM', end: '7:00 AM', task: 'Morning Exercise' },
            { start: '7:00 AM', end: '8:00 AM', task: 'Breakfast' },
            { start: '8:00 AM', end: '12:00 PM', task: 'Work/Study' },
            { start: '12:00 PM', end: '1:00 PM', task: 'Lunch Break' },
            { start: '1:00 PM', end: '5:00 PM', task: 'Afternoon Work' },
            { start: '5:00 PM', end: '6:00 PM', task: 'Recreation' },
            { start: '6:00 PM', end: '7:00 PM', task: 'Dinner' },
            { start: '7:00 PM', end: '10:00 PM', task: 'Personal Time' }
          ],
          history: [],
          lastEdited: new Date().toISOString()
        };

        await supabase
          .from('timetables')
          .insert({
            user_id: data.user.id,
            data: userData
          });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration exception:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    setIsAuthenticated(false);
  };

  const updateUserSchedule = async (schedule: ScheduleItem[]): Promise<void> => {
    if (!user || !supabaseUser) return;

    const updatedUser = {
      ...user,
      schedule,
      lastEdited: new Date().toISOString()
    };

    // Update in Supabase
    const { error } = await supabase
      .from('timetables')
      .upsert({
        user_id: supabaseUser.id,
        data: updatedUser
      });

    if (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }

    setUser(updatedUser);
  };

  const getAllUsers = (): LocalUser[] => {
    // For now, return empty array since we're using Supabase for data
    // Admin dashboard will fetch users directly from Supabase
    return [];
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      session,
      isAuthenticated,
      login,
      register,
      logout,
      updateUserSchedule,
      getAllUsers,
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
