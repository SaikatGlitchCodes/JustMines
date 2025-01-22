import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [balance, setBalance] = useState(1000); // Starting balance
  const [betAmount, setBetAmount] = useState(0);

  const addFunds = (amount) => {
    setBalance(prev => prev + Number(amount));
  };

  const placeBet = (amount) => {
    if (amount <= balance) {
      setBalance(prev => prev - amount);
      setBetAmount(amount);
      return true;
    }
    return false;
  };

  const handleCashout = (multiplier) => {
    const winnings = betAmount * multiplier;
    setBalance(prev => prev + winnings);
    setBetAmount(0);
  };

  const handleLoss = () => {
    setBetAmount(0);
  };

  return (
    <WalletContext.Provider value={{
      balance,
      betAmount,
      addFunds,
      placeBet,
      handleCashout,
      handleLoss
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);