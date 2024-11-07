import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { CgArrowsExchangeAltV } from "react-icons/cg";

const TokenSwap: React.FC = () => {
  const { swapContract, mtkContract, ankContract, account } = useWeb3();
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [mtkBalance, setMtkBalance] = useState<string>('0');
  const [ankBalance, setAnkBalance] = useState<string>('0');
  const [isApproved, setIsApproved] = useState(false);
  const [isMtkToAnk, setIsMtkToAnk] = useState(true);
  const [calculatedAmount, setCalculatedAmount] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<string>('0');

  // Fetch balances and allowance
  useEffect(() => {
    const fetchBalances = async () => {
      if (mtkContract && ankContract && account) {
        try {
          const mtkBalance = await mtkContract.balanceOf(account);
          const ankBalance = await ankContract.balanceOf(account);
          setMtkBalance(ethers.formatUnits(mtkBalance, 18));
          setAnkBalance(ethers.formatUnits(ankBalance, 18));
        } catch (error) {
          console.error("Error fetching balances:", error);
        }
      }
    };

    const fetchAllowance = async () => {
      if (mtkContract && ankContract && account) {
        try {
          const contractToCheck = isMtkToAnk ? mtkContract : ankContract;
          const spenderAddress = isMtkToAnk ? CONTRACT_ADDRESSES.ANK : CONTRACT_ADDRESSES.MTK;

          const allowance = await contractToCheck.allowance(account, spenderAddress);
          setCurrentAllowance(ethers.formatUnits(allowance, 18));
        } catch (error) {
          console.error("Error fetching allowance:", error);
        }
      }
    };

    fetchBalances();
    fetchAllowance();
  }, [mtkContract, ankContract, account, isMtkToAnk]);

  // Handle input change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSwapAmount(value);

    // Calculate equivalent token amount (update logic based on actual swap calculation)
    const calculated = (parseFloat(value) || 0).toFixed(5);
    setCalculatedAmount(calculated);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);

    // Check if approval is required
    if (parseFloat(value) > parseFloat(currentAllowance)) {
      setIsApproved(false);
    } else {
      setIsApproved(true);
    }
  };

  // Handle approval
  const handleApprove = async () => {
    try {
      const contractToApprove = isMtkToAnk ? mtkContract : ankContract;
      if (!contractToApprove) throw new Error("Contract is not initialized");

      const spenderAddress = isMtkToAnk ? CONTRACT_ADDRESSES.ANK : CONTRACT_ADDRESSES.MTK;
      const amountToApprove = ethers.parseUnits(swapAmount, 18);
      const extraAmount = amountToApprove.sub(ethers.parseUnits(currentAllowance, 18));

      const transaction = await contractToApprove.approve(spenderAddress, extraAmount);
      await transaction.wait();
      setIsApproved(true);
      setCurrentAllowance(swapAmount);
      console.log("Approval successful for extra amount:", ethers.formatUnits(extraAmount, 18));
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  };

  const handleSwap = async () => {
    if (isApproved) {
      try {
        if (!swapContract) throw new Error("Swap contract is not initialized");

        const amountToSwap = ethers.parseUnits(swapAmount, 18);

        let transaction;
        if (isMtkToAnk) {
          transaction = await swapContract.swapToken1ForToken2(amountToSwap);
        } else {
          transaction = await swapContract.swapToken2ForToken1(amountToSwap);
        }

        await transaction.wait();
        console.log("Swap successful");
        setSwapAmount('');
        setIsApproved(false);
      } catch (error) {
        console.error("Error swapping tokens:", error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-[#2B3162] rounded-lg shadow-lg">
      <h2 className="text-center text-3xl font-semibold mb-4 text-white">Token Swap</h2>
      {/* UI elements */}
      <div className="w-full px-4 py-2 mb-4 bg-[#131928] text-white border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
        {loading ? (
          <p>Calculating...</p>
        ) : swapAmount === '' || parseFloat(swapAmount) <= 0 ? (
          <p className='text-white'>Enter amount to swap</p>
        ) : (
          <p>
            {swapAmount} {isMtkToAnk ? 'MTK' : 'ANK'} = {calculatedAmount} {isMtkToAnk ? 'ANK' : 'MTK'}
          </p>
        )}
      </div>

      {!swapAmount ? (
        <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Enter the amount
        </button>
      ) : !isApproved ? (
        <button onClick={handleApprove} className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Approve {isMtkToAnk ? 'MTK' : 'ANK'}
        </button>
      ) : (
        <button onClick={handleSwap} className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
          Swap
        </button>
      )}
    </div>
  );
};

export default TokenSwap;
