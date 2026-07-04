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
            }, 5000); // Hide after 5 seconds
            return () => clearTimeout(timer);
        }
    }, [rewardEvent, setRewardEvent]);

    return (
        <AnimatePresence>
            {rewardEvent && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 rounded-2xl shadow-2xl shadow-yellow-500/20"
                >
                    <div className="bg-navy-dark rounded-xl p-5 relative overflow-hidden min-w-[300px]">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                        
                        <button 
                            onClick={() => setRewardEvent(null)}
                            className="absolute top-2 right-2 text-ice/50 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center text-yellow-400 shrink-0">
                                <Coins className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                                    🎉 +{rewardEvent.amount} DevCoins!
                                </h4>
                                <p className="text-ice/70 text-sm mt-0.5">
                                    {rewardEvent.reason}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CoinRewardPopup;
