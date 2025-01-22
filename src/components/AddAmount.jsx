import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../context/WalletContext';

const AMOUNT_BUTTONS = [
  { value: 500, label: '500' },
  { value: 1500, label: '1,500' },
  { value: 10000, label: '10,000' },
];

const MIN_AMOUNT = 500;
const MAX_AMOUNT = 49999;

export const AddAmount = () => {
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { addFunds } = useWallet();

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  const validateAmount = (value) => {
    if (value < MIN_AMOUNT) return `Minimum amount is ₹${MIN_AMOUNT}`;
    if (value > MAX_AMOUNT) return `Maximum amount is ₹${MAX_AMOUNT}`;
    return '';
  };

  const handleDeposit = async () => {
    const numAmount = Number(amount);
    const validationError = validateAmount(numAmount);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      await addFunds(numAmount);
    } catch (err) {
      setError('Failed to process deposit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col py-4 gap-y-3">
      <div className="flex gap-x-3">
        {AMOUNT_BUTTONS.map(({ value, label }) => (
          <button
            key={value}
            className="px-8 py-2 bg-[#4f9ffc] rounded-md hover:bg-[#3d8fe6] transition-colors"
            onClick={() => setAmount(String(value))}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        value={amount}
        onChange={handleAmountChange}
        type="number"
        min={MIN_AMOUNT}
        max={MAX_AMOUNT}
        className="w-full text-2xl text-white rounded-md bg-[#1A2C38] p-2 border-black outline-none focus:ring-2 focus:ring-[#4f9ffc]"
        placeholder="Enter amount"
      />

      <p className="text-sm text-center text-gray-400">
        Minimum: ₹{MIN_AMOUNT.toLocaleString()} | Maximum: ₹{MAX_AMOUNT.toLocaleString()}
      </p>

      {error && <p className="text-sm text-center text-red-500">{error}</p>}

      <div className="flex justify-between px-3 mb-4">
        <span>Total</span>
        <span>₹{amount ? Number(amount).toLocaleString() : '0'}</span>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleDeposit}
        disabled={isLoading || !amount}
        className="w-full px-4 py-2 text-sm text-white bg-[#277FE5] rounded-md disabled:opacity-50"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{ width: '1.25rem', height: '1.25rem', margin: '0 auto', border: '2px solid white', borderRadius: '50%', borderTopColor: 'transparent' }}
          />
        ) : (
          'Deposit'
        )}
      </motion.button>
    </div>
  );
};