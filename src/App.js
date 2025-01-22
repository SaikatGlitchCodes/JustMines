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
import Engine from './components/Engine';
import { useWallet } from './context/WalletContext';

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
      if (amount > 0 && amount <= balance && placeBet(amount)) {
        setGameStarted(true);
        playmouseclick();
      }
    }
  };

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
    <div className='bg-[#071924] h-screen flex flex-col justify-center items-center select-none relative'>
      <Engine />
      <Wallet />
      <div className="flex items-center justify-center gap-x-6">
        <ScoreCard title="Coins" animation={coin} count={25 - selectedNumber} handleNumberChange={handleNumberChange} />
        <div className='grid grid-cols-5 gap-3 grid-row-5'>
          {gridButtons}
        </div>
        <ScoreCard title="Bombs" animation={bomb} count={selectedNumber} handleNumberChange={handleNumberChange} />
      </div>
      <div className='flex flex-col items-center justify-center mt-10'>
        <div className='flex items-center justif-center'>
          
          <input
          type="number"
          value={inputAmount}
          disabled={gameStarted && gameStatus === 'playing'}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="Enter bet amount"
          className="w-32 h-10 px-4 py-2 text-black bg-white rounded-md"
        />
          <NumberSelector selectedNumber={selectedNumber} handleNumberChange={handleNumberChange} />
          
        </div>
        <button onClick={handleBet} className='px-4 py-2 text-xl bg-yellow-300 rounded-lg w-96'>
          {gameStarted ? `CASHOUT (${(currentMultiplier * inputAmount).toFixed(2)})` : 'BET'}
        </button>
      </div>
    </div>
  );
}

export default App;
