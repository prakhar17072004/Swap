import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import MTK_ABI from '../contracts/abis/MTK.json';
import ANK_ABI from '../contracts/abis/ANK.json';
import SWAP_ABI from '../contracts/abis/SWAP.json';

interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  mtkContract: ethers.Contract | null;
  ankContract: ethers.Contract | null;
  swapContract: ethers.Contract | null; // Add swapContract to context
  loading: boolean; // Loading state
  error: string | null; // Error state
}

const Web3Context = createContext<Web3ContextType | null>(null);

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [mtkContract, setMtkContract] = useState<ethers.Contract | null>(null);
  const [ankContract, setAnkContract] = useState<ethers.Contract | null>(null);
  const [swapContract, setSwapContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState<string | null>(null); // Initialize error state

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        if (typeof window !== 'undefined' && window.ethereum) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(web3Provider);
          
          const signer = await web3Provider.getSigner();

          const mtk = new ethers.Contract(
            CONTRACT_ADDRESSES.MTK,
            MTK_ABI,
            signer
          );
          const ank = new ethers.Contract(
            CONTRACT_ADDRESSES.ANK,
            ANK_ABI,
            signer
          );

          const swap = new ethers.Contract(
            CONTRACT_ADDRESSES.SWAP,
            SWAP_ABI,
            signer
          );

          setMtkContract(mtk);
          setAnkContract(ank);
          setSwapContract(swap);
        } else {
          throw new Error('Ethereum provider not found. Please install MetaMask.');
        }
      } catch (err) {
        console.error(err);
        setError(err.message); // Capture the error message
      } finally {
        setLoading(false); // Set loading to false after initialization
      }
    };

    initWeb3();

    // Cleanup function
    return () => {
      setProvider(null);
      setMtkContract(null);
      setAnkContract(null);
      setSwapContract(null);
    };
  }, []);

  return (
    <Web3Context.Provider value={{ provider, mtkContract, ankContract, swapContract, loading, error }}>
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
