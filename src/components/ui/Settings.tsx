import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  HelpCircle,
  Wand2,
  LogIn,
  LogOut,
  User,
  Info,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { LoginModal } from "../auth/LoginModal";
import { AboutUsModal } from "./AboutUsModal";

export const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleAutoGenerate = () => {
    // This would trigger AI auto-generation for the entire process!
    console.log("Auto-generating content for current stage...");
    // TODO: Implement AI auto-generation logic, should be moved to another file!! ~JDJ
  };

  const handleAuthAction = async () => {
    if (user) {
      // Sign out
      const { error } = await signOut();
      if (error) {
        console.error("Sign out error:", error);
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
              <User
                size={16}
                className="text-gray-600"
              />
              <span className="text-sm font-medium text-gray-800">Account</span>
            </div>
            <div className="text-xs text-gray-600 mb-2 truncate">
              {user.email}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SettingsIcon
              size={20}
              className="text-gray-600"
            />
            <h3 className="font-semibold text-gray-800">Settings</h3>
          </div>
          <button
            onClick={handleAutoGenerate}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            title="Auto-generate all text fields in current stage"
            aria-label="Auto-generate content for current stage"
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
    ${darkMode ? "bg-blue-600" : "bg-gray-200"}
  `}
              aria-label={darkMode ? "Disable dark mode" : "Enable dark mode"} // Add this
            >
              <div
                className={`
      absolute w-4 h-4 bg-white rounded-full top-1 transition-transform
      ${darkMode ? "translate-x-5" : "translate-x-1"}
    `}
              />
            </button>
          </div>

          <button
            onClick={handleAuthAction}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors w-full text-left disabled:opacity-50"
          >
            {user ? <LogOut size={16} /> : <LogIn size={16} />}
            {user ? "Sign Out" : "Sign In"}
          </button>

          <button
            onClick={() => setShowAboutModal(true)}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Info size={16} />
            About Chargur
          </button>

          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">
            <HelpCircle size={16} />
            Help & Support
          </button>

          {/* Additional Settings */}
          <div className="pt-3 mt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Preferences
            </h4>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly={true}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Auto-save canvas</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly={true}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Show tooltips</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={false}
                  readOnly={true}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  Experimental features
                </span>
              </label>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              AI Assistant
            </h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Length</span>
                <select
                  className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                  defaultValue="Balanced"
                >
                  <option>Concise</option>
                  <option value="Balanced">Balanced</option>
                  <option>Detailed</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Creativity</span>
                <select
                  className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                  defaultValue="Balanced"
                >
                  <option>Precise</option>
                  <option value="Balanced">Balanced</option>
                  <option>Creative</option>
                </select>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly={true}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Show suggestions</span>
              </label>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">Chargur v1.0.0</p>
            <p className="text-xs text-gray-400 mt-1">© 2025 Chargur Team</p>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <AboutUsModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </>
  );
};
