import DashboardLayout from '../components/layout/DashboardLayout';
import { Trophy, Medal, Flame, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ProfileBadge from '../components/common/ProfileBadge';

const Leaderboard = () => {
    const { user: currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'college'

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const res = await userAPI.getLeaderboard(filter);
                if (res.data.success) {
                    setUsers(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [filter]);

    const getRankIcon = (rank) => {
        switch(rank) {
            case 1: return <Medal className="w-6 h-6 text-yellow-400" />;
            case 2: return <Medal className="w-6 h-6 text-gray-300" />;
            case 3: return <Medal className="w-6 h-6 text-orange-400" />;
            default: return <span className="font-bold text-ice/60 w-6 text-center">{rank}</span>;
        }
    };

    const currentUserRank = users.find(u => u.id === currentUser?._id);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 flex items-center gap-2">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" /> Global Leaderboard
                </h2>
                <p className="text-ice/70 text-sm">See how you stack up against coders worldwide.</p>
            </div>

            <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-1">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors border text-sm whitespace-nowrap flex-shrink-0 ${filter === 'all' ? 'bg-primary text-white border-transparent' : 'bg-navy-light/40 text-ice/70 hover:text-white border-border/50 hover:bg-navy-light/80'}`}
                >
                    All Time
                </button>
                <button 
                    onClick={() => setFilter('college')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors border text-sm whitespace-nowrap flex-shrink-0 ${filter === 'college' ? 'bg-primary text-white border-transparent' : 'bg-navy-light/40 text-ice/70 hover:text-white border-border/50 hover:bg-navy-light/80'}`}
                >
                    My College
                </button>
            </div>

            <div className="glass rounded-2xl border border-border overflow-hidden shadow-2xl">
                <div className="overflow-x-auto -mx-0">
                    <table className="w-full text-left border-collapse min-w-[320px]">
                        <thead>
                            <tr className="bg-navy-dark/80 text-ice/60 text-xs sm:text-sm uppercase tracking-wider">
                                <th className="p-3 sm:p-4 font-medium border-b border-border/50 w-12 sm:w-16 text-center">#</th>
                                <th className="p-3 sm:p-4 font-medium border-b border-border/50">Coder</th>
                                <th className="p-3 sm:p-4 font-medium border-b border-border/50 hidden lg:table-cell">College</th>
                                <th className="p-3 sm:p-4 font-medium border-b border-border/50 text-right">Solved</th>
                                <th className="p-3 sm:p-4 font-medium border-b border-border/50 text-right hidden md:table-cell">Stars</th>
                                <th className="p-3 sm:p-4 font-medium border-b border-border/50 text-right hidden md:table-cell">Streak</th>
                                <th className="p-3 sm:p-4 font-medium border-b border-border/50 text-right">Coins</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-ice/60">Loading leaderboard...</td>
                                </tr>
                            ) : users.map((user, index) => (
                                <motion.tr 
                                    key={user.rank}
                                    onClick={() => navigate(`/profile/${user.id}`)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`cursor-pointer hover:bg-navy-light/30 transition-colors group ${currentUser?._id === user.id ? 'bg-primary/5' : ''}`}
                                >
                                    <td className="p-3 sm:p-4 text-center border-border/50">
                                        <div className="flex justify-center">
                                            {getRankIcon(user.rank)}
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 border-border/50">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 flex-shrink-0 ${user.rank === 1 ? 'border-yellow-400' : 'border-transparent group-hover:border-primary/50'} transition-colors`}>
                                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex items-center gap-1 font-bold text-white group-hover:text-sky transition-colors">
                                                {user.name} 
                                                <ProfileBadge badgeType={user.profileBadge} className="w-4 h-4 ml-1" />
                                                {currentUser?._id === user.id && <span className="ml-1 text-ice/60">(You)</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 border-border/50 text-ice/80 text-sm hidden lg:table-cell">
                                        {user.college}
                                    </td>
                                    <td className="p-3 sm:p-4 border-border/50 text-right font-medium text-sky text-sm">
                                        {user.solved}
                                    </td>
                                    <td className="p-3 sm:p-4 border-border/50 text-right hidden md:table-cell">
                                        <div className="flex items-center justify-end gap-1 text-yellow-500 text-sm">
                                            <Star className="w-3.5 h-3.5 fill-yellow-500" /> {user.starsCount || 0}
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 border-border/50 text-right hidden md:table-cell">
                                        <div className="flex items-center justify-end gap-1 text-orange-400 text-sm">
                                            <Flame className="w-3.5 h-3.5" /> {user.streak}
                                        </div>
                                    </td>
                                    <td className="p-3 sm:p-4 border-border/50 text-right font-bold text-yellow-400 text-sm">
                                        <div className="flex items-center justify-end gap-1">{user.coins} 🪙</div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Current User Sticky Rank Bar */}
            {currentUserRank && (
                <div className="mt-4 glass rounded-xl border border-primary/40 bg-gradient-to-r from-navy-dark via-primary/10 to-navy-dark p-3 sm:p-4 flex items-center justify-between shadow-[0_0_15px_var(--color-primary-glow)] gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <div className="font-bold text-ice/60 w-5 sm:w-6 text-center text-sm flex-shrink-0">{currentUserRank.rank}</div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-primary flex-shrink-0">
                                <img src={currentUserRank.avatar} alt="You" className="w-full h-full object-cover" />
                            </div>
                            <span className="font-bold text-white text-sm">You</span>
                        </div>
                    </div>
                    <div className="flex gap-3 sm:gap-8 flex-shrink-0">
                        <div className="text-right font-medium text-sky hidden sm:block text-sm">
                            {currentUserRank.solved} Solved
                        </div>
                        <div className="text-right font-bold text-yellow-500 items-center gap-1 hidden sm:flex text-sm">
                            <Star className="w-3.5 h-3.5 fill-yellow-500" /> {currentUserRank.starsCount || 0}
                        </div>
                        <div className="text-right font-bold text-yellow-400 flex items-center gap-1 text-sm">
                            {currentUserRank.coins} 🪙
                        </div>
                    </div>
                </div>
            )}

        </DashboardLayout>
    );
};

export default Leaderboard;
