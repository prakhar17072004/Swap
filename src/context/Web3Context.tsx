// src/context/Web3Context.tsx
import React, { useEffect, createContext, useContext, useState,ReactNode } from 'react';
import { ethers, Contract } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import YourSwapContractABI from '../contracts/abis/SWAP.json';
import YourMTKContractABI from '../contracts/abis/MTK.json';
import YourANKContractABI from '../contracts/abis/ANK.json';

interface Web3ContextType {
  swapContract: Contract | null;
  mtkContract: Contract | null;
  ankContract: Contract | null;
}
interface Web3ProviderProps {
  children: ReactNode; // Type for children
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const Web3Provider: React.FC <Web3ProviderProps>= ({ children }) => {
  const [swapContract, setSwapContract] = useState<Contract | null>(null);
  const [mtkContract, setMtkContract] = useState<Contract | null>(null);
  const [ankContract, setAnkContract] = useState<Contract | null>(null);

  useEffect(() => {
    const initContracts = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Initialize contracts
        const swapContractInstance = new ethers.Contract(CONTRACT_ADDRESSES.SWAP, YourSwapContractABI, signer);
        const mtkContractInstance = new ethers.Contract(CONTRACT_ADDRESSES.MTK, YourMTKContractABI, signer);
        const ankContractInstance = new ethers.Contract(CONTRACT_ADDRESSES.ANK, YourANKContractABI, signer);

        setSwapContract(swapContractInstance);
        setMtkContract(mtkContractInstance);
        setAnkContract(ankContractInstance);
      } else {
        console.error("Ethereum object doesn't exist!");
      }
    };

    initContracts();
  }, []);

  return (
    <Web3Context.Provider value={{ swapContract, mtkContract, ankContract }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = (): Web3ContextType => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
