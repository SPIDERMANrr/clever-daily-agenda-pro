
import React, { useState } from 'react';
import { AnimatedForm } from '@/components/ui/animated-form';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Loader2, Calendar, Users, Shield } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const success = await login(email, password);
        if (success) {
          toast({
            title: "Welcome back!",
            description: "You have been successfully logged in.",
          });
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        if (!username.trim()) {
          toast({
            title: "Username required",
            description: "Please enter a username.",
            variant: "destructive"
          });
          return;
        }

        const success = await register(username, email, password);
        if (success) {
          toast({
            title: "Account created!",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: "Registration failed",
            description: "An account with this email may already exist.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-3xl font-bold text-gray-800 mb-2">
                📅 Daily Planner
              </CardTitle>
              <p className="text-gray-600">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </p>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <AnimatedForm onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin}
                    className="bg-white/80"
                  />
                </motion.div>
              )}
              
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/80"
              />
              
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/80"
              />
              
              <AnimatedButton
                type="submit"
                className="w-full"
                disabled={isLoading}
                ripple
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </AnimatedButton>
            </AnimatedForm>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-gray-200"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Features
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <Calendar className="h-5 w-5 text-purple-600" />
                  <span>Create and manage daily schedules</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>Secure cloud storage</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <Users className="h-5 w-5 text-purple-600" />
                  <span>Export to PDF and Excel</span>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
