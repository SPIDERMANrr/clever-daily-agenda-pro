
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-brand-accent rounded-2xl overflow-hidden card">
      <CardHeader className="space-y-1 pb-6 pt-8 px-8">
        <CardTitle className="text-3xl font-bold text-center text-brand-accent font-['Poppins']">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-center text-gray-600 font-['Inter'] text-lg">
          Sign in to continue to your planner
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-semibold text-brand-accent font-['Inter']">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-accent h-5 w-5" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-accent h-5 w-5" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl border-2 border-brand-accent focus:border-brand-primary focus:ring-4 focus:ring-red-200 transition-all duration-300 font-['Inter']"
                required
                disabled={isLoading}
              />
              <Button
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
              </Button>
            </div>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-sm text-brand-primary hover:text-brand-accent font-semibold hover:underline transition-colors duration-200"
              disabled={isLoading}
            >
              Forgot Password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-accent text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 font-['Poppins'] disabled:opacity-50 disabled:transform-none btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 font-['Inter']">
            Don't have an account?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-brand-primary hover:text-brand-accent font-semibold hover:underline transition-colors duration-200"
              disabled={isLoading}
            >
              Register here
            </button>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 font-['Inter']">
            Need help?{' '}
            <span className="text-brand-primary hover:text-brand-accent font-semibold cursor-pointer hover:underline transition-colors duration-200">
              Contact support
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
