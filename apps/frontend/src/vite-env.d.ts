/// <reference types="vite/client" />

// Add type definitions for the @/ path alias
declare module '@/lib/utils' {
  import { ClassValue } from 'clsx';
  export function cn(...inputs: ClassValue[]): string;
}

// Add any other module declarations as needed
