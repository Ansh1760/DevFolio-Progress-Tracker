import { motion } from 'framer-motion';
import { Target, Trophy, Flame, Coins } from 'lucide-react';

const StatsOverview = ({ stats }) => {
    const cards = [
        {
            title: "Total Solved",
            value: stats?.totalSolved !== undefined ? stats.totalSolved : '—',
            subtitle: stats?.rankNumber ? `Rank #${stats.rankNumber} overall` : 'Sync to update rank',
            icon: Target,
            color: "text-sky",
            bg: "bg-sky/10",
            border: "border-sky/20"
        },
        {
            title: "Current Rank",
            value: stats?.rank || '—',
            subtitle: stats?.rank ? `Top performer tier` : 'Complete profile to rank',
            icon: Trophy,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
            border: "border-yellow-400/20"
        },
        {
            title: "Current Streak",
            value: stats?.streak !== undefined ? `${stats.streak} Days` : '—',
            subtitle: stats?.longestStreak !== undefined ? `Best: ${stats.longestStreak} Days` : 'No streak yet',
            icon: Flame,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
        },
        {
            title: "DevCoins",
            value: stats?.coins !== undefined ? stats.coins : '—',
            subtitle: 'Earned from activity',
            icon: Coins,
            color: "text-yellow-300",
            bg: "bg-yellow-300/10",
            border: "border-yellow-300/20"
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`card border ${card.border} hover:-translate-y-0.5 hover:shadow-lg transition-all cursor-pointer group p-4 sm:p-6`}
                    >
                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                            <div>
                                <p className="text-label mb-0.5 sm:mb-1">{card.title}</p>
                                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{card.value}</h3>
                            </div>
                            <div className={`p-2 sm:p-3 rounded-xl ${card.bg} ${card.color} border border-transparent group-hover:border-current group-hover:scale-110 transition-all shadow-sm`}>
                                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                        <p className="text-caption text-xs">{card.subtitle}</p>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default StatsOverview;
