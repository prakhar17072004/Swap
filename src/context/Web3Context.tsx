// src/context/Web3Context.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import MTK_ABI from '../contracts/abis/MTK.json';
import ANK_ABI from '../contracts/abis/ANK.json';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  mtkContract: ethers.Contract | null;
  ankContract: ethers.Contract | null;
}

const Web3Context = createContext<Web3ContextType | null>(null);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [mtkContract, setMtkContract] = useState<ethers.Contract | null>(null);
  const [ankContract, setAnkContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(web3Provider);
        
        const mtk = new ethers.Contract(
          CONTRACT_ADDRESSES.MTK,
          MTK_ABI,
          await web3Provider.getSigner()
        );
        const ank = new ethers.Contract(
          CONTRACT_ADDRESSES.ANK,
          ANK_ABI,
          await web3Provider.getSigner()
        );
        
        setMtkContract(mtk);
        setAnkContract(ank);
      } else {
        console.error('Ethereum provider not found. Please install MetaMask.');
      }
    };
    initWeb3();
  }, []);

  return (
    <Web3Context.Provider value={{ provider, mtkContract, ankContract }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
