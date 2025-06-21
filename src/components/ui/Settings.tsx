import React from 'react';
import { Settings as SettingsIcon, Moon, Sun, HelpCircle, Wand2 } from 'lucide-react';

export const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(false);

  const handleAutoGenerate = () => {
    // This would trigger AI auto-generation for the current stage
    console.log('Auto-generating content for current stage...');
    // TODO: Implement AI auto-generation logic
  };
  return (
    <div className="p-4 border-t border-gray-200">
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
            <span className="text-sm text-gray-700">Dark Mode</span>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`
              relative w-10 h-6 rounded-full transition-colors
              ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}
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
        
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
          <HelpCircle size={16} />
          Help & Support
        </button>
      </div>
    </div>
  );
};