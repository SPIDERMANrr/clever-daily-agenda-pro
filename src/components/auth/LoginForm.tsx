
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedForm } from '@/components/ui/animated-form';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>('');
  const { login } = useAuth();

  const getDetailedErrorMessage = (email: string, password: string, isAdmin: boolean) => {
    if (isAdmin) {
      return "Admin login failed. The admin account may not exist or the credentials are incorrect. Please contact the system administrator.";
    }
    
    if (!email || !password) {
      return "Please enter both email and password.";
    }
    
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    
    return "Invalid email or password. Please check your credentials and try again. If you don't have an account, please register first.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const isAdminLogin = email === 'admin@planner.com';
      
      if (isAdminLogin) {
        console.log('Admin login attempt detected');
      }

      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Welcome back!",
          description: isAdminLogin ? "Admin login successful." : "You have been logged in successfully.",
        });
      } else {
        const errorMessage = getDetailedErrorMessage(email, password, isAdminLogin);
        setLoginError(errorMessage);
        
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = "An unexpected error occurred. Please try again.";
      setLoginError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
    >
      <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-brand-accent rounded-2xl overflow-hidden card">
        <CardHeader className="space-y-1 pb-6 pt-8 px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CardTitle className="text-3xl font-bold text-center text-brand-accent font-['Poppins']">
              Welcome Back
            </CardTitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardDescription className="text-center text-gray-600 font-['Inter'] text-lg">
              Sign in to continue to your planner
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <AnimatedForm onSubmit={handleSubmit} className="space-y-6">
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{loginError}</span>
              </motion.div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-brand-accent font-['Inter']">
                Email Address
              </label>
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-accent h-5 w-5"
                >
                  <Mail className="h-5 w-5" />
                </motion.div>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLoginError('');
                  }}
                  className="pl-10 h-12 rounded-xl border-2 border-brand-accent focus:border-brand-primary focus:ring-4 focus:ring-red-200 transition-all duration-300 font-['Inter']"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-brand-accent font-['Inter']">
                Password
              </label>
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-accent h-5 w-5"
                >
                  <Lock className="h-5 w-5" />
                </motion.div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError('');
                  }}
                  className="pl-10 pr-10 h-12 rounded-xl border-2 border-brand-accent focus:border-brand-primary focus:ring-4 focus:ring-red-200 transition-all duration-300 font-['Inter']"
                  required
                  disabled={isLoading}
                />
                <AnimatedButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-brand-accent" />
                  ) : (
                    <Eye className="h-4 w-4 text-brand-accent" />
                  )}
                </AnimatedButton>
              </div>
            </div>

            <div className="text-right">
              <motion.button
                type="button"
                onClick={onSwitchToForgotPassword}
                className="text-sm text-brand-primary hover:text-brand-accent font-semibold hover:underline transition-colors duration-200"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Forgot Password?
              </motion.button>
            </div>

            <AnimatedButton
              type="submit"
              className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-accent text-white font-semibold text-lg shadow-lg hover:shadow-xl font-['Poppins'] btn-primary"
              disabled={isLoading}
              loading={isLoading}
              ripple
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </AnimatedButton>
          </AnimatedForm>

          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-gray-600 font-['Inter']">
              Don't have an account?{' '}
              <motion.button
                onClick={onSwitchToRegister}
                className="text-brand-primary hover:text-brand-accent font-semibold hover:underline transition-colors duration-200"
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Register here
              </motion.button>
            </p>
          </motion.div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 font-['Inter']">
              Need help?{' '}
              <span className="text-brand-primary hover:text-brand-accent font-semibold cursor-pointer hover:underline transition-colors duration-200">
                Contact support
              </span>
            </p>
          </div>

          {/* Admin Login Helper */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center"
          >
            <p className="text-sm text-blue-700 font-['Inter']">
              <strong>Admin Access:</strong> Use admin@planner.com / admin123
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
