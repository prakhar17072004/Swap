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

  // Fetch balances for MTK and ANK
  useEffect(() => {
    const fetchBalances = async () => {
      if (mtkContract && ankContract && account) {
        try {
          const mtkBalance = await mtkContract.balanceOf(account);
          const ankBalance = await ankContract.balanceOf(account);
          setMtkBalance(ethers.formatUnits(mtkBalance, 18)); // Adjust to 18 decimals
          setAnkBalance(ethers.formatUnits(ankBalance, 18)); // Adjust to 18 decimals
        } catch (error) {
          console.error("Error fetching balances:", error);
        }
      }
    };
    fetchBalances();
  }, [mtkContract, ankContract, account]);

  // Handle input change and calculate equivalent value for the other token
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSwapAmount(value);

    if (isMtkToAnk) {
      // Calculate equivalent ANK for the given MTK amount
      const calculated = (parseFloat(value) || 0).toFixed(5); // Update this calculation logic based on your actual token swap logic
      setCalculatedAmount(calculated);
    } else {
      // Calculate equivalent MTK for the given ANK amount
      const calculated = (parseFloat(value) || 0).toFixed(5); // Update this calculation logic based on your actual token swap logic
      setCalculatedAmount(calculated);
    }

    // Simulate a delay for showing the calculation
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

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
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-center text-2xl font-semibold mb-4">Token Swap</h2>

      <div className="flex flex-col justify-between items-center mb-4">
        <div className='flex flex-col outline'>
        <span className='p-4'>{isMtkToAnk ? 'MTK' : 'ANK'} 
        <input
        type="text"
        pattern='^[0-9]*[.,]?[0-9]*$'
        inputMode='decimal'
        value={swapAmount}
        onChange={handleAmountChange}
        className=" px-2  py-2 mb-4 w-[300px] rounded-lg text-right outline-none"
        placeholder="0"
      />
        </span>
        <span>
        Balance: {mtkBalance}
        </span>
        </div>
        <button onClick={() => setIsMtkToAnk(!isMtkToAnk)} className="px-2 py-1 bg-gray-200 rounded-lg text-xl">
          <CgArrowsExchangeAltV />
        </button>
        <div className='flex flex-col outline'>
        <span className='p-4  text-lg font-bold '>{isMtkToAnk ? 'ANK' : 'MTK'} 
        <input
        type="text"
        pattern='^[0-9]*[.,]?[0-9]*$'
        inputMode='decimal'
        value={swapAmount}
        onChange={handleAmountChange}
        className=" px-2  py-2 mb-4 w-[300px] rounded-lg text-right outline-none"
        placeholder="0"
      />
        </span>
        <span>Balance: {ankBalance}</span>
        </div>
      </div>

      

<div className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
  {loading ? (
    <p>Calculating...</p>
  ) : swapAmount === '' || parseFloat(swapAmount) <= 0 ? (
    <p>Enter amount to swap</p>
  ) : (
    <p >
      {swapAmount} {isMtkToAnk ? 'MTK' : 'ANK'} = {calculatedAmount} {isMtkToAnk ? 'ANK' : 'MTK'}
    </p>
  )}
</div>


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
