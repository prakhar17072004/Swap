import React, { useState } from 'react';
import { ethers } from 'ethers';
//import logo from "../assets/logo.png"
import TokenSwap from '../components/TokenSwap';

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
            <img
          src="../"
          alt="Logo"
          className="border-4 rounded-full p-3 border-green-400"
          width={40}  // Adjust size as needed
          height={40} // Adjust size as needed
        />
            <span className="text-gray-700"><span className='text-xl'>Address:</span> {formatAddress(walletAddress)}</span>
            <span className="text-gray-700"><span className='text-xl'>Balance:</span>  {balance} ETH</span>
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
