import Lottie from 'lottie-react';
import PropTypes from 'prop-types';
import React from'react';

const ScoreCard = ({ title, animation, count, handleNumberChange }) => {
    const changeValue = () => {
        if (title === 'Bombs'){
            handleNumberChange( count + 1);
        } else handleNumberChange( 25-count -1);
    }

  return <div className='bg-[#141F2F] flex-col md:flex items-center justify-center rounded-2xl py-6 hidden'>
    <h1 className='text-3xl text-white md:text-xl'>{title}</h1>
    <Lottie animationData={animation} loop={true} className='w-64 md:w-32' onClick={changeValue}/>
    <h1 className='text-5xl text-white md:text-3xl'>{count}</h1>
  </div>
};

ScoreCard.propTypes = {
  title: PropTypes.string.isRequired,
  animation: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired
};

export default React.memo(ScoreCard);