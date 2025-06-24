
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const AccountSettings: React.FC = () => {
  const { user, updateUserEmail, updateUserPassword } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  
  // Email change state
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    if (email === user?.email) {
      setEmailError('New email must be different from current email');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasNumber && hasSymbol;
  };

  // Handle email change
  const handleEmailChange = async () => {
    if (!validateEmail(newEmail)) return;
    
    setIsEmailLoading(true);
    console.log('🔄 Attempting to change email from', user?.email, 'to', newEmail);
    
    try {
      const success = await updateUserEmail(newEmail);
      if (success) {
        console.log('✅ Email changed successfully');
        toast({
          title: "Email Updated",
          description: "Your email address has been changed successfully.",
        });
        setNewEmail('');
      } else {
        console.log('❌ Email change failed');
        toast({
          title: "Email Update Failed",
          description: "Failed to update email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Email change error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating email.",
        variant: "destructive",
      });
    } finally {
      setIsEmailLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    const errors = { current: '', new: '', confirm: '' };
    let isValid = true;

    // Validate current password
    if (!currentPassword) {
      errors.current = 'Current password is required';
      isValid = false;
    } else if (currentPassword !== user?.password) {
      errors.current = 'Current password is incorrect';
      isValid = false;
    }

    // Validate new password
    if (!newPassword) {
      errors.new = 'New password is required';
      isValid = false;
    } else if (!validatePassword(newPassword)) {
      errors.new = 'Password must be at least 8 characters with a number and symbol';
      isValid = false;
    } else if (newPassword === currentPassword) {
      errors.new = 'New password must be different from current password';
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      errors.confirm = 'Please confirm your new password';
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match';
      isValid = false;
    }

    setPasswordErrors(errors);
    
    if (!isValid) return;

    setIsPasswordLoading(true);
    console.log('🔄 Attempting to change password for user:', user?.email);
    
    try {
      const success = await updateUserPassword(newPassword);
      if (success) {
        console.log('✅ Password changed successfully');
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        console.log('❌ Password change failed');
        toast({
          title: "Password Update Failed",
          description: "Failed to update password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Password change error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating password.",
        variant: "destructive",
      });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const PasswordToggle = ({ show, onClick }: { show: boolean; onClick: () => void }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
      onClick={onClick}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </Button>
  );

  if (!user) return null;

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Admin Account Settings
              <span className="text-sm font-normal text-muted-foreground ml-auto">
                {isOpen ? 'Click to collapse' : 'Click to expand'}
              </span>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-8">
            {/* Email Change Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Mail className="h-4 w-4 text-blue-500" />
                <h3 className="text-lg font-semibold">Change Email</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input
                    id="current-email"
                    type="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-email">New Email</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        id="new-email"
                        type="email"
                        placeholder="Enter new email address"
                        value={newEmail}
                        onChange={(e) => {
                          setNewEmail(e.target.value);
                          if (emailError) setEmailError('');
                        }}
                        className={emailError ? 'border-red-500' : newEmail && !emailError ? 'border-green-500' : ''}
                        disabled={isEmailLoading}
                      />
                      {emailError && (
                        <p className="text-sm text-red-500 mt-1">{emailError}</p>
                      )}
                    </div>
                    <Button
                      onClick={handleEmailChange}
                      disabled={!newEmail || isEmailLoading || !!emailError}
                      className="shrink-0"
                    >
                      {isEmailLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Confirm Change'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b">
                <Lock className="h-4 w-4 text-green-500" />
                <h3 className="text-lg font-semibold">Change Password</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (passwordErrors.current) {
                            setPasswordErrors(prev => ({ ...prev, current: '' }));
                          }
                        }}
                        className={passwordErrors.current ? 'border-red-500 pr-10' : 'pr-10'}
                        disabled={isPasswordLoading}
                      />
                      <PasswordToggle
                        show={showCurrentPassword}
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      />
                    </div>
                    {passwordErrors.current && (
                      <p className="text-sm text-red-500">{passwordErrors.current}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (passwordErrors.new) {
                            setPasswordErrors(prev => ({ ...prev, new: '' }));
                          }
                        }}
                        className={
                          passwordErrors.new 
                            ? 'border-red-500 pr-10' 
                            : newPassword && validatePassword(newPassword) 
                            ? 'border-green-500 pr-10' 
                            : 'pr-10'
                        }
                        disabled={isPasswordLoading}
                      />
                      <PasswordToggle
                        show={showNewPassword}
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      />
                    </div>
                    {passwordErrors.new && (
                      <p className="text-sm text-red-500">{passwordErrors.new}</p>
                    )}
                    {newPassword && !passwordErrors.new && (
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters with a number and symbol
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (passwordErrors.confirm) {
                            setPasswordErrors(prev => ({ ...prev, confirm: '' }));
                          }
                        }}
                        className={
                          passwordErrors.confirm 
                            ? 'border-red-500 pr-10' 
                            : confirmPassword && newPassword === confirmPassword 
                            ? 'border-green-500 pr-10' 
                            : 'pr-10'
                        }
                        disabled={isPasswordLoading}
                      />
                      <PasswordToggle
                        show={showConfirmPassword}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </div>
                    {passwordErrors.confirm && (
                      <p className="text-sm text-red-500">{passwordErrors.confirm}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handlePasswordChange}
                  disabled={!currentPassword || !newPassword || !confirmPassword || isPasswordLoading}
                  className="min-w-32"
                >
                  {isPasswordLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </div>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
