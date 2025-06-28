
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { pageTransitions, fadeInUp } from '@/utils/animations';

type AuthView = 'login' | 'register' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-red-600 via-blue-800 to-black flex items-center justify-center p-4 relative overflow-hidden"
      variants={pageTransitions}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-300 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* App Title */}
        <motion.div 
          className="text-center mb-8"
          variants={fadeInUp}
        >
          <motion.h1 
            className="text-4xl font-bold text-white mb-2 font-['Poppins']"
            animate={{ 
              textShadow: [
                "0 0 10px rgba(255,255,255,0.5)",
                "0 0 20px rgba(255,255,255,0.8)",
                "0 0 10px rgba(255,255,255,0.5)"
              ]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            Smart Scheduler
          </motion.h1>
          <motion.p 
            className="text-white/80 text-lg font-['Inter']"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Plan your perfect day
          </motion.p>
        </motion.div>
        
        <AnimatePresence mode="wait">
          {currentView === 'login' && (
            <motion.div
              key="login"
              variants={pageTransitions}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <LoginForm 
                onSwitchToRegister={() => setCurrentView('register')}
                onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
              />
            </motion.div>
          )}
          
          {currentView === 'register' && (
            <motion.div
              key="register"
              variants={pageTransitions}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
            </motion.div>
          )}
          
          {currentView === 'forgot-password' && (
            <motion.div
              key="forgot-password"
              variants={pageTransitions}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <ForgotPasswordForm onBack={() => setCurrentView('login')} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
