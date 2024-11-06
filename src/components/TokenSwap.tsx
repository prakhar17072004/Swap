import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';

const TokenSwap: React.FC = () => {
  const { swapContract, mtkContract, ankContract, account } = useWeb3(); // Ensure 'account' is available
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [isApproved, setIsApproved] = useState(false);
  const [isMtkToAnk, setIsMtkToAnk] = useState(true);
  const [mtkBalance, setMtkBalance] = useState<string>('0');
  const [ankBalance, setAnkBalance] = useState<string>('0');

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        if (!account || !mtkContract || !ankContract) return;

        const [mtkBal, ankBal] = await Promise.all([
          mtkContract.balanceOf(account),
          ankContract.balanceOf(account)
        ]);

        setMtkBalance(ethers.formatUnits(mtkBal, 18));
        setAnkBalance(ethers.formatUnits(ankBal, 18));
      } catch (error) {
        console.error("Error fetching token balances:", error);
      }
    };

    fetchBalances();
  }, [account, mtkContract, ankContract]);

  const handleApprove = async () => {
    try {
      const contractToApprove = isMtkToAnk ? mtkContract : ankContract;
      if (!contractToApprove) throw new Error("Contract is not initialized");

      const spenderAddress = isMtkToAnk ? CONTRACT_ADDRESSES.ANK : CONTRACT_ADDRESSES.MTK;
      const amountToApprove = ethers.parseUnits(swapAmount, 18);

      const transaction = await contractToApprove.approve(spenderAddress, amountToApprove);
      await transaction.wait();
      setIsApproved(true);
      console.log("Approval successful");
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  };

  const handleSwap = async () => {
    if (isApproved) {
      try {
        if (!swapContract) throw new Error("Contracts are not initialized");

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
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-center text-2xl font-semibold mb-4">Token Swap</h2>
      <div className="mb-4">
        <div className="flex justify-between items-center">
          <span>MTK Balance: {mtkBalance}</span>
          <span>ANK Balance: {ankBalance}</span>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <span>{isMtkToAnk ? 'MTK' : 'ANK'}</span>
        <button onClick={() => setIsMtkToAnk(!isMtkToAnk)} className="px-2 py-1 bg-gray-200 rounded-lg">
          ⇄
        </button>
        <span>{isMtkToAnk ? 'ANK' : 'MTK'}</span>
      </div>
      <input
        type="number"
        value={swapAmount}
        onChange={(e) => setSwapAmount(e.target.value)}
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        placeholder={!isApproved ? `Enter amount to approve` : `Enter amount to swap`}
      />
      {!isApproved ? (
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
