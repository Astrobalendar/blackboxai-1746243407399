// ======================================
// IMPORTS
// ======================================
import React, { useCallback, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { getAuth } from '../firebase';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Settings, 
  User as UserIcon, 
  LogOut,
  Moon,
  Sun
} from 'lucide-react';

// ======================================
// CONSTANTS
// ======================================
const APP_NAME = 'AstroBalendar';
const CURRENT_YEAR = new Date().getFullYear();

// Navigation item styling constants
const NAV_ITEM_CLASSES = {
  base: 'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  inactive: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white',
  active: 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white',
  focus: 'focus:ring-indigo-500 dark:focus:ring-offset-gray-800'
} as const;

// Button styling constants
const BUTTON_CLASSES = {
  base: 'flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
  theme: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 focus:ring-indigo-500 dark:focus:ring-offset-gray-800',
  signOut: 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 focus:ring-red-500 dark:focus:ring-offset-gray-800'
} as const;

// ======================================
// TYPES
// ======================================
interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  role?: string;
  exact?: boolean;
}

// ======================================
// NAVIGATION ITEMS
// ======================================
const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard aria-hidden="true" />,
    exact: true
  },
  {
    name: 'Horoscopes',
    path: '/horoscopes',
    icon: <FileText aria-hidden="true" />
  },
  {
    name: 'Calendar',
    path: '/calendar',
    icon: <Calendar aria-hidden="true" />
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: <UserIcon aria-hidden="true" />
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: <Settings aria-hidden="true" />
  }
];

// ======================================
// COMPONENT
// ======================================
/**
 * SidebarMenu Component
 * 
 * A responsive sidebar navigation component with authentication state management.
 * Features dark mode support, keyboard navigation, and role-based access control.
 * 
 * @component
 * @example
 * return <SidebarMenu />
 */
const SidebarMenu: React.FC = () => {
  const { user, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  /**
   * Handles user sign out with error handling
   */
  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Sign out error:', error);
      // In production, consider using a toast notification here
    }
  }, [auth, navigate]);

  /**
   * Filters and returns navigation items based on user role
   */
  const filteredNavigation = useMemo(
    () => NAVIGATION_ITEMS.filter(item => {
      if (!item.role) return true;
      return user?.role === item.role;
    }),
    [user]
  );

  /**
   * Checks if a navigation item is currently active
   */
  const isActive = useCallback((path: string, exact: boolean = false) => {
    return exact 
      ? location.pathname === path
      : location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <aside 
      className="hidden md:flex md:flex-shrink-0"
      aria-label="Sidebar navigation"
    >
      <div className="
        flex flex-col w-64
        bg-white dark:bg-gray-800
        border-r border-gray-200 dark:border-gray-700
        transition-colors duration-300
      ">
        {/* Branding */}
        <header className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {APP_NAME}
          </h1>
        </header>

        {/* Navigation */}
        <nav 
          className="flex-1 px-2 py-4 space-y-1 overflow-y-auto"
          aria-label="Main navigation"
        >
          {filteredNavigation.map((item) => {
            const active = isActive(item.path, item.exact);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={cn(
                  NAV_ITEM_CLASSES.base,
                  NAV_ITEM_CLASSES.focus,
                  active ? NAV_ITEM_CLASSES.active : NAV_ITEM_CLASSES.inactive
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className="flex-shrink-0">
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: cn('h-5 w-5', {
                      'text-gray-500 dark:text-gray-400': !active,
                      'text-indigo-500 dark:text-indigo-400': active
                    })
                  })}
                </span>
                <span className="ml-3">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Theme Toggle and Sign Out */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              BUTTON_CLASSES.base,
              BUTTON_CLASSES.theme
            )}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span>Switch Theme</span>
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Moon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={handleSignOut}
            className={cn(
              BUTTON_CLASSES.base,
              BUTTON_CLASSES.signOut
            )}
            aria-label="Sign out"
          >
            <span>Sign out</span>
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Footer */}
        <footer className="p-4 text-xs text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          © {CURRENT_YEAR} {APP_NAME}. All rights reserved.
        </footer>
      </div>
    </aside>
  );
};

export default React.memo(SidebarMenu);