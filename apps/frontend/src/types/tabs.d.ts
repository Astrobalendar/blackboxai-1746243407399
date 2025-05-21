import * as React from 'react';

declare module '@/components/ui/tabs' {
  import * as TabsPrimitive from '@radix-ui/react-tabs';

  export const Tabs: React.FC<React.ComponentProps<typeof TabsPrimitive.Root>> & {
    List: React.ForwardRefExoticComponent<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & 
      React.RefAttributes<HTMLDivElement>
    >;
    Trigger: React.ForwardRefExoticComponent<
      React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & 
      React.RefAttributes<HTMLButtonElement>
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
