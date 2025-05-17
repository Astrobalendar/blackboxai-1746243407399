import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Horoscope Entry', path: '/horoscope/new' },
  { name: 'Day Analysis', path: '/day-analysis' },
  { name: 'Transit', path: '/transit' },
  { name: 'Dasa Bhukti', path: '/dasa-bhukti' },
  { name: 'Prasannam', path: '/prasannam' },
];

const DashboardTopNav: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <nav className="w-full bg-white/90 border-b border-yellow-200 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo and title */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-yellow-700">AstroBalendar</span>
        </div>
        {/* Desktop nav */}
        <div className="hidden md:flex gap-6 items-center">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-semibold text-yellow-800 hover:bg-yellow-100 focus:outline-yellow-400 transition-all ${
                  isActive ? 'bg-yellow-200 text-yellow-900 shadow font-bold' : ''
                }`
              }
              aria-label={item.name}
              title={item.name}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
        {/* Mobile nav */}
        <div className="md:hidden flex items-center">
          <button
            aria-label="Open menu"
            title="Open menu"
            className="p-2 rounded focus:outline-yellow-400 hover:bg-yellow-100"
            onClick={() => setMobileOpen(v => !v)}
          >
            <Menu className="w-7 h-7 text-yellow-700" />
          </button>
        </div>
      </div>
      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-yellow-200 shadow-lg animate-fade-in-down">
          <ul className="flex flex-col py-2">
            {NAV_ITEMS.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-6 py-3 font-semibold text-yellow-800 hover:bg-yellow-100 focus:outline-yellow-400 transition-all ${
                      isActive ? 'bg-yellow-200 text-yellow-900 shadow font-bold' : ''
                    }`
                  }
                  aria-label={item.name}
                  title={item.name}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default DashboardTopNav;
