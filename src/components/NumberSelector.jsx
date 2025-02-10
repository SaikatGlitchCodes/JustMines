import React from 'react';

const NumberSelector = ({ selectedNumber, handleNumberChange }) => {
  const buttons = [3, 4, 5, 6];
  const options = Array.from({ length: 24 }, (_, i) => i+1);

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      {buttons.map(num => (
        <button
          key={num}
          onClick={() => handleNumberChange(num)}
          className={`px-3 py-3 md:px-3 md:py-1 text-[#c6c6c6] rounded-lg border-2 border-[#313131] hover:bg-[#277FE5] hover:text-white text-md md:text-lg ${selectedNumber === num ? 'bg-[#277FE5]':''}`}
        >
          {num}
        </button>
      ))}
      <select 
        onChange={(e) => handleNumberChange(Number(e.target.value))}
        value={selectedNumber}
        className={`px-3 py-3 md:px-3 md:py-2 text-[#c6c6c6] rounded-lg border-2 border-[#272727] hover:bg-[#277FE5] hover:text-white text-md bg-[#071924] md:text-lg ${selectedNumber > 4? 'bg-[#277FE5]':''}`}
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