import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';

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
      }
    })()
  }, [isSignedIn, getToken])

  const addFunds = async (amount) => {
    console.log('Depositing amount:', amount);
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
    } catch (error) {
      console.error("Error adding funds:", error.response.data.error);
    }
  };

  const handleCashout = async () => {
    console.log('Cashout');
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
    } catch (error) {
      console.error("Error adding funds:", error?.response?.data?.error);
    }
    setBetAmount(0);
  };

  const placeBet = async (betAmount, bombCount) => {
    console.log('Placing bet:', betAmount, bombCount);
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
      console.log('🍄 response placeBet:', response.data);
      setBalance(Number(response.data.data.balance));
      setIsActiveGame(true);
    } catch (error) {
      console.error("Error adding funds:", error.response.data);
    }
    setBetAmount(betAmount);
    return true;
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
      } else {
        playbomb();
        setGameStatus('lost');
        setBetAmount(0);
      }
    } catch (error) {
      console.error("Error revealing cell:", error);
    } finally {
      element?.classList.remove('animate-reveal');
      setIsAnimating(false);
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
      addFunds,
      placeBet,
      handleCashout,
      setOpenWalletModel,
      setBombPositions,
      setIsActiveGame,
      setRevealedCells,
      handleCellClick,
      gameStatus,
      currentMultiplier,
      isAnimating
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);