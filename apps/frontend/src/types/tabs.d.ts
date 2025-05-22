/// <reference lib="dom" />
/// <reference types="react" />
import * as React from 'react';

// Type definitions for tab components

declare module '@/components/ui/tabs' {
  import * as TabsPrimitive from '@radix-ui/react-tabs';

  declare type Tab = {
    label: string;
    value: string;
    content: React.ReactNode;
    elementRef?: React.RefObject<HTMLDivElement>;
  };

  export const Tabs: React.FC<React.ComponentProps<typeof TabsPrimitive.Root>> & {
    List: React.ForwardRefExoticComponent<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & 
      React.RefAttributes<HTMLDivElement>
    >;
    // Workaround: use 'any' for RefAttributes to avoid 'HTMLButtonElement is not defined' in some TS setups
    Trigger: React.ForwardRefExoticComponent<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & 
      React.RefAttributes<any>
    >;
    Content: React.ForwardRefExoticComponent<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & 
      React.RefAttributes<HTMLDivElement>
    >;
  };
  
  export const TabsList: React.FC<React.ComponentProps<typeof TabsPrimitive.List>>;
  export const TabsTrigger: React.FC<React.ComponentProps<typeof TabsPrimitive.Trigger>>;
  export const TabsContent: React.FC<React.ComponentProps<typeof TabsPrimitive.Content>>;
}
