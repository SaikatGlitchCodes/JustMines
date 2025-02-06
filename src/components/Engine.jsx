import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import engine from '../assests/engine.png';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { motion } from 'framer-motion';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';


const codeString = `
const createGame = (gridSize, totalBombs) => {
  const bombs = new Set();
  while (bombs.size < totalBombs) {
    bombs.add(Math.floor(Math.random() * gridSize) + 1); // Adding Randomness here <--
  }

  const calculateEdge = (size, bombs) => (bombs / size) * 100;

  return {
    bombs: [...bombs], // Convert Set to Array
    edge: calculateEdge(gridSize, totalBombs), // House edge calculation
    id: Date.now(), // Unique game identifier
    time: new Date().toISOString(), // Creation time
  };
};

const checkMove = (game, position) => ({
  valid: Boolean(game), // Ensure game object is valid
  hit: game?.bombs.includes(position) || false, // Check if position has a bomb
});
`;

export default function Engine() {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <div className='animate-pulse'>
            <img
                src={engine}
                alt="Engine icon"
                className='w-10 h-10'
                onClick={() => setOpen(true)}
            />

            <Dialog
                open={open}
                onClose={setOpen}
                className="relative z-10"
            >
                <div className="fixed inset-0 z-10 w-screen overflow-y-auto bg-gray-500/75">
                    <div
                        className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0"
                    >
                        <DialogPanel
                            transition
                            className="relative transform overflow-hidden rounded-lg bg-[#243a48] text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95 p-6"
                        >
                            <DialogTitle className="text-xl font-semibold text-white">
                                How We Ensure Fair Play
                            </DialogTitle>

                            {/* Logic Explanation */}

                            <div className="my-4">
                                <ul className="pl-5 mt-2 text-white list-disc">
                                    <li>
                                        <strong>House Edge:</strong> Calculated using a mathematical formula.
                                    </li>
                                    <li>
                                        <strong>Random Bomb Placement:</strong> Bombs are randomly placed
                                        to ensure fairness.
                                    </li>
                                    <li>
                                        <strong>Game Verification:</strong> Every game is uniquely identified for integrity checks.
                                    </li>
                                    <li>
                                        <strong>Click Outcome:</strong> Validates the clicked position.
                                    </li>
                                </ul>
                            </div>

                            {/* Code Display */}
                            <div className="relative">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCopy}
                                    className="absolute p-2 rounded-lg top-4 right-4 bg-gray-700/50 hover:bg-gray-700/70"
                                >
                                    {copied ? (
                                        <CheckIcon className="w-5 h-5 text-green-400" />
                                    ) : (
                                        <ClipboardIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                </motion.button>
                                <div className="overflow-hidden rounded-lg">
                                    <SyntaxHighlighter
                                        language="javascript"
                                        style={atomOneDark}
                                        customStyle={{
                                            padding: '20px',
                                            borderRadius: '8px',
                                            fontSize: '14px',
                                            backgroundColor: '#0d1117'
                                        }}
                                    >
                                        {codeString}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                            {/* Close Button */}
                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={() => setOpen(false)}
                                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                                >
                                    Got it!
                                </button>
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
