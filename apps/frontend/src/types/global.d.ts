/// <reference lib="dom" />
/// <reference types="node" />
/// <reference types="google.maps" />

/// <reference types="google.maps" />
declare global {
  interface Window {
    google?: typeof google;
    googleMapsReady?: boolean;
  }
}

export {};
