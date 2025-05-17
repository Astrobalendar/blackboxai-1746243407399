import React from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthProvider';


const languages = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
];

const HeaderNav: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [langOpen, setLangOpen] = React.useState(false);

  // Centralized header menu items for both desktop and mobile
  const dashboardNavItems: { name: string; path: string }[] = [
    { name: t('menu.horoscopeEntry', 'Horoscope Entry'), path: '/horoscope/new' },
    { name: t('menu.dayAnalysis', 'Day Analysis'), path: '/day-analysis' },
    { name: t('menu.transit', 'Transit'), path: '/transit' },
    { name: t('menu.dasaBhukti', 'Dasa Bhukti'), path: '/dasa-bhukti' },
    { name: t('menu.prasannam', 'Prasannam'), path: '/prasannam' },
    { name: t('menu.calendar', 'Calendar'), path: '/calendar' },
    { name: t('menu.dashboard', 'Dashboard'), path: '/dashboard' },
  ];

  return (
    <nav className="bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-300 shadow flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-yellow-900 font-bold text-xl tracking-wide">AstroBalendar</Link>
        <Link to="/calendar" className="text-yellow-700 hover:text-yellow-900 px-2">Calendar</Link>
      </div>
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            aria-label="Change Language"
          >
            <span className="font-semibold">{languages.find(l => l.code === i18n.language)?.label || 'EN'}</span>
            <svg className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-yellow-100 z-50">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                  className={`w-full text-left px-4 py-2 hover:bg-yellow-100 text-yellow-900 font-medium rounded-lg transition ${i18n.language === lang.code ? 'bg-yellow-100' : ''}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Main Menu (Desktop) */}
        <div className="hidden md:flex gap-x-6 items-center">
          {dashboardNavItems.map((item: { name: string; path: string }) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={(props: { isActive: boolean }) =>
                `px-3 py-2 rounded-lg font-semibold text-yellow-800 hover:bg-yellow-100 focus:outline-yellow-400 transition-all ${
                  props.isActive ? 'bg-yellow-200 text-yellow-900 underline font-bold' : ''
                }`
              }
              aria-label={item.name}
              title={item.name}
            >
              {item.name}
            </NavLink>
          ))}
          <UserRoleNavButton />
        </div>
        {/* Main Menu (Mobile) */}
        <div className="md:hidden flex items-center">
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};

import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const UserRoleNavButton: React.FC<{ mobile?: boolean }> = ({ mobile }) => {
  const { userRole, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Use displayName if available, else role, else fallback
  const displayName = user && user.displayName ? user.displayName : userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : null;
  const label = user ? 'Logout' : 'Login';
  const handleClick = async () => {
    if (user) {
      await signOut(auth);
      navigate('/');
    } else {
      navigate('/login');
    }
  };
  return (
    <button
      onClick={handleClick}
      className={
        mobile
          ? 'px-4 py-2 bg-yellow-300 text-yellow-900 rounded-full shadow hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full text-left font-semibold'
          : 'px-4 py-2 rounded-lg font-semibold text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-yellow-400 transition-all'
      }
      aria-label={displayName ? `${displayName} (${label})` : label}
      title={displayName ? `${displayName} (${label})` : label}
    >
      {displayName && user ? <span className="mr-2">{displayName}</span> : null}
      {label}
    </button>
  );
};

// Mobile menu: hamburger with nav items and user role button
const MobileMenu: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-300 text-yellow-900 rounded-full shadow hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        aria-label="Open Menu"
        title="Open Menu"
      >
        <span className="font-semibold">Menu</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-yellow-100 z-50">
          {dashboardNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `w-full block text-left px-5 py-3 hover:bg-yellow-100 text-yellow-900 font-medium rounded-lg transition ${isActive ? 'bg-yellow-200 font-bold' : ''}`
              }
              aria-label={item.name}
              title={item.name}
              onClick={() => setOpen(false)}
            >
              {item.name}
            </NavLink>
          ))}
          <UserRoleNavButton mobile />
        </div>
      )}
    </div>
  );
};

export default HeaderNav;
