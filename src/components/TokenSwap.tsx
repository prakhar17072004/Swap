// src/components/TokenSwap.tsx
import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';

const TokenSwap: React.FC = () => {
  const { mtkContract, ankContract } = useWeb3();
  const [swapAmount, setSwapAmount] = useState<string>('');
  const [isApproved, setIsApproved] = useState(false);
  const [isMtkToAnk, setIsMtkToAnk] = useState(true);

  const handleApprove = async () => {
    if (isMtkToAnk && mtkContract) {
      const tx = await mtkContract.approve(/* spender address */, ethers.utils.parseUnits(swapAmount, 18));
      await tx.wait();
      setIsApproved(true);
    } else if (ankContract) {
      const tx = await ankContract.approve(/* spender address */, ethers.utils.parseUnits(swapAmount, 18));
      await tx.wait();
      setIsApproved(true);
    }
  };

  const handleSwap = async () => {
    if (isApproved) {
      // Execute swap logic between MTK and ANK tokens
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-center text-2xl font-semibold mb-4">Token Swap</h2>
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
        placeholder="Enter amount to swap"
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
