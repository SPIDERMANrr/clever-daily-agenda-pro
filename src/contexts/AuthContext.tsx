import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthState, ScheduleItem } from '@/types/auth';
import { useTimetable } from '@/hooks/useTimetable';

interface OTPData {
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, role?: 'user' | 'admin') => Promise<boolean>;
  logout: () => void;
  updateUserSchedule: (schedule: ScheduleItem[], userId?: string) => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<boolean>;
  updateUserPassword: (newPassword: string) => Promise<boolean>;
  getAllUsers: () => User[];
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; message?: string }>;
  isLoading: boolean;
  session: Session | null;
  supabaseUser: SupabaseUser | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default schedule for new users
const defaultSchedule: ScheduleItem[] = [
  { start: '6:00 AM', end: '9:00 AM', task: 'Morning Routine' },
  { start: '9:00 AM', end: '12:00 PM', task: 'Work/Study' },
  { start: '12:00 PM', end: '1:00 PM', task: 'Lunch Break' },
  { start: '1:00 PM', end: '5:00 PM', task: 'Afternoon Work' },
  { start: '5:00 PM', end: '7:00 PM', task: 'Exercise/Hobby' },
  { start: '7:00 PM', end: '9:00 PM', task: 'Dinner & Family' },
  { start: '9:00 PM', end: '10:00 PM', task: 'Personal Time' }
];

