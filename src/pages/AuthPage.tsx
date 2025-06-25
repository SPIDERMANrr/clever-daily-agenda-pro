
import React, { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'register' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-blue-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-300 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* App Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-['Poppins']">
            Smart Scheduler
          </h1>
          <p className="text-white/80 text-lg font-['Inter']">
            Plan your perfect day
          </p>
        </div>
        
        {currentView === 'login' && (
          <LoginForm 
            onSwitchToRegister={() => setCurrentView('register')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        )}
        
        {currentView === 'register' && (
          <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
        )}
        
        {currentView === 'forgot-password' && (
          <ForgotPasswordForm onBack={() => setCurrentView('login')} />
        )}
      </div>
    </div>
  );
};
