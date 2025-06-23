
import React, { useState } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { DailyPlanner } from '@/components/planner/DailyPlanner';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'planner' | 'admin'>('planner');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="py-6">
        {currentView === 'planner' && <DailyPlanner />}
        {currentView === 'admin' && user?.role === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
};
