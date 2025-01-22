import React from 'react';
import { motion } from 'framer-motion';

const QUICK_AMOUNTS = [500, 1500, 10000];

export default function AmountInput({ amount, setAmount, onSubmit, isLoading }) {
  return (
    <div className="flex flex-col py-4 gap-y-3">
      <div className="flex gap-x-3">
        {QUICK_AMOUNTS.map(value => (
          <button
            key={value}
            onClick={() => setAmount(value)}
            className="px-4 py-2 bg-[#4f9ffc] rounded-md"
          >
            {value}
          </button>
        ))}
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-full text-2xl text-white rounded-md bg-[#1A2C38] p-2 outline-none"
        placeholder="Amount"
      />
      <p className="text-sm text-center">Minimum : ₹500 | Maximum : ₹49,999</p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSubmit}
        disabled={isLoading || amount < 500 || amount > 49999}
        className="w-full px-4 py-2 text-sm text-white bg-[#277FE5] rounded-md disabled:opacity-50"
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
          />
        ) : (
          "Deposit"
        )}
      </motion.button>
    </div>
  );
}