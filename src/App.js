// App.js
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import bomb from './assests/bomb1.json';
import coin from './assests/coin1.json';
import bombsound from './assests/bombsound.mp3';
import coinsound from './assests/coinsound.mp3';
import mouseclick from './assests/mouse-click.mp3';
import ScoreCard from './components/ScoreCard';
import GameButton from './components/GameButton';
import NumberSelector from './components/NumberSelector';
import useSound from 'use-sound';
import Wallet from './components/Wallet';
import { useGame } from './context/GameContext';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import Lottie from 'lottie-react';

const GRID_SIZE = 25;
const GRID_BUTTONS = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
const isDev = process.env.NODE_ENV === 'development';

function App() {
  const [gameState, setGameState] = useState({
    isAnimating: false,
    selectedNumber: 4,
    inputAmount: null,
    isMultiplierVisible: false,
    volume: 0.5
  });

  const { getToken } = useAuth();
  const {
    handleCashout,
    balance,
    placeBet,
    isActiveGame,
    bombPositions,
    currentMultiplier,
    revealedCells,
    setRevealedCells,
    setBombPositions,
    setIsActiveGame,
    initialLoading,
    placeBetLoading,
    cashoutLoading,
    setGameStatus,
    setCurrentMultiplier,
    gameStatus
  } = useGame();

  const [playcoin] = useSound(coinsound, { volume: gameState.volume });
  const [playbomb] = useSound(bombsound, { volume: gameState.volume });
  const [playmouseclick] = useSound(mouseclick, { volume: 1 });
  
  const handleNumberChange = useCallback((newValue) => {
    if (isActiveGame) return;

    const validNumber = Math.min(Math.max(parseInt(newValue), 1), 24);
    if (isDev) {
      console.log('🔢 Number Changed:', { oldValue: gameState.selectedNumber, newValue: validNumber });
    }

    setGameState(prev => ({
      ...prev,
      selectedNumber: validNumber
    }));
  }, [isActiveGame, gameState.selectedNumber]);

  const handleCellClick = useCallback(async (number) => {
    if (!isActiveGame || gameState.isAnimating || revealedCells.includes(number)) {
      if (isDev) {
        console.group('🛑 Cell Click Blocked');
        console.log('Active Game:', isActiveGame);
        console.log('Is Animating:', gameState.isAnimating);
        console.log('Already Revealed:', revealedCells.includes(number));
        console.groupEnd();
      }
      return;
    }
    const element = document.getElementById(number);
    try {
      if (isDev) {
        console.group(`🎲 Revealing Cell ${number}`);
        console.time('Cell Reveal Duration');
      }

      setGameState(prev => ({ ...prev, isAnimating: true }));

      element?.classList.add('animate-reveal');

      const token = await getToken();

      if (isDev) {
        console.log('📡 Sending Request:', {
          position: number,
          currentState: {
            revealed: revealedCells,
            bombs: bombPositions
          }
        });
      }

      const response = await axios.post(
        'https://justminesbackend.onrender.com//game/reveal',
        { revealedPosition: number },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const { status, data } = response.data;

      if (isDev) {
        console.log('📥 Server Response:', {
          status,
          data: {
            ...data,
            revealedTiles: data.revealedTiles?.length
              ? `[${data.revealedTiles.join(', ')}]`
              : '[]'
          }
        });
      }

      if (data.status === "CONTINUE") {
        playcoin();
        setGameState(prev => ({
          ...prev,
          volume: Math.min(prev.volume + 0.25, 1)
        }));
        setRevealedCells(data.revealedTiles);
        setCurrentMultiplier(data.currentMultiplier);
        if (isDev) {
          console.log('✅ Game Continues:', {
            multiplier: data.currentMultiplier,
            newVolume: Math.min(gameState.volume + 0.25, 1)
          });
        }
      } else if (data.status === 'GAME_OVER') {
        playbomb();
        setGameState(prev => ({
          ...prev,
          inputAmount: 0
        }));
        setCurrentMultiplier(1);
        setGameStatus('lost')
        setIsActiveGame(false);
        
        if (isDev) {
          console.log('💥 Game Over:', {
            revealedTiles: data.revealedTiles,
            minesPositions: data.minesPositions
          });
        }
      }

    } catch (error) {
      if (isDev) {
        console.group('❌ Cell Reveal Error');
        console.error('Error Details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        console.groupEnd();
      }
    } finally {
      element?.classList.remove('animate-reveal');
      setGameState(prev => ({ ...prev, isAnimating: false }));
      if (isDev) {
        console.timeEnd('Cell Reveal Duration');
        console.groupEnd();
      }
    }
  }, [isActiveGame, gameState.isAnimating, gameState.volume, revealedCells, getToken, playcoin, playbomb, setBombPositions, setRevealedCells, setIsActiveGame]);

  const handleBet = useCallback(() => {
    if (isDev) {
      console.group('💰 Bet Handler');
      console.log('Current State:', {
        isActiveGame,
        amount: gameState.inputAmount,
        balance,
        selectedNumber: gameState.selectedNumber
      });
    }

    if (isActiveGame) {
      if (isDev) console.log('🔄 Cashing Out');
      handleCashout();
      setRevealedCells([]);
      playmouseclick();
      if (isDev) console.groupEnd();
      return;
    }

    const amount = Number(gameState.inputAmount);
    if ( amount > balance && amount < 0) {
      if (isDev) {
        console.warn('⚠️ Invalid Bet Amount:', {
          amount,
          balance,
          reason: 'Insufficient balance'
        });
        console.groupEnd();
      }
      return;
    }

    if (isDev) {
      console.log('✅ Placing Bet:', {
        amount,
        bombCount: gameState.selectedNumber
      });
    }

    const success = placeBet(amount, gameState.selectedNumber);
    if (success) {
      playmouseclick();
    }

    if (isDev) {
      console.log('Bet Result:', success ? '✅ Success' : '❌ Failed');
      console.groupEnd();
    }
  }, [isActiveGame, gameState.inputAmount, gameState.selectedNumber, balance, handleCashout, placeBet, playmouseclick]);

  useEffect(() => {
    if (currentMultiplier <= 1) return;

    setGameState(prev => ({ ...prev, isMultiplierVisible: true }));
    const timer = setTimeout(() => {
      setGameState(prev => ({ ...prev, isMultiplierVisible: false }));
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentMultiplier]);

  const gridButtons = useMemo(() => (
    GRID_BUTTONS.map(num => (
      <GameButton
        key={num}
        number={num}
        isRevealed={revealedCells.includes(num)}
        isBomb={bombPositions.includes(num)}
        onClick={handleCellClick}
        gameStatus={gameStatus}
        disabled={gameState.isAnimating}
      />
    ))
  ), [revealedCells, bombPositions, gameState.isAnimating, gameStatus, handleCellClick]);

  if(initialLoading){
    return <div className='flex flex-col items-center justify-center h-screen'><Lottie animationData={coin} loop={true} className='w-64 md:w-32'/> <h1 className='text-3xl text-white'>Loading...</h1></div>;
  }
  
  return (
    <div className='relative flex flex-col items-center justify-center pb-6 select-none'>
      <Header />
      <AnimatePresence mode="wait">
        {gameState.isMultiplierVisible && currentMultiplier > 1 && (
          <motion.h1
            key={currentMultiplier}
            initial={{ opacity: 0, y: -20, scale: 0.5 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: currentMultiplier > 10 ? 2.5 :
                currentMultiplier > 5 ? 2 :
                  currentMultiplier > 2 ? 1.5 : 1
            }}
            exit={{ opacity: 0, y: 20, scale: 0.5 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 200
            }}
            className={`
              fixed
              inset-0
              flex items-center justify-center
              pointer-events-none
              z-50
              ${currentMultiplier > 10 ? 'text-6xl text-red-400' :
                currentMultiplier > 5 ? 'text-5xl text-green-400' :
                  currentMultiplier > 2 ? 'text-4xl text-yellow-400' :
                    'text-3xl text-white'}
            `}
          >
            {`${currentMultiplier}x`}
          </motion.h1>
        )}
      </AnimatePresence>

      <Wallet />

      <div className="flex items-center justify-center gap-x-6">
        <ScoreCard
          title="Coins"
          animation={coin}
          count={25 - gameState.selectedNumber}
          handleNumberChange={handleNumberChange}
        />
        <div className='relative grid grid-cols-5 gap-3 grid-row-5'>
          {gridButtons}
        </div>
        <ScoreCard
          title="Bombs"
          animation={bomb}
          count={gameState.selectedNumber}
          handleNumberChange={handleNumberChange}
        />
      </div>

      <div className='flex flex-col items-center justify-center w-full px-5 mt-10 md:flex-row'>
        <div className='flex flex-col items-center justify-center md:flex-row'>
          {!isActiveGame && (
            <input
              type="number"
              value={gameState.inputAmount}
              onChange={(e) => setGameState(prev => ({
                ...prev,
                inputAmount: e.target.value
              }))}
              placeholder="Enter bet amount"
              className="w-32 h-10 px-4 py-2 text-black bg-white rounded-md"
            />
          )}
          <NumberSelector
            selectedNumber={gameState.selectedNumber}
            handleNumberChange={handleNumberChange}
          />
        </div>

        <button
          onClick={handleBet}
          className={isActiveGame ?
            'px-4 py-2 bg-white rounded-lg' :
            'px-24 py-2 bg-yellow-300 rounded-lg'
          }
        >
          {placeBetLoading || cashoutLoading?'Loading...': isActiveGame ?
            `CASHOUT (${(currentMultiplier * gameState.inputAmount).toFixed(2)})` :
            'BET'
          }
        </button>
      </div>
    </div>
  );
}

export default App;