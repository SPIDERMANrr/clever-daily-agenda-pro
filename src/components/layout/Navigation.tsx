
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, Users, LogOut, User } from 'lucide-react';

interface NavigationProps {
  currentView: 'planner' | 'admin';
  onViewChange: (view: 'planner' | 'admin') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b-2 border-brand-accent">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-brand-accent">Smart Daily Planner</h1>
            
            <div className="flex gap-2">
              <Button
                variant={currentView === 'planner' ? 'default' : 'ghost'}
                onClick={() => onViewChange('planner')}
                className={`flex items-center gap-2 ${
                  currentView === 'planner' 
                    ? 'bg-brand-primary hover:bg-brand-accent text-white' 
                    : 'text-brand-accent hover:bg-gray-100 hover:text-brand-primary'
                }`}
              >
                <Calendar className="h-4 w-4" />
                My Planner
              </Button>
              
              {user?.role === 'admin' && (
                <Button
                  variant={currentView === 'admin' ? 'default' : 'ghost'}
                  onClick={() => onViewChange('admin')}
                  className={`flex items-center gap-2 ${
                    currentView === 'admin' 
                      ? 'bg-brand-primary hover:bg-brand-accent text-white' 
                      : 'text-brand-accent hover:bg-gray-100 hover:text-brand-primary'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Admin Dashboard
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-brand-accent" />
              <span className="font-medium text-brand-text">{user?.username}</span>
              <span className="text-gray-600">({user?.role})</span>
            </div>
            
            <Button
              variant="outline"
              onClick={logout}
              className="flex items-center gap-2 border-2 border-brand-accent text-brand-accent hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
