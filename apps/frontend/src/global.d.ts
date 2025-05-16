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