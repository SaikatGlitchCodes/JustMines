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
  const [initialLoading, setInitialLoading] = useState(false);
  const [placeBetLoading, setPlaceBetLoading] = useState(false);
  const [cashoutLoading, setCashoutLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!isSignedIn) return;
      try {
        const token = await getToken();
        console.log('🔑 Token:', token);
        setInitialLoading(true);
        const response = await axios.get('https://justminesbackend.onrender.com/auth/me',
          {
            headers: { "Authorization": `Bearer ${token}` }
          });
        console.log('🍄 isActive:', (response.data));
        console.log(Boolean(response.data?.data.activeGame), response.data?.data.activeGame?.revealedTiles);
        if(Boolean(response.data.data.activeGame)){
          setRevealedCells(response.data.data.activeGame.revealedTiles);
          setCurrentMultiplier(response.data.data.activeGame.currentMultiplier);
        }

        setBalance(Number(response.data.data.user.wallet.balance));
        setIsActiveGame(Boolean(response.data.data.activeGame));

        if (response.status !== 200) {
          throw new Error("Failed to fetch user");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
      setInitialLoading(false);
    })()
  }, [isSignedIn, getToken])

  const addFunds = async (amount) => {
    console.log('Depositing amount:', amount);
    try {
      const token = await getToken();
      const response = await axios.post('https://justminesbackend.onrender.com/wallet/deposit',
        { amount: Number(amount) },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      setBalance(Number(response.data.data.balance));
      setOpenWalletModel(false);
    } catch (error) {
      console.error("Error adding funds:", error.response.data.error);
    }
  };

  const handleCashout = async () => {
    console.log('Cashout');
    try {
      const token = await getToken();
      setCashoutLoading(true);
      const response = await axios.post('https://justminesbackend.onrender.com/game/cashout',
        {},
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      setBalance(Number(response.data?.data?.balance));
      setCurrentMultiplier(1);
      setIsActiveGame(false);
    } catch (error) {
      console.error("Error adding funds:", error?.response?.data?.error);
    }
    setCashoutLoading(false);
    setBetAmount(0);
  };

  const placeBet = async (betAmount, bombCount) => {
    console.log('Placing bet:', betAmount, bombCount);
    setIsActiveGame(false);
    try {
      const token = await getToken();
      setPlaceBetLoading(true);
      const response = await axios.post('https://justminesbackend.onrender.com/game/start',
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
      console.log('🍄 response placeBet:', response.data);
      setBalance(Number(response.data.data.balance));
      setIsActiveGame(true);
      setRevealedCells([]);
      setBombPositions([]);
      setGameStatus('playing');
      toast.success("Bet placed successfully");
    } catch (error) {
      console.error("Error adding funds:", error.response.data);
    }
    setPlaceBetLoading(false);
    setBetAmount(betAmount);
    return true;
  };

  return (
    <GameContext.Provider value={{
      balance,
      betAmount,
      openWalletModel,
      isActiveGame,
      bombPositions,
      revealedCells,
      initialLoading,
      gameStatus,
      currentMultiplier,
      isAnimating,
      placeBetLoading,
      cashoutLoading,
      addFunds,
      placeBet,
      handleCashout,
      setOpenWalletModel,
      setBombPositions,
      setIsActiveGame,
      setRevealedCells,
      setCurrentMultiplier,
      setGameStatus
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);