import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, ShieldAlert, Lock, ShoppingBag, Coins, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ModalBackdrop = ({ children, onClose }) => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-navy-dark/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
    >
        {children}
    </motion.div>
);

const ModalContent = ({ children, className = '' }) => (
    <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        onClick={(e) => e.stopPropagation()}
        className={`bg-surface border border-border rounded-3xl p-6 shadow-2xl relative w-full max-w-md ${className}`}
    >
        {children}
    </motion.div>
);

const CloseButton = ({ onClick }) => (
    <button 
        onClick={onClick} 
        className="absolute top-4 right-4 p-2 text-ice/50 hover:text-white bg-navy-light/30 hover:bg-navy-light/60 rounded-full transition-colors"
    >
        <X className="w-5 h-5" />
    </button>
);

export const ConfirmModal = ({ isOpen, onClose, product, userCoins, onConfirm }) => {
    if (!isOpen || !product) return null;
    
    return (
        <ModalBackdrop onClose={onClose}>
            <ModalContent>
                <CloseButton onClick={onClose} />
                <div className="flex flex-col items-center text-center mt-4">
                    <div className="w-20 h-20 rounded-2xl bg-surface/80 border border-border shadow-lg flex items-center justify-center mb-5 relative overflow-hidden">
                        <div className={`absolute inset-0 opacity-20 blur-xl ${product.gradient}`} />
                        <product.icon className={`w-10 h-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] ${product.iconColor || 'text-white'}`} />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Confirm Purchase</h3>
                    <p className="text-ice/70 text-sm mb-6">Are you sure you want to purchase the <span className="font-bold text-white">{product.title}</span>?</p>
                    
                    <div className="w-full bg-navy-light/30 rounded-2xl p-4 mb-6 border border-border/50">
                        <div className="flex justify-between items-center mb-3 text-sm">
                            <span className="text-ice/60">Item Cost</span>
                            <span className="font-bold text-white flex items-center gap-1.5">{product.price} <span className="text-yellow-500">🪙</span></span>
                        </div>
                        <div className="flex justify-between items-center mb-3 text-sm">
                            <span className="text-ice/60">Current Balance</span>
                            <span className="font-bold text-white flex items-center gap-1.5">{userCoins} <span className="text-yellow-500">🪙</span></span>
                        </div>
                        <div className="h-px w-full bg-border/50 my-3" />
                        <div className="flex justify-between items-center">
                            <span className="text-ice/80 font-medium">Remaining Coins</span>
                            <span className="font-bold text-green-400 flex items-center gap-1.5">{userCoins - product.price} <span className="text-yellow-500">🪙</span></span>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-navy-light/40 hover:bg-navy-light/60 text-white font-medium transition-colors">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className="flex-1 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors shadow-[0_0_15px_rgba(186,18,0,0.4)]">
                            Confirm Purchase
                        </button>
                    </div>
                </div>
            </ModalContent>
        </ModalBackdrop>
    );
};

export const SuccessModal = ({ isOpen, onClose, product, remainingCoins }) => {
    if (!isOpen || !product) return null;
    
    return (
        <ModalBackdrop onClose={onClose}>
            <ModalContent className="overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-green-500/10 blur-[80px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-sky/10 blur-[80px] rounded-full pointer-events-none" />
                
                <div className="flex flex-col items-center text-center mt-6 relative z-10">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="w-24 h-24 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                    >
                        <CheckCircle className="w-12 h-12" />
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold text-white mb-2">Congratulations! 🎉</h3>
                    <p className="text-ice/80 mb-8 leading-relaxed">
                        You have successfully purchased <br/><span className="text-white font-bold text-lg">{product.title}</span>.
                    </p>
                    
                    <div className="flex gap-4 w-full mb-8">
                        <div className="flex-1 bg-navy-light/40 rounded-xl p-3 border border-border/50">
                            <p className="text-ice/50 text-xs mb-1 uppercase tracking-wider">Coins Spent</p>
                            <p className="text-red-400 font-bold flex items-center justify-center gap-1">-{product.price} <span className="text-yellow-500 text-sm">🪙</span></p>
                        </div>
                        <div className="flex-1 bg-navy-light/40 rounded-xl p-3 border border-border/50">
                            <p className="text-ice/50 text-xs mb-1 uppercase tracking-wider">Remaining</p>
                            <p className="text-green-400 font-bold flex items-center justify-center gap-1">{remainingCoins} <span className="text-yellow-500 text-sm">🪙</span></p>
                        </div>
                    </div>
                    
                    <button onClick={onClose} className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-colors shadow-lg">
                        Continue Shopping
                    </button>
                </div>
            </ModalContent>
        </ModalBackdrop>
    );
};

