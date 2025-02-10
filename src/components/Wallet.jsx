import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import Lottie from 'lottie-react';
import wallet from '../assests/wallet.json'
import upi from '../assests/upi_logo_icon.png'
import netbanking from '../assests/internet-banking.png'
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { AddAmount } from "./AddAmount";

const SCREENS = {
    DEPOSIT: 0,
    PAYMENT: 1
};

const DepositScreen = ({ setOpen, onNext }) => (
    <div
        className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0"
    >
        <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-[#071924] text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
        >
            <div className="px-4 pt-5 pb-4 bg-[#243a48] sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">

                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <DialogTitle as="h3" className="text-xl font-semibold text-white ">
                            Just Mines Wallet
                        </DialogTitle>
                        <Lottie animationData={wallet} loop={true} className='w-56 m-auto' />
                        <div className="mt-2">
                            <p className="text-sm text-white">
                                Now you can deposit via UPI & Bank transfer which is available in your region. Alternates like the Crypto are under construction
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-3 bg-[#1A2C38]  sm:flex sm:flex-row-reverse sm:px-6">
                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex justify-center w-full px-3 py-2 text-sm text-white bg-[#277FE5] rounded-md shadow-sm hover:bg-[#4f9ffc] sm:ml-3 sm:w-auto"
                >
                    Deposite
                </button>
                <button
                    type="button"
                    data-autofocus
                    onClick={() => setOpen(false)}
                    className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                    Cancel
                </button>
            </div>
        </DialogPanel>
    </div>
);

const PaymentScreen = ({ onBack }) => {
    const [paymentModeUpi, setPaymentModeUpi] = useState(true);
    return (
        <div>
            <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
                <DialogPanel
                    transition
                    className="relative transform overflow-hidden rounded-lg  bg-[#243a48] text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                >
                    <div className="px-4 pt-5 pb-4 bg-[#1A2C38] sm:p-6 sm:pb-4">
                        <button
                            onClick={onBack}
                            className="text-white hover:text-gray-300"
                        >
                            {'<'} Wallet/Payment
                        </button>
                    </div>
                    <div className="flex flex-col items-center my-6 gap-y-6">
                        <motion.label
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentModeUpi(true)}
                            className={`w-4/5 px-5 border-2 rounded-md text-white 
                        ${paymentModeUpi ? 'border-[#4f9ffc]' : 'border-[#c4c4c4]'} px-4`}
                        >
                            <div className="flex items-center justify-between "><h1 className="">UPI</h1> <img src={upi} alt="UPI logo" className="h-12" /></div>
                            {
                                paymentModeUpi && <AddAmount/>
                            }
                        </motion.label>



                        <motion.label
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPaymentModeUpi(false)}
                            className={`w-4/5 px-5 border-2 rounded-md text-white 
                        ${!paymentModeUpi ? 'border-[#4f9ffc]' : 'border-[#c4c4c4]'} px-4`}
                        >
                            <div className="flex items-center justify-between "><h1 className="">Net Banking</h1> <img src={netbanking} alt="Net Banking logo" className="h-12" /></div>
                            {
                                !paymentModeUpi && <AddAmount />
                            }
                        </motion.label>

                        <input type="radio" className="hidden" name="payment" id="upi" />
                        <input type="radio" className="hidden" name="payment" id="netbanking" />
                    </div>
                </DialogPanel>
            </div>
        </div>
    );
};

export default function Wallet() {
    const [currentScreen, setCurrentScreen] = useState(SCREENS.DEPOSIT);
    const { balance, openWalletModel, setOpenWalletModel } = useGame();

    const handleNext = () => setCurrentScreen(SCREENS.PAYMENT);
    const handleBack = () => setCurrentScreen(SCREENS.DEPOSIT);

    const renderScreen = () => {
        return (
            <AnimatePresence mode="wait">
                {currentScreen === SCREENS.DEPOSIT ? (
                    <DepositScreen setOpen={setOpenWalletModel} onNext={handleNext} />
                ) : (
                    <PaymentScreen onBack={handleBack} />
                )}
            </AnimatePresence>
        );
    };

    return (
        <div className="flex items-center justify-center mb-7 gap-x-3">
            <div>
                <div className="flex items-center rounded-md bg-[#243948] pl-3 outline outline-1 -outline-offset-1 outline-[#243948] has-[input:focus-within]:outline has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                    <input
                        id="price"
                        name="price"
                        type="text"
                        disabled
                        placeholder="0.00"
                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-white placeholder:text-gray-400 focus:outline bg-[#243948] focus:outline-0 sm:text-sm/6 "
                        value={balance}
                    />
                    <div className="grid grid-cols-1 shrink-0 focus-within:relative">
                        <select
                            id="currency"
                            name="currency"
                            aria-label="Currency"
                            className="col-start-1 row-start-1 w-full appearance-none rounded-md py-1.5 pl-3 pr-7 text-base text-gray-500 bg-[#243948] placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        >
                            {/* <option>USD</option>
                    <option>CAD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>JPY</option>
                    <option>AUD</option> */}
                            <option>INR</option>
                        </select>

                    </div>

                </div>
            </div>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpenWalletModel(true)}
                className="px-4 py-2 rounded-lg bg-[#ffed26]"
            >
                Wallet
            </motion.button>
            <AnimatePresence>
                {openWalletModel && (
                    <Dialog open={openWalletModel} onClose={() => {
                        setOpenWalletModel(false);
                        setCurrentScreen(SCREENS.DEPOSIT);
                    }} className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 bg-gray-500/75"
                        />
                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            {renderScreen()}
                        </div>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
}
