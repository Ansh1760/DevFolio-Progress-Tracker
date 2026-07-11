import DashboardLayout from '../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, History, Gift, Coins } from 'lucide-react';
import { useContext, useEffect, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { walletAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
    const navigate = useNavigate();
    const { user, updateUser, setRewardEvent } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [balanceStats, setBalanceStats] = useState({ earnedToday: 0, earnedThisWeek: 0 });
    const [loading, setLoading] = useState(true);

    const fetchWalletData = useCallback(async () => {
        setLoading(true);
        try {
            const [txRes, balRes] = await Promise.all([
                walletAPI.getHistory(),
                walletAPI.getBalance()
            ]);
            
            if (txRes.data.success) {
                setTransactions(txRes.data.data);
            }
            if (balRes.data.success) {
                setBalanceStats({
                    earnedToday: balRes.data.data.earnedToday,
                    earnedThisWeek: balRes.data.data.earnedThisWeek
                });
                updateUser({ coins: balRes.data.data.totalCoins });
            }
        } catch (error) {
            console.error("Error fetching wallet data:", error);
        } finally {
            setLoading(false);
        }
    }, [updateUser]);

    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);

    const handleDailyLoginReward = async () => {
        try {
            const res = await walletAPI.dailyLogin();
            if (res.data.success) {
                if (res.data.alreadyClaimed) {
                    alert("You have already claimed your daily reward today.");
                } else {
                    updateUser({ coins: res.data.totalCoins, streak: res.data.streak });
                    setRewardEvent({ amount: res.data.reward, reason: 'Daily Login' });
                    fetchWalletData(); // Refresh history
                }
            }
        } catch (error) {
            alert(error.response?.data?.message || "Error claiming reward");
        }
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Wallet & Rewards 💳</h2>
                <p className="text-ice/70 text-sm">Manage your DevFolio coins and redeem exciting rewards.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Total Balance Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-3xl p-5 sm:p-8 border border-yellow-400/20 bg-gradient-to-br from-navy-dark via-navy-light to-navy-dark relative overflow-hidden shadow-2xl shadow-yellow-400/5 lg:col-span-2"
                >
                    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[150%] bg-yellow-400/5 blur-[80px] rounded-full rotate-45 pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-8 sm:mb-12">
                        <div>
                            <p className="text-ice/70 text-xs sm:text-sm font-medium mb-1 sm:mb-2 uppercase tracking-wider">Total Balance</p>
                            <h3 className="text-3xl sm:text-5xl font-bold text-white flex items-center gap-2 sm:gap-3">
                                <span className="text-yellow-400">🪙</span>
                                {user?.coins || 0}
                            </h3>
                        </div>
                        <div className="bg-yellow-400/10 text-yellow-400 p-2.5 sm:p-3 rounded-2xl cursor-pointer hover:bg-yellow-400/20 transition-colors" onClick={handleDailyLoginReward} title="Claim Daily Reward">
                            <Coins className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div className="bg-navy-dark/50 rounded-xl p-3 sm:p-4 border border-border/50">
                            <p className="text-ice/50 text-xs mb-1">Earned Today</p>
                            <p className="text-green-400 font-bold text-base sm:text-lg flex items-center gap-1">
                                +{balanceStats.earnedToday} <ArrowUpRight className="w-4 h-4" />
                            </p>
                        </div>
                        <div className="bg-navy-dark/50 rounded-xl p-3 sm:p-4 border border-border/50">
                            <p className="text-ice/50 text-xs mb-1">Earned This Week</p>
                            <p className="text-green-400 font-bold text-base sm:text-lg flex items-center gap-1">
                                +{balanceStats.earnedThisWeek} <ArrowUpRight className="w-4 h-4" />
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Redeem Action */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-3xl p-8 border border-primary/20 flex flex-col justify-center items-center text-center group cursor-pointer hover:bg-navy-light/40 transition-colors"
                >
                    <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Gift className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Redeem Rewards</h4>
                    <p className="text-sm text-ice/70 mb-6">Exchange your coins for verification badges and exclusive swags!</p>
                    
                    <button 
                        onClick={() => navigate('/store')}
                        className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 px-6 py-3 rounded-xl w-full font-bold transition-colors flex items-center justify-center gap-2 group"
                    >
                        Browse Store <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </motion.div>
            </div>

            {/* Transaction History */}
            <div className="glass rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border/50 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <History className="w-5 h-5 text-sky" />
                        Transaction History
                    </h3>
                </div>
                
                <div className="divide-y divide-border/50">
                    {loading ? (
                        <div className="p-6 text-center text-ice/60">Loading transactions...</div>
                    ) : transactions.length === 0 ? (
                        <div className="p-6 text-center text-ice/60">No transactions found.</div>
                    ) : transactions.map((tx) => (
                        <div key={tx._id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-navy-light/30 transition-colors gap-3">
                            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${tx.type === 'earned' ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                                    {tx.type === 'earned' ? <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-white font-medium text-sm sm:text-base truncate">{tx.reason}</p>
                                    <p className="text-xs text-ice/50 truncate">{new Date(tx.date).toLocaleString()} • {tx.platform}</p>
                                </div>
                            </div>
                            <div className={`font-bold text-sm sm:text-base flex-shrink-0 ${tx.type === 'earned' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'earned' ? '+' : '-'}{tx.amount} 🪙
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Wallet;
