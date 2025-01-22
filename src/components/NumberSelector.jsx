import React from 'react';

const NumberSelector = ({ selectedNumber, handleNumberChange }) => {
  const buttons = [1, 2, 3, 4];
  const options = Array.from({ length: 20 }, (_, i) => i + 5);

  return (
    <div className="flex items-center gap-2 p-4">
      {buttons.map(num => (
        <button
          key={num}
          onClick={() => handleNumberChange(num)}
          className={`px-10 py-6 md:px-3 md:py-1 text-[#c6c6c6] rounded-lg border-2 border-[#313131] hover:bg-[#277FE5] hover:text-white text-3xl md:text-lg ${selectedNumber === num ? 'bg-[#277FE5]':''}`}
        >
          {num}
        </button>
      ))}
      <select 
        onChange={(e) => handleNumberChange(Number(e.target.value))}
        value={selectedNumber}
        className={`px-10 py-6 md:px-3 md:py-2 text-[#c6c6c6] rounded-lg border-2 border-[#272727] hover:bg-[#277FE5] hover:text-white text-3xl bg-[#071924] md:text-lg ${selectedNumber > 4? 'bg-[#277FE5]':''}`}
      >
        <option value="">Bomb</option>
        {options.map(num => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
};

export default NumberSelector;