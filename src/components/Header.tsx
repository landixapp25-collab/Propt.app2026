import { Menu } from 'lucide-react';
import Logo from './Logo';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="shadow-sm border-b border-gray-200 sticky top-0 z-50" style={{ backgroundColor: '#365563' }}>
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-gray-700" />
          </button>
          <div className="flex items-center gap-1">
            <Logo size={36} />
            <h1 className="text-2xl font-bold text-[#F8F9FA]">Propt</h1>
          </div>
        </div>
        <div className="text-sm text-gray-200">
          UK Property Portfolio Management
        </div>
      </div>
    </header>
  );
}
