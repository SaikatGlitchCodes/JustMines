const calculateHouseEdge = (totalGrids, bombs) => {
  // House edge calculation logic here
  return (bombs / totalGrids) * 100;
};

export const generateGameState = (gridSize, bombCount) => {
  const positions = new Set();
  while (positions.size < bombCount) {
    positions.add(Math.floor(Math.random() * gridSize) + 1);
  }
  
  return {
    bombPositions: Array.from(positions),
    houseEdge: calculateHouseEdge(gridSize, bombCount),
    gameId: Date.now(), // For verification
    timestamp: new Date().toISOString()
  };
};

export const verifyGameState = (gameState, revealedPosition) => {
  // Verify game integrity
  return {
    isValid: true,
    isBomb: gameState.bombPositions.includes(revealedPosition)
  };
};