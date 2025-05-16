import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// You can swap these emojis for Heroicons if available in your project
const menuItems = [
  {
    name: 'Personal Info',
    path: '/birth-entry',
    icon: '👤',
  },
  {
    name: 'Horoscope Prediction',
    path: '/prediction',
    icon: '🔮',
  },
  {
    name: 'Export',
    path: '/export-example',
    icon: '📤',
  },
];

const SidebarMenu: React.FC = () => {
  const location = useLocation();
  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white/60 backdrop-blur-md shadow-xl border-r border-yellow-200 z-40 hidden md:flex flex-col items-center py-8">
      <div className="mb-8 text-2xl font-bold text-yellow-700 tracking-wide">
        AstroBalendar
      </div>
      <nav className="flex flex-col gap-4 w-full px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-lg
              ${isActive || location.pathname === item.path
                ? 'bg-gradient-to-r from-yellow-300 to-yellow-100 text-yellow-900 shadow-md'
                : 'text-yellow-700 hover:bg-yellow-100 hover:text-yellow-900'}
              `
            }
            end
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="flex-1" />
      <div className="text-xs text-yellow-500 mt-8">2025 © AstroBalendar</div>
    </aside>
  );
};

export default SidebarMenu;
