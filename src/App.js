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
import { generateGameState, verifyGameState } from './services/gameService';
import Wallet from './components/Wallet';
import { useWallet } from './context/WalletContext';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import { useAuth } from "@clerk/clerk-react";

const GRID_SIZE = 25;
const GRID_BUTTONS = Array.from({ length: GRID_SIZE }, (_, i) => i + 1);
const REVEAL_DELAY = 1000;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function App() {
  // Add new state for animation tracking
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState(2);
  const [bombPositions, setBombPositions] = useState([]);
  const [revealedCells, setRevealedCells] = useState(new Set());
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [volume, setVolume] = useState(0.5);
  const [playcoin] = useSound(coinsound, { volume: volume });
  const [playbomb] = useSound(bombsound, { volume: volume });
  const [playmouseclick] = useSound(mouseclick, { volume: 1 });
  const [gameState, setGameState] = useState(null);
  const { handleCashout, handleLoss, balance, placeBet } = useWallet();
  const [gameStarted, setGameStarted] = useState(false);
  const [inputAmount, setInputAmount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  // Add new state for visibility
  const [isMultiplierVisible, setIsMultiplierVisible] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const [userData, setUserData] = useState(null);

  // Memoize game state generation
  const generateNewGameState = useCallback((size, number) => {
    return generateGameState(size, number);
  }, []);

  // Optimize useEffect
  useEffect(() => {
    if (!gameStarted) return; // Early return if game hasn't started

    const newGameState = generateNewGameState(GRID_SIZE, selectedNumber);
    // Batch state updates
    const updateStates = () => {
      setGameState(newGameState);
      setBombPositions(newGameState.bombPositions);
      setRevealedCells(new Set());
      setVolume(0.5);
    };
    updateStates();
  }, [selectedNumber, gameStarted, generateNewGameState]);

  // Memoize number change handler
  const handleNumberChange = useCallback((newValue) => {
    if (gameStarted) return; // Early return if game is started

    setSelectedNumber(prev => Math.min(Math.max(newValue, 1), 24));
  }, [gameStarted]);

  // Memoize cell click handler
  const handleCellClick = useCallback(async (number) => {
    console.log('currentMultiplier', currentMultiplier)
    // Early return conditions using single if statement
    if (!gameStarted || isAnimating || gameStatus !== 'playing' || revealedCells.has(number)) {
      console.debug('Click blocked:', {
        notStarted: !gameStarted,
        animating: isAnimating,
        invalidStatus: gameStatus !== 'playing',
        alreadyRevealed: revealedCells.has(number),
      });


      return;
    }

    setIsAnimating(true);
    document.getElementById(number).classList.add('animate-reveal');

    // Verify move with game state
    const verification = verifyGameState(gameState, number);
    if (!verification.isValid) {
      setGameStatus('error');
      return;
    }

    await delay(REVEAL_DELAY);
    document.getElementById(number).classList.remove('animate-reveal');

    const newRevealedCells = new Set(revealedCells);
    newRevealedCells.add(number);
    setRevealedCells(newRevealedCells);

    // Play appropriate sound based on what was revealed
    if (verification.isBomb) {
      console.log('BOMB!');
      playbomb();
      handleLoss();
      setGameStatus('lost');
      setInputAmount(0);
    } else {
      console.log('COIN!');
      playcoin();
      const newMultiplier = calculateMultiplier(newRevealedCells.size, selectedNumber);
      setCurrentMultiplier(newMultiplier);
    }
    // Increase volume with each reveal
    setVolume(prev => prev + .25);
    setIsAnimating(false);
  }, [gameStarted, isAnimating, gameStatus, revealedCells, selectedNumber, gameState]);

  const calculateMultiplier = useCallback((revealed, bombs) => {
    if (revealed === 0) return 1;
    const safeCells = GRID_SIZE - bombs;
    let multiplier = 1;
    for (let i = 0; i < revealed; i++) {
      multiplier *= (safeCells - i) / (GRID_SIZE - i);
    }
    return 1 / multiplier;
  }, []);

  const handleBet = () => {
    if (gameStarted) {
      // Cashout logic
      handleCashout(currentMultiplier);
      setGameStarted(false);
      setGameStatus('playing');
      setRevealedCells(new Set());
      setCurrentMultiplier(1);
      playmouseclick();
    } else {
      // Betting logic
      const amount = Number(inputAmount);
      if ( amount <= balance && placeBet(amount)) {
        setGameStarted(true);
        playmouseclick();
      }
    }
  };

  // Add useEffect for auto-hide
  useEffect(() => {
    if (currentMultiplier > 1) {
      setIsMultiplierVisible(true);
      const timer = setTimeout(() => {
        setIsMultiplierVisible(false);
      }, 1000); // Hide after 1 seconds
      return () => clearTimeout(timer);
    }
  }, [currentMultiplier]);

  // Fetch user data
  useEffect(() => {
    console.log('isSignedIn', isSignedIn)
    if (!isSignedIn) return;
    console.log('isSignedIn', isSignedIn)
    const fetchUser = async () => {
      try {
        const token = await getToken();
        console.log('Token:', token);
        const response = await fetch("http://localhost:2000/protected", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user");
        }

        const data = await response.json();
        console.log('data', data)
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  });

  console.log('userData', userData)
  
  // Pass isAnimating to GameButton
  const gridButtons = useMemo(() => (
    GRID_BUTTONS.map(num => (
      <GameButton
        key={num}
        number={num}
        isRevealed={revealedCells.has(num)}
        isBomb={bombPositions.includes(num)}
        onClick={handleCellClick}
        gameStatus={gameStatus}
        disabled={isAnimating}
      />
    ))
  ), [revealedCells, bombPositions, isAnimating]);

  return (
    <div className='relative flex flex-col items-center justify-center pb-6 select-none'>
      <Header />
      <AnimatePresence mode="wait">
        {isMultiplierVisible && currentMultiplier > 1 && (
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
            {`${currentMultiplier.toFixed(2)}x`}
          </motion.h1>
        )}
      </AnimatePresence>
      <Wallet />
      <div className="flex items-center justify-center gap-x-6">
        <ScoreCard title="Coins" animation={coin} count={25 - selectedNumber} handleNumberChange={handleNumberChange} />
        <div className='relative grid grid-cols-5 gap-3 grid-row-5'>
          {gridButtons}
        </div>
        <ScoreCard title="Bombs" animation={bomb} count={selectedNumber} handleNumberChange={handleNumberChange} />
      </div>
      <div className='flex items-center justify-center w-full px-5 mt-10'>
          {gameStarted &&  <button onClick={handleBet} className='px-4 py-2 bg-white rounded-lg'>
          {`CASHOUT (${(currentMultiplier * inputAmount).toFixed(2)})`}
          </button> }
        <div className='flex items-center justify-center'>
          {!gameStarted && <input
            type="number"
            value={inputAmount}
            disabled={gameStarted && gameStatus === 'playing'}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="Enter bet amount"
            className="w-32 h-10 px-4 py-2 text-black bg-white rounded-md"
          />}
          <NumberSelector selectedNumber={selectedNumber} handleNumberChange={handleNumberChange} />
        </div>
          {!gameStarted && <button onClick={handleBet} className='px-24 py-2 bg-yellow-300 rounded-lg'>BET</button>}
      </div>
    </div>
  );
}

export default App;