// Mock users data for local functionality
const initialUsers: User[] = [
  {
    id: 'admin1',
    username: 'admin',
    email: 'admin@planner.com',
    password: 'admin123',
    role: 'admin',
    schedule: defaultSchedule,
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
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otpData, setOtpData] = useState<OTPData | null>(null);
  const { fetchTimetable, saveTimetable } = useTimetable(supabaseUser?.id);

  // Initialize Supabase authentication
  useEffect(() => {
    console.log('🔄 Initializing Supabase authentication...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          // Load user's schedule from Supabase
          const schedule = await fetchTimetable();
          const userSchedule = schedule || defaultSchedule;
          
          const user: User = {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            password: '', // Not stored for Supabase users
            role: 'user', // Default role
            schedule: userSchedule,
            history: [],
            lastEdited: new Date().toISOString()
          };
          
          setAuthState({
            user,
            isAuthenticated: true,
            users: initialUsers
          });
        } else {
          // Initialize authentication state on app load for local users
          const initializeAuth = () => {
            console.log('🔄 Initializing local authentication...');
            
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
            }
          };

          initializeAuth();
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchTimetable]);

  const saveAuthState = (user: User, isAuthenticated: boolean) => {
    const authData = { user, isAuthenticated, timestamp: Date.now() };
    localStorage.setItem('plannerAuth', JSON.stringify(authData));
    console.log('💾 Saved auth state for:', user.email);
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('plannerUsers', JSON.stringify(users));
    console.log('💾 Saved users to storage:', users.length);
  };

  const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const simulateEmailSend = (email: string, otp: string): void => {
    console.log(`📧 Simulated Email Sent to: ${email}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log(`⏰ Expires in 5 minutes`);
    
    // In a real application, you would integrate with an email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Attempting login for:', email);
    
    // Try Supabase login first
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('❌ Supabase login failed:', error.message);
        // Fall back to local authentication
      } else if (data.user) {
        console.log('✅ Supabase login successful for:', email);
        return true;
      }
    } catch (err) {
      console.error('❌ Unexpected login error:', err);
    }

    // Local authentication fallback
    const user = authState.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      console.log('✅ Local login successful for:', email, 'Role:', user.role);
      const newAuthState = { user, isAuthenticated: true, users: authState.users };
      setAuthState(newAuthState);
      saveAuthState(user, true);
      return true;
    }
    
    console.log('❌ Login failed for:', email);
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    console.log('📝 Attempting registration for:', email);
    
    // Try Supabase registration first
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username
          }
        }
      });

      if (error) {
        console.log('❌ Supabase registration failed:', error.message);
        // Fall back to local registration
      } else if (data.user) {
        console.log('✅ Supabase registration successful for:', email);
        return true;
      }
    } catch (err) {
      console.error('❌ Unexpected registration error:', err);
    }

    // Local registration fallback
    if (authState.users.find(u => u.email === email)) {
      console.log('❌ Registration failed - user already exists:', email);
      return false; // User already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      email,
      password,
      role: 'user',
      schedule: defaultSchedule,
      history: [],
      lastEdited: new Date().toISOString()
    };

    const updatedUsers = [...authState.users, newUser];
    setAuthState(prev => ({ ...prev, users: updatedUsers }));
    saveUsers(updatedUsers);
    
    console.log('✅ Local registration successful for:', email);
    return true;
  };

  const logout = async () => {
    console.log('🚪 Logging out user:', authState.user?.email);
    
    if (supabaseUser) {
      try {
        await supabase.auth.signOut();
        console.log('✅ Supabase logout successful');
      } catch (err) {
        console.error('❌ Supabase logout error:', err);
      }
    } else {
      // Local logout
      setAuthState(prev => ({ ...prev, user: null, isAuthenticated: false }));
      localStorage.removeItem('plannerAuth');
      console.log('✅ Local logout complete');
    }
  };

  const updateUserSchedule = async (schedule: ScheduleItem[], userId?: string): Promise<void> => {
    const targetUserId = userId || authState.user?.id;
    
    if (!targetUserId) {
      console.log('❌ No target user ID for schedule update');
      return;
    }

    console.log('📅 Updating schedule for user:', targetUserId);

    // If this is a Supabase user, save to database
    if (supabaseUser && targetUserId === supabaseUser.id) {
      const success = await saveTimetable(schedule);
      if (!success) {
        return; // Error handling is done in the hook
      }
    } else {
      // Local user - update localStorage
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
    }

    // Update local state
    if (authState.user && targetUserId === authState.user.id) {
      const updatedUser = {
        ...authState.user,
        schedule,
        history: [...authState.user.history, authState.user.schedule],
        lastEdited: new Date().toISOString()
      };
      
      setAuthState(prev => ({ ...prev, user: updatedUser }));
    }

    console.log('✅ Schedule updated successfully');
  };

  const updateUserEmail = async (newEmail: string): Promise<boolean> => {
    if (supabaseUser) {
      try {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
        return !error;
      } catch {
        return false;
      }
    }

    // Local user email update
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
    if (supabaseUser) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return !error;
      } catch {
        return false;
      }
    }

    // Local user password update
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

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message?: string }> => {
    // Try Supabase password reset first
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`
      });
      
      if (error) {
        console.log('❌ Supabase password reset failed:', error.message);
        // Fall back to local OTP system
      } else {
        return { success: true };
      }
    } catch (err) {
      console.error('❌ Supabase password reset error:', err);
    }

    // Local password reset with OTP
    console.log('🔐 Password reset requested for:', email);
    
    // Check if user exists
    const user = authState.users.find(u => u.email === email);
    if (!user) {
      console.log('❌ User not found:', email);
      return { success: false, message: 'User not found' };
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes from now

    // Store OTP data
    const newOtpData: OTPData = {
      email,
      otp,
      expiresAt,
      attempts: 0
    };
    
    setOtpData(newOtpData);
    
    // Simulate sending email
    simulateEmailSend(email, otp);
    
    console.log('✅ OTP generated and email sent');
    return { success: true };
  };

  const verifyOTP = async (email: string, otp: string): Promise<{ success: boolean; message?: string }> => {
    console.log('🔍 Verifying OTP for:', email);
    
    if (!otpData || otpData.email !== email) {
      console.log('❌ No OTP data found for email:', email);
      return { success: false, message: 'No OTP request found for this email' };
    }

    // Check if OTP has expired
    if (Date.now() > otpData.expiresAt) {
      console.log('❌ OTP expired for:', email);
      setOtpData(null);
      return { success: false, message: 'OTP has expired' };
    }

    // Increment attempts
    const updatedOtpData = { ...otpData, attempts: otpData.attempts + 1 };
    setOtpData(updatedOtpData);

    // Check if too many attempts
    if (updatedOtpData.attempts > 3) {
      console.log('❌ Too many OTP attempts for:', email);
      setOtpData(null);
      return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    // Verify OTP
    if (otpData.otp !== otp) {
      console.log('❌ Invalid OTP for:', email);
      return { success: false, message: 'Invalid OTP' };
    }

    console.log('✅ OTP verified successfully for:', email);
    return { success: true };
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    console.log('🔒 Resetting password for:', email);
    
    if (!otpData || otpData.email !== email) {
      console.log('❌ No verified OTP session found for:', email);
      return { success: false, message: 'No verified session found. Please restart the process.' };
    }

    try {
      const updatedUsers = authState.users.map(user => {
        if (user.email === email) {
          return {
            ...user,
            password: newPassword,
            lastEdited: new Date().toISOString()
          };
        }
        return user;
      });

      setAuthState(prev => ({ ...prev, users: updatedUsers }));
      saveUsers(updatedUsers);
      
      // Clear OTP data after successful reset
      setOtpData(null);
      
      console.log('✅ Password reset successfully for:', email);
      return { success: true };
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      return { success: false, message: 'Failed to reset password' };
    }
  };

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
      requestPasswordReset,
      verifyOTP,
      resetPassword,
      isLoading,
      session,
      supabaseUser
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
