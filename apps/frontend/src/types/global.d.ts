/// <reference types="@types/google.maps" />

interface ImportMeta {
  env: {
    VITE_BACKEND_URL: string;
  };
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

interface ResizeObserverEntry {
  readonly target: Element;
  readonly contentRect: DOMRectReadOnly;
  readonly borderBoxSize?: ResizeObserverSize[];
  readonly contentBoxSize?: ResizeObserverSize[];
  readonly devicePixelContentBoxSize?: ResizeObserverSize[];
}

interface ResizeObserverSize {
  readonly inlineSize: number;
  readonly blockSize: number;
}

declare global {
  interface Window {
    google: typeof google;
    ResizeObserver: {
      new(callback: ResizeObserverCallback): ResizeObserver;
    };
  }
}

export {};
