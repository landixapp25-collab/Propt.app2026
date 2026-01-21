import { BarChart3, Building2, Search, Bookmark, User } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'properties', label: 'Assets', icon: Building2 },
    { id: 'analyze-deal', label: 'Analyse', icon: Search },
    { id: 'saved-deals', label: 'Saved', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-200 z-50 safe-area-bottom" style={{ backgroundColor: '#365563' }}>
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors min-w-[56px] ${
                  isActive ? 'text-[#FF6B6B]' : 'text-gray-300'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
