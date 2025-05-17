import React, { useState, useRef, useEffect } from 'react';
import { Menu, ChevronDown, ChevronUp, User, Grid, Youtube, Globe, Search, Users, FileUp, FileDown, BookOpen, Edit, FileText, Star, Sun, Moon, BarChart, Settings, Printer, Info, ArrowUpRight, ArrowDownLeft, Link2, FileSpreadsheet, Lock, Unlock, ExternalLink } from 'lucide-react';

// Utility for keyboard navigation
function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const MENU_GROUPS = [
  {
    label: 'Horoscope Tools',
    icon: <BookOpen className="w-4 h-4 mr-2" />,
    items: [
      { label: 'Home', icon: <Grid className="w-4 h-4" />, href: '/dashboard' },
      { label: 'New Horoscope', icon: <FileUp className="w-4 h-4" />, href: '/horoscope/new' },
      { label: 'Horoscope Calendar', icon: <BookOpen className="w-4 h-4" />, href: '/calendar' },
      { label: 'Adjust Birth Time', icon: <Edit className="w-4 h-4" />, href: '/adjust-birth-time' },
      { label: 'Ruling Planets', icon: <Star className="w-4 h-4" />, href: '/ruling-planets' },
      { label: 'Horary Chart', icon: <Sun className="w-4 h-4" />, href: '/horary-chart' },
      { label: 'To Generate Horary Chart', icon: <Moon className="w-4 h-4" />, href: '/generate-horary-chart' },
      { label: 'Edit Horoscope', icon: <Edit className="w-4 h-4" />, href: '/edit-horoscope' },
      { label: 'Horoscope Notes', icon: <FileText className="w-4 h-4" />, href: '/horoscope-notes' },
    ],
  },
  {
    label: 'Analysis & Charts',
    icon: <BarChart className="w-4 h-4 mr-2" />,
    items: [
      { label: 'Locate Dasa Bhukti', icon: <Search className="w-4 h-4" />, href: '/locate-dasa-bhukti' },
      { label: 'Graph Indicator', icon: <BarChart className="w-4 h-4" />, href: '/graph-indicator' },
      { label: 'Marriage Matching', icon: <Users className="w-4 h-4" />, href: '/marriage-matching' },
      { label: 'Day Analysis', icon: <Sun className="w-4 h-4" />, href: '/day-analysis' },
      { label: 'Transit Analysis', icon: <ArrowUpRight className="w-4 h-4" />, href: '/transit-analysis' },
      { label: 'Basic Numerology', icon: <FileText className="w-4 h-4" />, href: '/basic-numerology' },
      { label: 'Panchang Details', icon: <Globe className="w-4 h-4" />, href: '/panchang-details' },
      { label: 'Planet Positions', icon: <Star className="w-4 h-4" />, href: '/planet-positions' },
    ],
  },
  {
    label: 'User & System',
    icon: <User className="w-4 h-4 mr-2" />,
    items: [
      { label: 'Our English Youtube', icon: <Youtube className="w-4 h-4" />, href: 'https://youtube.com', external: true },
      { label: 'Our Social Media Link', icon: <Globe className="w-4 h-4" />, href: 'https://facebook.com', external: true },
      { label: 'Search Horoscope', icon: <Search className="w-4 h-4" />, href: '/search-horoscope' },
      { label: 'Horoscope Groups', icon: <Users className="w-4 h-4" />, href: '/horoscope-groups' },
      { label: 'Browse Horoscope', icon: <BookOpen className="w-4 h-4" />, href: '/browse-horoscope' },
      { label: 'Backup and Restore', icon: <FileDown className="w-4 h-4" />, href: '/backup-restore' },
      { label: 'Export in Excel Format', icon: <FileSpreadsheet className="w-4 h-4" />, href: '/export-excel' },
      { label: 'Research Lab', icon: <BarChart className="w-4 h-4" />, href: '/admin/research' },
      { label: 'ML Feedback', icon: <BarChart className="w-4 h-4" />, href: '/admin/ml-feedback' },
      { label: 'Batch Upload', icon: <FileUp className="w-4 h-4" />, href: '/admin/batch-upload' },
      { label: 'Horoscope Test', icon: <BookOpen className="w-4 h-4" />, href: '/horoscope-test' },
      { label: 'Admin QA Report', icon: <FileText className="w-4 h-4" />, href: '/admin/qa-report' },
      { label: 'Export Example', icon: <FileSpreadsheet className="w-4 h-4" />, href: '/export-example' },
    ],
  },
];

export const HeaderDropdownMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setOpen(false));

  // Keyboard navigation: ESC to close, ArrowDown/Up to move
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-200 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : 'false'}
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        <Grid className="w-6 h-6 text-yellow-700" />
        <span className="sr-only">Open menu</span>
      </button>
      {open && (
        <ul
          className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-xl shadow-2xl border border-yellow-200 z-50 overflow-y-auto max-h-[80vh] focus:outline-none"
          role="menu"
        >
          {MENU_GROUPS.map((group, idx) => (
            <li key={group.label} role="none" className="border-b last:border-b-0 border-yellow-100">
              <button
                className="flex w-full items-center px-4 py-3 font-semibold text-yellow-800 bg-yellow-50 hover:bg-yellow-100 focus:bg-yellow-100 transition group focus:outline-none"
                aria-expanded={expanded === idx}
                aria-controls={`menu-group-${idx}`}
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setExpanded(expanded === idx ? null : idx);
                }}
                role="menuitem"
                tabIndex={0}
              >
                {group.icon}
                <span className="flex-1 text-left">{group.label}</span>
                {expanded === idx ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
              {expanded === idx && (
                <ul
                  id={`menu-group-${idx}`}
                  className={`transition-all overflow-hidden max-h-96 py-2 bg-white`}
                  aria-hidden={!expanded}
                  role="menu"
                >
                  {group.items.map((item, j) => (
                    <li key={item.label} role="none">
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-2 py-2 rounded-lg text-yellow-800 hover:bg-yellow-100 focus:bg-yellow-100 transition focus:outline-none"
                          tabIndex={expanded === idx ? 0 : -1}
                          role="menuitem"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                          <ExternalLink className="w-3 h-3 ml-auto text-yellow-400" />
                        </a>
                      ) : (
                        <a
                          href={item.href}
                          className="flex items-center gap-2 px-2 py-2 rounded-lg text-yellow-800 hover:bg-yellow-100 focus:bg-yellow-100 transition focus:outline-none"
                          tabIndex={expanded === idx ? 0 : -1}
                          role="menuitem"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HeaderDropdownMenu;
