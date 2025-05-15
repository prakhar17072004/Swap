import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { FiUser } from 'react-icons/fi';
import TokenSwap from '../components/TokenSwap';

const HOME_NETWORK_PARAMS = {
  chainId: '17000', // Chain ID for Holesky in hexadecimal
  chainName: 'Holesky Test Network',
  rpcUrls: ['https://rpc.ankr.com/eth_holesky'],
  nativeCurrency: {
    name: 'Holesky Ether',
    symbol: 'ETH', // Symbol for Holesky Ether
    decimals: 18,
  },
  blockExplorerUrls: ['https://holesky.etherscan.io/'], // Optional
};

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load wallet details from localStorage if available
  useEffect(() => {
    const savedAddress = localStorage.getItem('walletAddress');
    const savedBalance = localStorage.getItem('walletBalance');
    if (savedAddress && savedBalance) {
      setWalletAddress(savedAddress);
      setBalance(savedBalance);
    }
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Connect to Metamask with Delay
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      setLoading(true);

      setTimeout(async () => {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as any);

          const network = await provider.getNetwork();
          const expectedChainId = BigInt(HOME_NETWORK_PARAMS.chainId);
          if (network.chainId !== expectedChainId) {
            try {
              await (window.ethereum as any).request({
                method: 'wallet_addEthereumChain',
                params: [HOME_NETWORK_PARAMS],
              });
            } catch (switchError) {
              console.error('Failed to switch to Holesky network', switchError);
              alert('Failed to switch to Holesky network. Please check your wallet settings.');
              setLoading(false);
              return;
            }
          }

          await provider.send("eth_requestAccounts", []);
          setProvider(provider);

          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);

          const balance = await provider.getBalance(address);
          const formattedBalance = Number(ethers.formatEther(balance)).toFixed(2);
          setBalance(formattedBalance);

          localStorage.setItem('walletAddress', address);
          localStorage.setItem('walletBalance', formattedBalance);
        } catch (error) {
          console.error("Error connecting to Metamask", error);
          alert('Error connecting to Metamask. Please ensure you have it installed and set up correctly.');
        } finally {
          setLoading(false);
        }
      }, 2000);
    } else {
      alert("Please install Metamask!");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletAddress(null);
    setBalance(null);
    setProvider(null);
    setDropdownOpen(false);
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletBalance');
  };

  // Format address for display
  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A286B]">
      {/* Wallet Connection Info in Top-Right Corner */}
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        {walletAddress ? (
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center space-x-4 cursor-pointer border-4 border-black rounded-lg p-4"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FiUser className="text-gray-600 border-4 rounded-full p-3 border-green-400" size={20} />
              <span className="text-white"><span className="text-xl">Address:</span> {formatAddress(walletAddress)}</span>
            </div>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                className="absolute top-full right-0 mt-2 bg-white shadow-lg rounded-lg p-4 w-48 text-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
              >
                <button
                  onClick={disconnectWallet}
                  className="bg-red-500 text-white px-4 py-2 rounded w-full"
                >
                  Disconnect
                </button>
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="loader">Connecting...</div>
        ) : (
          <button onClick={connectWallet} className="bg-blue-400 text-white px-2 py-2 rounded">
            Connect Wallet
          </button>
        )}
      </div>

      {/* Token Swap Component */}
      <TokenSwap />
    </div>
  );
};

export default Home;
