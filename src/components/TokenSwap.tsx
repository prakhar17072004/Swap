import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../contracts/addresses';
import { CgArrowsExchangeAltV } from "react-icons/cg";

const TokenSwap: React.FC = () => {
  const { swapContract, mtkContract, ankContract } = useWeb3();
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [isApproved, setIsApproved] = useState(false);
  const [isMtkToAnk, setIsMtkToAnk] = useState(true);

  const handleApprove = async () => {
    try {
      const contractToApprove = isMtkToAnk ? mtkContract : ankContract; // Choose the appropriate contract based on direction

      if (!contractToApprove) throw new Error("Contract is not initialized");

      const spenderAddress = isMtkToAnk ? CONTRACT_ADDRESSES.ANK : CONTRACT_ADDRESSES.MTK; // Set the spender address based on the swap direction

      // Use the entered swap amount and parse it to the correct decimal format (uint256 with 18 decimals)
      const amountToApprove = ethers.parseUnits(swapAmount, 18); // Convert the user input amount to 18 decimals

      // Call the approve function with spender address and amount
      const transaction = await contractToApprove.approve(spenderAddress, amountToApprove);
      await transaction.wait(); // Wait for the transaction to be confirmed
      setIsApproved(true); // Update the approval state
      console.log("Approval successful");
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  };

  const handleSwap = async () => {
    if (isApproved) {
      try {
        if (!swapContract) throw new Error("Contracts are not initialized");

        const amountToSwap = ethers.parseUnits(swapAmount, 18); // Convert the user input amount to 18 decimals
        
        // Call the swap function
        let transaction;
        if (isMtkToAnk) {
          // Swap from MTK to ANK
          transaction = await swapContract.swapToken1ForToken2(amountToSwap); // Adjust this line to match your contract function
        } else {
          // Swap from ANK to MTK
          transaction = await swapContract.swapToken2ForToken1(amountToSwap); // Adjust this line to match your contract function
        }

        await transaction.wait(); // Wait for the transaction to be confirmed
        console.log("Swap successful");
        setSwapAmount(''); // Clear the input field after swap
        setIsApproved(false); // Reset approval status if necessary (depends on your UX)
      } catch (error) {
        console.error("Error swapping tokens:", error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-center text-2xl font-semibold mb-4">Token Swap</h2>
      <div className="flex flex-col justify-between items-center mb-4">
        <span className='p-4 '>{isMtkToAnk ? 'MTK' : 'ANK'}</span>
        <button onClick={() => setIsMtkToAnk(!isMtkToAnk)} className="px-2 py-1 bg-gray-200 rounded-lg text-xl">
        <CgArrowsExchangeAltV />
        </button>
        <span className='p-4'>{isMtkToAnk ? 'ANK' : 'MTK'}</span>
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