export const InsufficientModal = ({ isOpen, onClose, product, userCoins }) => {
    const navigate = useNavigate();
    if (!isOpen || !product) return null;
    
    const needed = product.price - userCoins;
    
    return (
        <ModalBackdrop onClose={onClose}>
            <ModalContent>
                <CloseButton onClick={onClose} />
                <div className="flex flex-col items-center text-center mt-4">
                    <div className="w-20 h-20 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mb-5 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.15)]">
                        <Coins className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">Not Enough DevCoins</h3>
                    <p className="text-ice/70 text-sm mb-6">You need more coins to purchase the <span className="text-white font-medium">{product.title}</span>.</p>
                    
                    <div className="w-full bg-navy-light/30 rounded-2xl p-5 mb-6 border border-border/50 flex flex-col gap-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-ice/60">Current Balance</span>
                            <span className="font-bold text-white flex items-center gap-1">{userCoins} <span className="text-yellow-500">🪙</span></span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-ice/60">Required Coins</span>
                            <span className="font-bold text-white flex items-center gap-1">{product.price} <span className="text-yellow-500">🪙</span></span>
                        </div>
                        <div className="h-px w-full bg-border/50" />
                        <div className="flex justify-between items-center">
                            <span className="text-ice/80 font-medium">You Need</span>
                            <span className="font-bold text-yellow-500 flex items-center gap-1">{needed} More <span className="text-yellow-500">🪙</span></span>
                        </div>
                    </div>
                    
                    <div className="w-full text-left mb-6">
                        <p className="text-xs text-ice/50 uppercase tracking-wider mb-3 pl-2">How to earn more</p>
                        <ul className="text-sm text-ice/80 space-y-2">
                            <li className="flex items-center gap-2 bg-navy-light/20 p-2 rounded-lg border border-border/30"><CheckCircle className="w-4 h-4 text-green-400"/> Solve coding problems (+2 per problem)</li>
                            <li className="flex items-center gap-2 bg-navy-light/20 p-2 rounded-lg border border-border/30"><CheckCircle className="w-4 h-4 text-sky"/> Complete Daily Tracker (+5 per day)</li>
                            <li className="flex items-center gap-2 bg-navy-light/20 p-2 rounded-lg border border-border/30"><CheckCircle className="w-4 h-4 text-orange-400"/> Maintain Daily Streak</li>
                        </ul>
                    </div>
                    
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-navy-light/40 hover:bg-navy-light/60 text-white font-medium transition-colors">
                            Close
                        </button>
                        <button onClick={() => { onClose(); navigate('/dashboard'); }} className="flex-1 py-3.5 rounded-xl bg-sky/20 hover:bg-sky/30 text-sky border border-sky/30 font-bold transition-colors">
                            Earn More Coins
                        </button>
                    </div>
                </div>
            </ModalContent>
        </ModalBackdrop>
    );
};

export const OwnedModal = ({ isOpen, onClose, product }) => {
    const navigate = useNavigate();
    if (!isOpen || !product) return null;
    
    return (
        <ModalBackdrop onClose={onClose}>
            <ModalContent>
                <CloseButton onClick={onClose} />
                <div className="flex flex-col items-center text-center mt-6 mb-2">
                    <div className="w-20 h-20 bg-sky/10 text-sky rounded-full flex items-center justify-center mb-6 border border-sky/20 shadow-[0_0_20px_rgba(14,165,233,0.15)]">
                        <ShoppingBag className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">Already Purchased</h3>
                    <p className="text-ice/70 mb-8 leading-relaxed">
                        You already own the <span className="font-bold text-white">{product.title}</span>. It is active on your profile!
                    </p>
                    
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-navy-light/40 hover:bg-navy-light/60 text-white font-medium transition-colors">
                            Close
                        </button>
                        <button onClick={() => { onClose(); navigate('/profile'); }} className="flex-1 py-3.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary font-bold transition-colors">
                            View Profile
                        </button>
                    </div>
                </div>
            </ModalContent>
        </ModalBackdrop>
    );
};

export const VerificationModal = ({ isOpen, onClose, user }) => {
    const navigate = useNavigate();
    if (!isOpen || !user) return null;
    
    const reqs = [
        { label: "Profile Completed", met: user.onboardingComplete },
        { label: "GitHub Connected", met: !!user.githubUsername },
        { label: "Codeforces Connected", met: !!user.codeforcesUsername },
        { label: "Minimum 50 Solved Problems", met: (user.totalSolved || 0) >= 50 }
    ];
    
    return (
        <ModalBackdrop onClose={onClose}>
            <ModalContent>
                <CloseButton onClick={onClose} />
                <div className="flex flex-col items-center mt-2 text-center">
                    <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                        <ShieldAlert className="w-8 h-8" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">Requirements Not Met</h3>
                    <p className="text-ice/70 text-sm mb-6 px-4">
                        You must satisfy the following eligibility requirements before purchasing a Verification Badge.
                    </p>
                    
                    <div className="w-full bg-navy-light/30 rounded-2xl p-4 mb-6 border border-border/50 text-left space-y-3">
                        {reqs.map((req, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${req.met ? 'bg-green-500/20 text-green-400' : 'bg-surface border border-border text-ice/30'}`}>
                                    {req.met ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                                </div>
                                <span className={req.met ? 'text-white' : 'text-ice/60'}>{req.label}</span>
                            </div>
                        ))}
                    </div>
                    
                    <div className="flex gap-3 w-full">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-navy-light/40 hover:bg-navy-light/60 text-white font-medium transition-colors">
                            Close
                        </button>
                        <button onClick={() => { onClose(); navigate('/profile'); }} className="flex-1 py-3.5 rounded-xl bg-sky/20 hover:bg-sky/30 text-sky border border-sky/30 font-bold transition-colors">
                            Complete Profile
                        </button>
                    </div>
                </div>
            </ModalContent>
        </ModalBackdrop>
    );
};

export const ComingSoonModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    
    return (
        <ModalBackdrop onClose={onClose}>
            <ModalContent>
                <CloseButton onClick={onClose} />
                <div className="flex flex-col items-center text-center mt-6 mb-2">
                    <div className="w-20 h-20 bg-purple-500/10 text-purple-400 rounded-2xl rotate-3 flex items-center justify-center mb-6 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                        <Lock className="w-10 h-10 -rotate-3" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-3">🚀 Coming Soon</h3>
                    <p className="text-ice/70 mb-8 leading-relaxed">
                        This exclusive item is currently under development and will be available in a future update. Stay tuned!
                    </p>
                    
                    <button onClick={onClose} className="w-full py-4 rounded-xl bg-navy-light/40 hover:bg-navy-light/60 text-white font-bold transition-colors">
                        Got it, thanks!
                    </button>
                </div>
            </ModalContent>
        </ModalBackdrop>
    );
};
