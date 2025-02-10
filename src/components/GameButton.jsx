import PropTypes from 'prop-types';
import React from 'react';
import bomb from '../assests/bomb1.json';
import coin from '../assests/coin1.json';
import Lottie from 'lottie-react';

const GameButton = ({ number, isRevealed, isBomb, onClick, gameStatus }) => (
 <button
    id={number}
    onClick={() => onClick(number)}
    className={`md:h-20 md:w-20 h-14 w-14 lg:rounded-2xl md:rounded-xl rounded border-b-4 
      flex justify-center items-center text-[#58A5FF] hover:bg-[#6ec2ff]
      ${isRevealed ? 'bg-[#143349] border-[#143349]' : 'bg-[#277FE5] border-[#47b2ff]'} ${gameStatus==='lost'?'animate-shake':''}`}
  >
    {isRevealed || gameStatus==='lost' ? <Lottie animationData={isBomb ? bomb : coin} loop={true} className='w-64 md:w-32' /> : <h1 className='text-3xl md:text-5xl'>?</h1>}
  </button>
);

GameButton.propTypes = {
  number: PropTypes.number.isRequired,
  isRevealed: PropTypes.bool.isRequired,
  isBomb: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default React.memo(GameButton);