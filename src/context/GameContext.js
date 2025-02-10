import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const GameContext = createContext();

export function GameProvider({ children }) {
  const { getToken, isSignedIn } = useAuth();
  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(0);
  const [bombPositions, setBombPositions] = useState([]);
  const [revealedCells, setRevealedCells] = useState([]);
  const [openWalletModel, setOpenWalletModel] = useState(false);
  const [isActiveGame, setIsActiveGame] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameStatus, setGameStatus] = useState('playing');
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        console.log('🔑 Token:', token);
        const response = await axios.get('http://192.168.1.14:2000/auth/me',
          {
            headers: { "Authorization": `Bearer ${token}` }
          });
        console.log('🍄 isActive:', Boolean(response.data?.activeGame));
        console.log(Boolean(response.data?.activeGame), response.data?.activeGame?.revealedTiles);
        if(Boolean(response.data.activeGame)){
          setRevealedCells(response.data.activeGame.revealedTiles);
        }

        setBalance(Number(response.data.user.wallet.balance));
        setIsActiveGame(Boolean(response.data.activeGame));

        if (response.status !== 200) {
          throw new Error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to fetch user data");
      }
    })()
  }, [isSignedIn, getToken])

  const addFunds = async (amount) => {
    console.log('Depositing amount:', amount);
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post('http://192.168.1.14:2000/wallet/deposit',
        { amount: Number(amount) },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      setBalance(Number(response.data.data.balance));
      setOpenWalletModel(false);
      toast.success("Funds added successfully");
    } catch (error) {
      console.error("Error adding funds:", error.response.data.error);
      toast.error("Failed to add funds");
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    console.log('Cashout');
    setLoading(true);
    try {
      const token = await getToken();
      const response = await axios.post('http://192.168.1.14:2000/game/cashout',
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      setBalance(Number(response.data?.data?.balance));
      setIsActiveGame(false);
      toast.success("Cashout successful");
    } catch (error) {
      console.error("Error during cashout:", error?.response?.data?.error);
      toast.error("Failed to cashout");
    } finally {
      setLoading(false);
    }
    setBetAmount(0);
  };

  const placeBet = async (betAmount, bombCount) => {
    console.log('Placing bet:', betAmount, bombCount);
    setLoading(true);
    
    // Reset game state before placing new bet
    setRevealedCells([]);
    setBombPositions([]);
    setGameStatus('playing');
    setCurrentMultiplier(1);
    
    try {
      const token = await getToken();
      const response = await axios.post('http://192.168.1.14:2000/game/start',
        {
          betAmount,
          bombCount
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      
      // Update game state with fresh data
      setBalance(Number(response.data.data.balance));
      setIsActiveGame(true);
      setBetAmount(betAmount);
      toast.success("Bet placed successfully");
      
      return true;
    } catch (error) {
      console.error("Error placing bet:", error.response?.data);
      toast.error("Failed to place bet");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (number, playcoin, playbomb, isDev) => {
    if (!isActiveGame || isAnimating || revealedCells.includes(number)) {
      if (isDev) {
        console.group('🛑 Cell Click Blocked');
        console.log('Active Game:', isActiveGame);
        console.log('Is Animating:', isAnimating);
        console.log('Already Revealed:', revealedCells.includes(number));
        console.groupEnd();
      }
      return;
    }
    const element = document.getElementById(number);
    setLoading(true);
    try {
      if (isDev) {
        console.group(`🎲 Revealing Cell ${number}`);
      }
      setIsAnimating(true);
      element?.classList.add('animate-reveal');

      const token = await getToken();
      const response = await axios.post(
        'http://192.168.1.14:2000/game/reveal',
        { 
          tileNumber: number 
        },
        { headers: { "Authorization": `Bearer ${token}` }}
      );

      if (response.data.status === "SUCCESS") {
        playcoin();
        setCurrentMultiplier(response.data.currentMultiplier);
        setRevealedCells(response.data.revealedTiles);
        toast.success("Cell revealed successfully");
      } else {
        playbomb();
        setGameStatus('lost');
        setBetAmount(0);
        toast.error("You hit a bomb!");
      }
    } catch (error) {
      console.error("Error revealing cell:", error);
      toast.error("Failed to reveal cell");
    } finally {
      element?.classList.remove('animate-reveal');
      setIsAnimating(false);
      setLoading(false);
    }
  };

  return (
    <GameContext.Provider value={{
      balance,
      betAmount,
      openWalletModel,
      isActiveGame,
      bombPositions,
      revealedCells,
      gameStatus,
      addFunds,
      placeBet,
      handleCashout,
      setOpenWalletModel,
      setBombPositions,
      setIsActiveGame,
      setRevealedCells,
      handleCellClick,
      setGameStatus,
      currentMultiplier,
      isAnimating,
      loading
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);