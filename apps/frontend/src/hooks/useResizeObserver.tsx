import { RefObject, useEffect, useRef, useState, useCallback } from 'react';

type ResizeObserverCallback = (entry: { width: number; height: number }) => void;

export function useResizeObserver<T extends HTMLElement>(
  ref: RefObject<T>,
  callback: ResizeObserverCallback
) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);
  const callbackRef = useRef(callback);
  
  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Handle resize events
  const handleResize = useCallback((entries: ResizeObserverEntry[]) => {
    if (!entries[0]) return;
    const { width, height } = entries[0].contentRect;
    setSize({ width, height });
    callbackRef.current({ width, height });
  }, []);

  // Set up resize observer
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for browser support
    if (!('ResizeObserver' in window)) {
      console.warn('ResizeObserver is not supported in this browser');
      return;
    }

    // Create and set up observer
    observerRef.current = new ResizeObserver(handleResize);
    observerRef.current.observe(element);

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [ref, handleResize]);

  return size;
}
