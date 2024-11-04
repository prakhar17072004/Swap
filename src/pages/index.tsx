import React, { useState } from 'react';
import { ethers } from 'ethers';
import { FiUser } from 'react-icons/fi';  // Import user icon
import TokenSwap from '../components/TokenSwap';

const HOME_NETWORK_PARAMS = {
  chainId: '17000', // Chain ID in hexadecimal for Holesky
  chainName: 'Holesky ',
  rpcUrls: ['https://rpc.holesky.testnet'],
  nativeCurrency: {
    name: 'Holesky Ether',
    symbol: 'HETH', // Symbol for Holesky Ether
    decimals: 18,
  },
  blockExplorerUrls: ['https://explorer.holesky.testnet'], // Optional
};

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Connect to Metamask with Delay
  const connectWallet = async () => {
    if (window.ethereum) {
      setLoading(true); // Start loading
      
      // Simulate delay
      setTimeout(async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          
          // Check if the wallet is connected to the correct network
          const network = await provider.getNetwork();
          if (network.chainId !== parseInt(HOME_NETWORK_PARAMS.chainId, 16)) {
            // Request to switch to Holesky network
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [HOME_NETWORK_PARAMS],
              });
            } catch (switchError) {
              console.error('Failed to switch to Holesky network', switchError);
              setLoading(false);
              return;
            }
          }

          await provider.send("eth_requestAccounts", []);
          setProvider(provider);

          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);

          // Get balance and format it to 2 decimal places
          const balance = await provider.getBalance(address);
          const formattedBalance = Number(ethers.formatEther(balance)).toFixed(2);
          setBalance(formattedBalance);
        } catch (error) {
          console.error("Error connecting to Metamask", error);
        } finally {
          setLoading(false); // Stop loading after delay
        }
      }, 2000); // 2-second delay
    } else {
      alert("Please install Metamask!");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance(null);
    setProvider(null);
  };

  // Format address for display
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Wallet Connection Info in Top-Right Corner */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        {walletAddress ? (
          <div className="flex items-center space-x-4">
            {/* Icon next to the address */}
            <FiUser className="text-gray-600 border-4 rounded-full p-3 border-green-400" size={20} /> 
            <span className="text-gray-700"><span className='text-xl'>Address:</span> {formatAddress(walletAddress)}</span>
            <span className="text-gray-700"><span className='text-xl'>Balance:</span>  {balance} HETH</span>
            <button onClick={disconnectWallet} className="bg-red-500 text-white px-4 py-2 rounded">
              Disconnect
            </button>
          </div>
        ) : loading ? (
          <div className="loader">Connecting...</div>
        ) : (
          <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
            Connect Wallet
          </button>
        )}
      </div>

      {/* Token Swap Component or Connect Message */}
      {walletAddress ? (
        <TokenSwap />
      ) : (
        <div className="text-gray-700 text-xl mt-10">Please connect the wallet to use the token swap feature.</div>
      )}
    </div>
  );
};

export default Home;
