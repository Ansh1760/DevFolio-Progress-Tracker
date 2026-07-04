import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, Trophy, Target, User, LogOut, X, Search } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const { logout } = useContext(AuthContext);

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Wallet & Rewards', path: '/wallet', icon: Wallet },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
        { name: 'Daily Tracker', path: '/tracker', icon: Target },
        { name: 'Search Users', path: '/search', icon: Search },
        { name: 'Public Profile', path: '/profile', icon: User },
    ];

    return (
        <aside className={`w-72 fixed top-0 left-0 h-screen bg-background border-r border-border flex flex-col pt-8 pb-8 px-6 z-40 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="flex items-center justify-between mb-10 px-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 border border-primary/40 rounded-xl flex items-center justify-center shadow-[0_0_20px_var(--color-primary-glow)]">
                        <span className="text-primary font-bold text-xl">D</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-wide">DevFolio</h1>
                </div>
                <button className="md:hidden text-text-muted hover:text-foreground" onClick={() => setIsOpen(false)}>
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 space-y-2.5">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                        <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="block relative">
                            {isActive && (
                                <motion.div 
                                    layoutId="sidebar-active"
                                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary rounded-r-xl"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={`flex items-center gap-4 px-4 py-3.5 rounded-xl relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-text-muted hover:text-foreground hover:bg-surface/50'}`}>
                                <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                                <span className="font-semibold text-sm">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-border">
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-4 px-4 py-3.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors group"
                >
                    <LogOut className="w-5 h-5 group-hover:text-red-500 transition-colors" />
                    <span className="font-semibold text-sm">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
