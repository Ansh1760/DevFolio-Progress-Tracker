import { motion, AnimatePresence } from 'framer-motion';
import { Coins, X } from 'lucide-react';
import { useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';

const CoinRewardPopup = () => {
    const { rewardEvent, setRewardEvent } = useContext(AuthContext);

    useEffect(() => {
        if (rewardEvent) {
            const timer = setTimeout(() => {
                setRewardEvent(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [rewardEvent, setRewardEvent]);

    return (
        <AnimatePresence>
            {rewardEvent && (
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 60, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    /* 
                        Mobile  → bottom-4, left-4 right-4 (full width strip)
                        sm+     → bottom-8, right-8, auto left (natural width)
                    */
                    className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 sm:bottom-8 sm:w-auto z-50"
                >
                    {/* Gold gradient border wrapper */}
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-[2px] rounded-2xl shadow-2xl shadow-yellow-500/20">
                        <div className="bg-[#110B04] rounded-[14px] p-4 sm:p-5 relative overflow-hidden">
                            {/* Glow blob */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />

                            {/* Close button */}
                            <button
                                onClick={() => setRewardEvent(null)}
                                className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Content */}
                            <div className="flex items-center gap-3 sm:gap-4 pr-6">
                                {/* Icon ring */}
                                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-yellow-400/20 border border-yellow-400/30 rounded-full flex items-center justify-center text-yellow-400 shrink-0 shadow-[0_0_16px_rgba(234,179,8,0.25)]">
                                    <Coins className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>

                                <div className="min-w-0">
                                    <h4 className="text-white font-bold text-base sm:text-lg leading-tight">
                                        🎉 +{rewardEvent.amount} DevCoins!
                                    </h4>
                                    <p className="text-white/60 text-xs sm:text-sm mt-0.5 truncate">
                                        {rewardEvent.reason}
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar that depletes over 5s */}
                            <motion.div
                                className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full origin-left"
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                transition={{ duration: 5, ease: 'linear' }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CoinRewardPopup;
