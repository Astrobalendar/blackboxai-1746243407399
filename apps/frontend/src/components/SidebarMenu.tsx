import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const menuItems = [
  {
    name: 'My Horoscopes',
    path: '/horoscope',
    icon: '📋',
  },
  {
    name: 'Horoscope Entry',
    path: '/horoscope/new',
    icon: '📜',
  },
  {
    name: 'Day Analysis',
    path: '/day-analysis',
    icon: '📅',
  },
  {
    name: 'Transit',
    path: '/transit',
    icon: '🪐',
  },
  {
    name: 'Dasa Bhukti',
    path: '/dasa-bhukti',
    icon: '🧭',
  },
  {
    name: 'Prasannam',
    path: '/prasannam',
    icon: '🙏',
    role: 'astrologer', // Only for astrologers
  },
];

const SidebarMenu: React.FC = () => {
  const location = useLocation();
  const { userRole } = useAuth();
  // Filter menu based on role
  const filteredMenu = menuItems.filter(
    (item) => !item.role || userRole === item.role
  );
  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white/60 backdrop-blur-md shadow-xl border-r border-yellow-200 z-40 hidden md:flex flex-col items-center py-8">
      <div className="mb-8 text-2xl font-bold text-yellow-700 tracking-wide">
        AstroBalendar
      </div>
      <nav className="flex flex-col gap-4 w-full px-4" aria-label="Sidebar Navigation">
        {filteredMenu.map((item) => (
          <React.Fragment key={item.path}>
            {/* NavLink for md+ screens */}
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `hidden md:flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-lg
                ${isActive || location.pathname === item.path
                  ? 'bg-gradient-to-r from-yellow-300 to-yellow-100 text-yellow-900 shadow-md'
                  : 'text-yellow-700 hover:bg-yellow-100 hover:text-yellow-900'}
                `
              }
              aria-current={location.pathname === item.path ? 'page' : undefined}
              end
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
            {/* Fallback button for mobile screens */}
            <button
              className="block md:hidden flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-lg text-yellow-700 hover:bg-yellow-100 hover:text-yellow-900 w-full text-left"
              onClick={() => window.location.assign(item.path)}
              aria-label={`Go to ${item.name}`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          </React.Fragment>
        ))}
      </nav>
      <div className="flex-1" />
      <div className="text-xs text-yellow-500 mt-8">2025 © AstroBalendar</div>
    </aside>
  );
};

export default SidebarMenu;
