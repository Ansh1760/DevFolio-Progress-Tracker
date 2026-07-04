import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Search, Loader2, Code2, GraduationCap, Flame, Trophy } from 'lucide-react';
import { userAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

import ProfileBadge from '../components/common/ProfileBadge';

const UserCard = ({ user, onClick }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onClick(user.id)}
        className="glass border border-border hover:border-sky/40 rounded-2xl p-5 flex items-center gap-5 cursor-pointer group transition-all hover:bg-navy-light/30"
    >
        <img
            src={user.avatar}
            alt={user.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-border group-hover:border-sky/50 transition-colors flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base truncate group-hover:text-sky transition-colors flex items-center gap-2">
                {user.name}
                <ProfileBadge badgeType={user.profileBadge} className="w-4 h-4" />
            </h3>
            <div className="flex items-center gap-2 text-ice/60 text-sm mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{user.college || 'Unknown College'}</span>
                {user.branch && <span className="text-ice/30">·</span>}
                {user.branch && <span className="truncate">{user.branch}</span>}
            </div>
        </div>
        <div className="flex items-center gap-5 text-sm flex-shrink-0">
            {user.leetcodeUsername && (
                <div className="flex items-center gap-1.5 text-orange-400">
                    <Code2 className="w-4 h-4" />
                    <span className="font-medium">{user.totalSolved || 0}</span>
                    <span className="text-ice/40 text-xs hidden sm:block">solved</span>
                </div>
            )}
            <div className="flex items-center gap-1.5 text-orange-500">
                <Flame className="w-4 h-4" />
                <span className="font-medium">{user.streak}</span>
            </div>
            <div className="text-sky font-bold group-hover:translate-x-1 transition-transform">→</div>
        </div>
    </motion.div>
);

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const debounceRef = useRef(null);

    const performSearch = useCallback(async (q) => {
        if (q.trim().length < 2) {
            setResults([]);
            setSearched(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await userAPI.searchUsers(q.trim());
            if (res.data.success) {
                setResults(res.data.data);
                setSearched(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Search failed. Try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const q = searchParams.get('q');
        if (q && q !== query) {
            setQuery(q);
            performSearch(q);
        }
    }, [location.search, performSearch]);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(val), 400);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            clearTimeout(debounceRef.current);
            performSearch(query);
        }
    };

    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Search className="w-6 h-6 text-sky" /> Search Users
                </h2>
                <p className="text-ice/70">Find other coders by name, college, or platform username.</p>
            </div>

            {/* Search Input */}
            <div className="relative mb-8">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    {loading ? (
                        <Loader2 className="w-5 h-5 text-sky animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-ice/40" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by name, college, LeetCode username, GitHub username..."
                    className="w-full bg-navy-light/30 border border-border/60 focus:border-sky/50 rounded-2xl pl-12 pr-6 py-4 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/20 transition-all text-sm"
                    autoFocus
                />
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                    {error}
                </div>
            )}

            {/* Results */}
            <AnimatePresence mode="wait">
                {!searched && !loading && (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-ice/30"
                    >
                        <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Type at least 2 characters to search</p>
                    </motion.div>
                )}

                {searched && results.length === 0 && !loading && (
                    <motion.div
                        key="no-results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-ice/30"
                    >
                        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No users found for "{query}"</p>
                        <p className="text-sm mt-2">Try a different name or username</p>
                    </motion.div>
                )}

                {results.length > 0 && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3"
                    >
                        <p className="text-ice/50 text-sm mb-4">{results.length} user{results.length !== 1 ? 's' : ''} found</p>
                        {results.map((user, i) => (
                            <UserCard
                                key={user.id}
                                user={user}
                                onClick={(id) => navigate(`/profile/${id}`)}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default SearchPage;
