import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, HelpCircle, Wand2, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth'; 
import { LoginModal } from '../auth/LoginModal';

export const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(() => {
    // Check localStorage or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      if (savedMode !== null) {
        return savedMode === 'true';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const { user, signOut, loading } = useAuth();

  // Apply dark mode class to html element
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const handleAutoGenerate = () => {
    // This would trigger AI auto-generation for the current stage
    console.log('Auto-generating content for current stage...');
    // TODO: Implement AI auto-generation logic, should be moved to another file!! ~JDJ
  };

  const handleAuthAction = async () => {
    if (user) {
      // Sign out
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } else {
      // Show login modal
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <div className="p-4 border-t border-gray-200">
        {/* User Section */}
        {user && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <User size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Account</span>
            </div>
            <div className="text-xs text-gray-600 mb-2 truncate">
              {user.email}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SettingsIcon size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-800">Settings</h3>
          </div>
          <button
            onClick={handleAutoGenerate}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            title="Auto-generate all text fields in current stage"
          >
            <Wand2 className="w-3 h-3" />
            Auto-Gen
          </button>
        </div>
      
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`
                relative w-10 h-6 rounded-full transition-colors
                ${darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}
              `}
            >
              <div
                className={`
                  absolute w-4 h-4 bg-white rounded-full top-1 transition-transform
                  ${darkMode ? 'translate-x-5' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          
          <button
            onClick={handleAuthAction}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors w-full text-left disabled:opacity-50"
          >
            {user ? <LogOut size={16} /> : <LogIn size={16} />}
            {user ? 'Sign Out' : 'Sign In'}
          </button>
        
          <button className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors">
            <HelpCircle size={16} />
            Help & Support
          </button>
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};