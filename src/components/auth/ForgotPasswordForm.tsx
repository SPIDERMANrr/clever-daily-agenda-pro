
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const { requestPasswordReset, verifyOTP, resetPassword } = useAuth();

  // Countdown timer for OTP expiration
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (retryCount >= 3) {
      toast({
        title: "Too many attempts",
        description: "Please try again later for security reasons.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.success) {
        setStep('otp');
        setTimeLeft(300); // 5 minutes
        setRetryCount(prev => prev + 1);
        toast({
          title: "OTP Sent!",
          description: `A 6-digit OTP has been sent to ${email}. Check your email and enter it below.`,
        });
      } else {
        toast({
          title: "Email not found",
          description: "No account found with this email address.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a 6-digit OTP.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(email, otp);
      if (result.success) {
        setStep('reset');
        toast({
          title: "OTP Verified!",
          description: "Please enter your new password.",
        });
      } else {
        toast({
          title: "Invalid OTP",
          description: result.message || "The OTP you entered is incorrect or has expired.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(email, newPassword);
      if (result.success) {
        toast({
          title: "Password Reset Successful!",
          description: "Your password has been updated. You can now log in with your new password.",
        });
        onBack();
      } else {
        toast({
          title: "Reset Failed",
          description: result.message || "Failed to reset password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto backdrop-blur-sm bg-white/95 shadow-2xl border-2 border-brand-accent rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 pb-6 pt-8 px-8">
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 text-brand-accent" />
          </Button>
          <CardTitle className="text-2xl font-bold text-brand-accent font-['Poppins']">
            Reset Password
          </CardTitle>
        </div>
        <CardDescription className="text-center text-gray-600 font-['Inter']">
          {step === 'email' && "Enter your email to receive a verification code"}
          {step === 'otp' && "Enter the 6-digit code sent to your email"}
          {step === 'reset' && "Create your new password"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-8 pb-8">
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
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
            
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-accent text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 font-['Poppins'] disabled:opacity-50 disabled:transform-none"
              disabled={isLoading || retryCount >= 3}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending OTP...
                </div>
              ) : (
                "Send Verification Code"
              )}
            </Button>
            
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 text-center font-['Inter']">
                Attempts: {retryCount}/3
              </p>
            )}
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-brand-accent font-['Inter']">
                Verification Code
              </label>
              <div className="flex justify-center">
                <InputOTP
                  value={otp}
                  onChange={setOtp}
                  maxLength={6}
                  disabled={isLoading || timeLeft === 0}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <p className="text-sm text-gray-500 text-center font-['Inter']">
                Code sent to {email}
              </p>
            </div>
            
            <div className="text-center">
              {timeLeft > 0 ? (
                <p className="text-sm text-brand-accent font-['Inter']">
                  Code expires in: {formatTime(timeLeft)}
                </p>
              ) : (
                <p className="text-sm text-red-500 font-['Inter']">
                  Code has expired. Please request a new one.
                </p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-accent text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 font-['Poppins'] disabled:opacity-50 disabled:transform-none"
              disabled={isLoading || timeLeft === 0}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep('email')}
              className="w-full"
              disabled={isLoading}
            >
              Back to Email
            </Button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-semibold text-brand-accent font-['Inter']">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-accent h-5 w-5" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 border-brand-accent focus:border-brand-primary focus:ring-4 focus:ring-red-200 transition-all duration-300 font-['Inter']"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-brand-accent font-['Inter']">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-accent h-5 w-5" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-2 border-brand-accent focus:border-brand-primary focus:ring-4 focus:ring-red-200 transition-all duration-300 font-['Inter']"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full h-12 rounded-xl bg-brand-primary hover:bg-brand-accent text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 font-['Poppins'] disabled:opacity-50 disabled:transform-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resetting...
                </div>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};
