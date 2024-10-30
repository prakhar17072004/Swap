// src/context/Web3Context.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import MTK_ABI from '../contracts/abis/MTK.json';
import ANK_ABI from '../contracts/abis/ANK.json';

const Web3Context = createContext(null);

export const Web3Provider: React.FC = ({ children }) => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [mtkContract, setMtkContract] = useState<ethers.Contract | null>(null);
  const [ankContract, setAnkContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum );
        setProvider(web3Provider);
        
        const mtk = new ethers.Contract(CONTRACT_ADDRESSES.MTK, MTK_ABI.abi, web3Provider.getSigner());
        const ank = new ethers.Contract(CONTRACT_ADDRESSES.ANK, ANK_ABI.abi, web3Provider.getSigner());
        
        setMtkContract(mtk);
        setAnkContract(ank);
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

export const useWeb3 = () => useContext(Web3Context);
