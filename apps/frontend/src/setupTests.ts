// Import the jest-dom library for custom matchers
import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

// Mock window.matchMedia which is not available in JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
    route: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock the sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock the useEmailPrediction hook
vi.mock('@/hooks/useEmailPrediction', () => ({
  useEmailPrediction: () => ({
    sendEmail: vi.fn().mockResolvedValue({ success: true }),
    isLoading: false,
    error: null,
  }),
}));

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => 
    React.createElement('button', { ...props, 'data-testid': 'mock-button' }, children)
}));

// Mock the Input component
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => 
    React.createElement('input', { ...props, 'data-testid': 'mock-input' })
}));

// Mock the Dialog components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'mock-dialog' }, children),
  
  DialogTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'mock-dialog-trigger' }, children),
  
  DialogContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'mock-dialog-content' }, children),
  
  DialogHeader: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'mock-dialog-header' }, children),
  
  DialogTitle: ({ children }: { children: React.ReactNode }) =>
    React.createElement('h3', { 'data-testid': 'mock-dialog-title' }, children),
  
  DialogDescription: ({ children }: { children: React.ReactNode }) =>
    React.createElement('p', { 'data-testid': 'mock-dialog-description' }, children),
  
  DialogFooter: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'mock-dialog-footer' }, children),
}));
