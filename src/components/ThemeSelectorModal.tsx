import { X, Check, Sun, Moon, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (theme: string) => void;
}

const themes = [
  { id: 'light', name: 'Light Mode', icon: Sun, description: 'Default light theme' },
  { id: 'dark', name: 'Dark Mode', icon: Moon, description: 'Coming soon' },
  { id: 'system', name: 'System Default', icon: Monitor, description: 'Match device settings' },
];

export default function ThemeSelectorModal({ isOpen, onClose, onThemeChange }: ThemeSelectorModalProps) {
  const [selectedTheme, setSelectedTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setSelectedTheme(saved);
    }
  }, [isOpen]);

  const handleSelect = (themeId: string) => {
    if (themeId === 'dark') {
      alert('Dark mode coming soon! We\'re working on it.');
      return;
    }

    setSelectedTheme(themeId);
    localStorage.setItem('theme', themeId);
    onThemeChange(themeId);

    if (themeId !== 'dark') {
      setTimeout(() => onClose(), 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[#537d90] px-6 py-4 flex items-center justify-between border-b border-gray-200 rounded-t-2xl">
          <h2 className="text-xl font-bold text-[#F8F9FA]">Select Theme</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-[#F8F9FA] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isDisabled = theme.id === 'dark';

            return (
              <button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors mb-2 ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={24} className="text-gray-600" />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{theme.name}</div>
                    <div className="text-sm text-gray-500">{theme.description}</div>
                  </div>
                </div>
                {selectedTheme === theme.id && !isDisabled && (
                  <Check size={24} className="text-[#4ECDC4]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
