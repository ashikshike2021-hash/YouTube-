import React from 'react';
import { Home } from 'lucide-react';

export const Sidebar = ({ onHomeClick, currentView }: { onHomeClick?: () => void, currentView?: string }) => (
  <nav className="w-64 p-4 shrink-0 overflow-y-auto">
    <div className="flex flex-col gap-2">
      <div onClick={onHomeClick}>
        <NavItem icon={<Home size={20} />} label="Home" active={currentView !== 'watch'} />
      </div>
    </div>
  </nav>
);

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <button className={`flex items-center gap-4 px-4 py-2 rounded-lg hover:bg-gray-100 ${active ? 'bg-gray-100 font-semibold' : ''}`}>
    {icon}
    <span>{label}</span>
  </button>
);
