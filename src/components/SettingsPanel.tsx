// SettingsPanel component for the Arabic Learning Extension
import React, { useState, useEffect } from 'react';
import { getSetting, updateSetting } from '../utils/database';

// Define interfaces for component props
interface SettingsPanelProps {
  onSettingsChange?: (settings: Settings) => void;
}

interface Settings {
  dailyGoal: number;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  showSidebar: boolean;
  hoverTranslationEnabled: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onSettingsChange
}) => {
  // State for settings
  const [settings, setSettings] = useState<Settings>({
    dailyGoal: 10,
    notificationsEnabled: true,
    theme: 'auto',
    showSidebar: true,
    hoverTranslationEnabled: true
  });
  
  // State for saving status
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const dailyGoal = await getSetting('dailyGoal') || 10;
        const notificationsEnabled = await getSetting('notificationsEnabled') !== false;
        const theme = await getSetting('theme') || 'auto';
        const showSidebar = await getSetting('showSidebar') !== false;
        const hoverTranslationEnabled = await getSetting('hoverTranslationEnabled') !== false;
        
        const loadedSettings = {
          dailyGoal,
          notificationsEnabled,
          theme: theme as 'light' | 'dark' | 'auto',
          showSidebar,
          hoverTranslationEnabled
        };
        
        setSettings(loadedSettings);
        
        // Notify parent component if callback provided
        if (onSettingsChange) {
          onSettingsChange(loadedSettings);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, [onSettingsChange]);

  // Handle setting change
  const handleSettingChange = async (key: keyof Settings, value: any) => {
    try {
      setIsSaving(true);
      
      // Update local state
      const updatedSettings = { ...settings, [key]: value };
      setSettings(updatedSettings);
      
      // Save to database
      await updateSetting(key, value);
      
      // Show success message
      setSaveMessage('Settings saved');
      setTimeout(() => setSaveMessage(''), 2000);
      
      // Notify parent component if callback provided
      if (onSettingsChange) {
        onSettingsChange(updatedSettings);
      }
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error);
      setSaveMessage('Error saving settings');
      setTimeout(() => setSaveMessage(''), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Settings</h3>
      
      <div className="space-y-6">
        {/* Daily Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Daily Goal (words)
          </label>
          <div className="flex items-center">
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={settings.dailyGoal}
              onChange={(e) => handleSettingChange('dailyGoal', parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="ml-3 w-12 text-center text-gray-700 dark:text-gray-300">
              {settings.dailyGoal}
            </span>
          </div>
        </div>
        
        {/* Notifications */}
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={settings.notificationsEnabled}
                onChange={(e) => handleSettingChange('notificationsEnabled', e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full ${
                settings.notificationsEnabled ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
              }`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                settings.notificationsEnabled ? 'transform translate-x-4' : ''
              }`}></div>
            </div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Enable notifications</span>
          </label>
        </div>
        
        {/* Hover Translation */}
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={settings.hoverTranslationEnabled}
                onChange={(e) => handleSettingChange('hoverTranslationEnabled', e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full ${
                settings.hoverTranslationEnabled ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
              }`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                settings.hoverTranslationEnabled ? 'transform translate-x-4' : ''
              }`}></div>
            </div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Enable hover translations</span>
          </label>
        </div>
        
        {/* Show Sidebar */}
        <div>
          <label className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={settings.showSidebar}
                onChange={(e) => handleSettingChange('showSidebar', e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full ${
                settings.showSidebar ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'
              }`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                settings.showSidebar ? 'transform translate-x-4' : ''
              }`}></div>
            </div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Show vocabulary sidebar</span>
          </label>
        </div>
        
        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={(e) => handleSettingChange('theme', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto (follow browser)</option>
          </select>
        </div>
      </div>
      
      {/* Save message */}
      {saveMessage && (
        <div className={`mt-4 text-sm ${
          saveMessage.includes('Error') ? 'text-red-500' : 'text-green-500'
        }`}>
          {saveMessage}
        </div>
      )}
    </div>
  );
};

export default SettingsPanel;
