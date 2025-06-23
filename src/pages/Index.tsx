
import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AuthPage } from './AuthPage';
import { DashboardPage } from './DashboardPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <DashboardPage /> : <AuthPage />;
};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
