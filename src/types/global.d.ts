declare global {
  interface Window {
    Buffer: typeof Buffer;
    global: typeof globalThis;
  }
}

export {};
