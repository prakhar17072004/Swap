// src/types/global.d.ts

interface EthereumProvider {
    request: (...args: any[]) => Promise<any>;
    on: (event: string, handler: (...args: any[]) => void) => void;
    // Add other properties/methods if needed
  }
  
  interface Window {
    ethereum?: EthereumProvider;
  }
  