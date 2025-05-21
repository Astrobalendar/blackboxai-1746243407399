import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Menu, Moon, Sun, User as UserIcon, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import { cn } from '@/lib/utils';
import { User } from 'firebase/auth';

// Extend the Firebase User type to include custom claims
interface CustomUser extends User {
  role?: string;
}

interface HeaderNavProps {
  user: CustomUser | null;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ user }) => {
  // Safely get the user's role if it exists in custom claims
  const userRole = user?.role || 'user';
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    try {
      // Add sign out logic here
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = (user: CustomUser | null) => {
    if (!user) return 'U';
    
    // Try displayName first, then email
    const name = user.displayName || user.email?.split('@')[0] || '';
    if (!name) return 'U';
    
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Horoscopes', path: '/horoscopes' },
    { name: 'Calendar', path: '/calendar' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">AstroBalendar</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {user ? (
            <div className="relative ml-4">
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || user?.email || 'User'} />
                  <AvatarFallback>
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-popover p-1 shadow-lg">
                  <div className="p-2">
                    <p className="truncate text-sm font-medium">
                      {user.displayName || user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </p>
                  </div>
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate('/profile');
                        setIsMenuOpen(false);
                      }}
                    >
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Sign Up
              </Button>
            </>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background border-t">
          <div className="container py-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderNav;
