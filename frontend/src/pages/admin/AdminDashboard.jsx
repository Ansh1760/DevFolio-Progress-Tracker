import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminApi';
import { LogOut, Users, Link as LinkIcon, DollarSign, Activity, Search, ShieldAlert, X, Trash2, ArrowRight, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    
    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
    const [adminPassword, setAdminPassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    
    // Notification Modal State
    const [notifModal, setNotifModal] = useState(false);
    const [notifData, setNotifData] = useState({ title: '', message: '', type: 'info' });
    const [notifLoading, setNotifLoading] = useState(false);
    const [notifError, setNotifError] = useState('');
    
    const navigate = useNavigate();

    const fetchAdminData = async () => {
        try {
            const [statsRes, usersRes] = await Promise.all([
                adminService.getStats(),
                adminService.getUsers()
            ]);
            if (statsRes.data.success) setStats(statsRes.data.data);
            if (usersRes.data.success) setUsers(usersRes.data.data);
        } catch (error) {
            console.error('Error fetching admin data', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                handleLogout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin');
            return;
        }
        fetchAdminData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin');
    };

    const handleDeleteUser = async (e) => {
        e.preventDefault();
        setDeleteLoading(true);
        setDeleteError('');
        try {
            const res = await adminService.deleteUser(deleteModal.user._id, adminPassword);
            if (res.data.success) {
                setUsers(users.filter(u => u._id !== deleteModal.user._id));
                setDeleteModal({ isOpen: false, user: null });
                setAdminPassword('');
                fetchAdminData(); // Refresh stats
            }
        } catch (error) {
            setDeleteError(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleSendNotification = async (e) => {
        e.preventDefault();
        setNotifLoading(true);
        setNotifError('');
        try {
            const res = await adminService.pushNotification(notifData);
            if (res.data.success) {
                setNotifModal(false);
                setNotifData({ title: '', message: '', type: 'info' });
                // We could show a toast here, but simple alert or auto-close is fine
            }
        } catch (error) {
            setNotifError(error.response?.data?.message || 'Failed to send notification');
        } finally {
            setNotifLoading(false);
        }
    };

    // Filter & Search Logic
    const filteredUsers = users.filter(user => {
        // Search
        const searchStr = search.toLowerCase();
        const matchesSearch = 
            (user.fullName?.toLowerCase() || '').includes(searchStr) ||
            (user.email?.toLowerCase() || '').includes(searchStr) ||
            (user.collegeName?.toLowerCase() || '').includes(searchStr) ||
            (user.leetcodeUsername?.toLowerCase() || '').includes(searchStr) ||
            (user.gfgUsername?.toLowerCase() || '').includes(searchStr) ||
            (user.codeforcesUsername?.toLowerCase() || '').includes(searchStr) ||
            (user.githubUsername?.toLowerCase() || '').includes(searchStr);
            
        if (!matchesSearch) return false;

        // Filter
        switch (filter) {
            case 'linkedin': return !!user.linkedin?.profileUrl;
            case 'github': return !!user.githubUsername;
            case 'codeforces': return !!user.codeforcesUsername;
            default: return true;
        }
    }).sort((a, b) => {
        if (filter === 'coins') return (b.coins || 0) - (a.coins || 0);
        if (filter === 'streak') return (b.streak || 0) - (a.streak || 0);
        if (filter === 'solved') return (b.totalSolved || 0) - (a.totalSolved || 0);
        return 0; // Default: 'all' is already sorted by createdAt -1 from backend
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-red-500 flex flex-col items-center gap-3">
                    <ShieldAlert className="w-8 h-8 animate-pulse" />
                    <span className="font-medium tracking-widest text-sm uppercase">Loading Secure Console...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-ice font-sans selection:bg-red-500/30 overflow-x-hidden relative">
            {/* Premium Background Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none fixed z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-red-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[50vw] h-[20vw] bg-sky-600/5 rounded-full blur-[150px] mix-blend-screen"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Floating Topbar */}
                <div className="pt-6 px-6">
                    <div className="max-w-[1600px] mx-auto bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl h-16 flex items-center justify-between px-6 shadow-2xl shadow-black/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/20">
                                <ShieldAlert className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="font-bold text-lg text-white tracking-wide">
                                DevFolio <span className="text-red-500 font-black">Admin</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => setNotifModal(true)}
                                className="flex items-center gap-2 text-sm text-white font-bold bg-sky-500 hover:bg-sky-600 transition-all px-4 py-2 rounded-xl shadow-lg shadow-sky-500/20"
                            >
                                <Send className="w-4 h-4" />
                                <span className="hidden sm:inline">Push Notification</span>
                            </button>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm text-ice/70 hover:text-white transition-all px-4 py-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout Session</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1600px] mx-auto px-6 py-8 w-full flex-1">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                        <StatCard icon={<Users className="w-5 h-5" />} label="Total Users" value={stats?.totalUsers || 0} subValue={`${stats?.newUsersToday || 0} new today`} color="text-sky-400" bg="bg-sky-400/10" border="border-sky-400/20" glow="shadow-sky-400/20" />
                        <StatCard icon={<Activity className="w-5 h-5" />} label="Active (7d)" value={stats?.activeUsers || 0} color="text-green-400" bg="bg-green-400/10" border="border-green-400/20" glow="shadow-green-400/20" />
                        <StatCard icon={<DollarSign className="w-5 h-5" />} label="Total Coins" value={(stats?.totalCoins || 0).toLocaleString()} color="text-yellow-400" bg="bg-yellow-400/10" border="border-yellow-400/20" glow="shadow-yellow-400/20" />
                        <StatCard icon={<LinkIcon className="w-5 h-5" />} label="Synced Profiles" value={stats?.totalProfilesSynced || 0} color="text-purple-400" bg="bg-purple-400/10" border="border-purple-400/20" glow="shadow-purple-400/20" />
                        
                        <div className="col-span-2 md:col-span-1 bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/5 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10">
                                <div className="text-[10px] text-ice/40 font-bold uppercase tracking-[0.2em] mb-3">Integrations</div>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                                    <IntegrationStat label="LinkedIn" value={stats?.linkedinConnected} />
                                    <IntegrationStat label="GitHub" value={stats?.githubConnected} />
                                    <IntegrationStat label="LeetCode" value={stats?.leetcodeConnected} />
                                    <IntegrationStat label="Codeforces" value={stats?.codeforcesConnected} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Users Section */}
                    <div className="bg-white/[0.02] backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                        {/* Toolbar */}
                        <div className="p-5 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="relative w-full lg:w-96">
                                <Search className="w-5 h-5 text-ice/40 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input 
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, email, or username..."
                                    className="w-full bg-black/20 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-red-500/50 focus:bg-black/40 transition-all placeholder:text-ice/30 shadow-inner"
                                />
                            </div>
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide snap-x">
                                <FilterBtn current={filter} value="all" label="All Users" onClick={setFilter} />
                                <FilterBtn current={filter} value="coins" label="Highest Coins" onClick={setFilter} />
                                <FilterBtn current={filter} value="solved" label="Most Solved" onClick={setFilter} />
                                <FilterBtn current={filter} value="linkedin" label="Has LinkedIn" onClick={setFilter} />
                                <FilterBtn current={filter} value="codeforces" label="Has Codeforces" onClick={setFilter} />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1200px]">
                                <thead>
                                    <tr className="bg-black/20 border-b border-white/5">
                                        <th className="p-5 font-bold text-[10px] text-ice/40 uppercase tracking-[0.2em]">User Profile</th>
                                        <th className="p-5 font-bold text-[10px] text-ice/40 uppercase tracking-[0.2em]">Education</th>
                                        <th className="p-5 font-bold text-[10px] text-ice/40 uppercase tracking-[0.2em]">Statistics</th>
                                        <th className="p-5 font-bold text-[10px] text-ice/40 uppercase tracking-[0.2em]">Connected Accounts</th>
                                        <th className="p-5 font-bold text-[10px] text-ice/40 uppercase tracking-[0.2em]">Professional</th>
                                        <th className="p-5 font-bold text-[10px] text-ice/40 uppercase tracking-[0.2em] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-all group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <img 
                                                            src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`} 
                                                            alt="avatar" 
                                                            className="w-12 h-12 rounded-xl border border-white/10 object-cover shadow-lg"
                                                        />
                                                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background ${user.streak > 0 ? 'bg-green-500' : 'bg-ice/20'}`}></div>
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-semibold text-sm group-hover:text-red-400 transition-colors">{user.fullName || 'No Name'}</div>
                                                        <div className="text-ice/50 text-xs mt-0.5">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="text-sm font-medium text-white/90">{user.collegeName || '-'}</div>
                                                <div className="text-xs text-ice/40 mt-1 uppercase tracking-wider">{user.branch ? `${user.branch} • ` : ''}{user.graduationYear || ''}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex gap-4">
                                                    <Metric label="Coins" value={user.coins} color="text-yellow-400" />
                                                    <Metric label="Solved" value={user.totalSolved} color="text-sky-400" />
                                                    <Metric label="Streak" value={user.streak} color="text-orange-400" subValue={`(${user.longestStreak || 0})`} />
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex flex-wrap gap-2 max-w-[200px]">
                                                    <PlatformTag name="LC" value={user.leetcodeUsername} />
                                                    <PlatformTag name="GFG" value={user.gfgUsername} />
                                                    <PlatformTag name="CF" value={user.codeforcesUsername} />
                                                    <PlatformTag name="GH" value={user.githubUsername} />
                                                    {!user.leetcodeUsername && !user.gfgUsername && !user.codeforcesUsername && !user.githubUsername && (
                                                        <span className="text-xs text-ice/30 italic">No integrations</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                {user.linkedin?.profileUrl ? (
                                                    <a 
                                                        href={user.linkedin.profileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-white bg-sky-400/10 hover:bg-sky-400/20 px-3.5 py-2 rounded-xl transition-all border border-sky-400/20 hover:border-sky-400/40"
                                                    >
                                                        View Profile <ArrowRight className="w-3.5 h-3.5" />
                                                    </a>
                                                ) : (
                                                    <span className="text-xs font-medium text-ice/30 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Not Connected</span>
                                                )}
                                            </td>
                                            <td className="p-5 text-right">
                                                <button 
                                                    onClick={() => setDeleteModal({ isOpen: true, user })}
                                                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-ice/30 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 border border-transparent hover:border-red-500/20"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredUsers.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="p-16 text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 mb-4">
                                                    <Search className="w-8 h-8 text-ice/20" />
                                                </div>
                                                <div className="text-ice/60 font-medium">No users found matching current filters.</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <AnimatePresence>
                {deleteModal.isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0a0c10]/80 backdrop-blur-md"
                            onClick={() => setDeleteModal({ isOpen: false, user: null })}
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-[#0d1117] border border-red-500/30 rounded-3xl shadow-[0_0_100px_-20px_rgba(239,68,68,0.3)] overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 to-orange-500"></div>
                            
                            <div className="p-8">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-red-500/20 shadow-inner">
                                        <ShieldAlert className="w-7 h-7 text-red-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-wide">Confirm Deletion</h3>
                                        <p className="text-sm text-red-400 font-medium">This action cannot be undone.</p>
                                    </div>
                                </div>

                                <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl mb-6">
                                    <p className="text-sm text-ice/80 leading-relaxed">
                                        You are about to permanently wipe <strong className="text-white">{deleteModal.user?.fullName}</strong>. This removes their profile, wallet transactions, and tracker records.
                                    </p>
                                </div>

                                <form onSubmit={handleDeleteUser}>
                                    {deleteError && (
                                        <div className="mb-5 text-sm font-medium text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-center gap-3">
                                            <X className="w-4 h-4 shrink-0" />
                                            {deleteError}
                                        </div>
                                    )}

                                    <div className="mb-8">
                                        <label className="block text-[10px] font-bold text-ice/50 mb-2 uppercase tracking-[0.2em]">Master Password Required</label>
                                        <input 
                                            type="password"
                                            value={adminPassword}
                                            onChange={(e) => setAdminPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-red-500 focus:bg-black/60 transition-all placeholder:text-ice/20 shadow-inner"
                                            placeholder="••••••••••••"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setDeleteModal({ isOpen: false, user: null })}
                                            className="flex-1 px-5 py-3.5 rounded-xl text-sm font-bold text-ice hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={deleteLoading}
                                            className="flex-1 px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all shadow-lg shadow-red-600/30 disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            {deleteLoading ? <span className="animate-pulse">Wiping Data...</span> : (
                                                <>Delete Permanently</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Notification Modal */}
            <AnimatePresence>
                {notifModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0a0c10]/80 backdrop-blur-md"
                            onClick={() => setNotifModal(false)}
                        />
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-[#0d1117] border border-sky-500/30 rounded-3xl shadow-[0_0_100px_-20px_rgba(14,165,233,0.3)] overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 to-blue-600"></div>
                            
                            <div className="p-8">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-sky-500/20 shadow-inner">
                                        <Send className="w-7 h-7 text-sky-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-wide">Broadcast</h3>
                                        <p className="text-sm text-sky-400 font-medium">Send notification to all users</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSendNotification}>
                                    {notifError && (
                                        <div className="mb-5 text-sm font-medium text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-center gap-3">
                                            <X className="w-4 h-4 shrink-0" />
                                            {notifError}
                                        </div>
                                    )}

                                    <div className="space-y-4 mb-8">
                                        <div>
                                            <label className="block text-[10px] font-bold text-ice/50 mb-2 uppercase tracking-[0.2em]">Title</label>
                                            <input 
                                                type="text"
                                                value={notifData.title}
                                                onChange={(e) => setNotifData({...notifData, title: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-sky-500 focus:bg-black/60 transition-all placeholder:text-ice/20 shadow-inner"
                                                placeholder="e.g., System Update"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-ice/50 mb-2 uppercase tracking-[0.2em]">Message</label>
                                            <textarea 
                                                value={notifData.message}
                                                onChange={(e) => setNotifData({...notifData, message: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-sky-500 focus:bg-black/60 transition-all placeholder:text-ice/20 shadow-inner min-h-[100px] resize-none"
                                                placeholder="Notification message here..."
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-ice/50 mb-2 uppercase tracking-[0.2em]">Type</label>
                                            <select 
                                                value={notifData.type}
                                                onChange={(e) => setNotifData({...notifData, type: e.target.value})}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-sky-500 focus:bg-black/60 transition-all shadow-inner appearance-none"
                                            >
                                                <option value="info">Info (Blue)</option>
                                                <option value="success">Success (Green)</option>
                                                <option value="warning">Warning (Yellow)</option>
                                                <option value="error">Alert (Red)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setNotifModal(false)}
                                            className="flex-1 px-5 py-3.5 rounded-xl text-sm font-bold text-ice hover:text-white bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={notifLoading}
                                            className="flex-1 px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400 transition-all shadow-lg shadow-sky-600/30 disabled:opacity-50 flex justify-center items-center gap-2"
                                        >
                                            {notifLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                                <>Broadcast</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ icon, label, value, subValue, color, bg, border, glow }) => (
    <div className={`bg-white/[0.02] backdrop-blur-xl rounded-2xl p-5 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all ${glow} hover:shadow-2xl`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${bg} ${border} border flex items-center justify-center ${color} shadow-inner`}>
                    {icon}
                </div>
            </div>
            <div>
                <div className="text-[10px] text-ice/40 font-bold uppercase tracking-[0.2em] mb-1">{label}</div>
                <div className="text-3xl font-black text-white leading-none tracking-tight">{value}</div>
                {subValue && <div className={`text-xs mt-2 font-semibold ${color}`}>{subValue}</div>}
            </div>
        </div>
    </div>
);

const IntegrationStat = ({ label, value }) => (
    <div className="flex justify-between items-center bg-black/20 rounded-lg px-3 py-2 border border-white/5">
        <span className="text-ice/60">{label}</span> 
        <span className="text-white font-bold">{value || 0}</span>
    </div>
);

const Metric = ({ label, value, color, subValue }) => (
    <div className="flex flex-col">
        <span className="text-[10px] text-ice/40 uppercase tracking-widest font-semibold mb-0.5">{label}</span>
        <span className={`font-bold text-sm ${color}`}>
            {value || 0} {subValue && <span className="text-ice/40 ml-0.5 text-xs font-medium">{subValue}</span>}
        </span>
    </div>
);

const FilterBtn = ({ current, value, label, onClick }) => (
    <button 
        onClick={() => onClick(value)}
        className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border snap-center ${
            current === value 
            ? 'bg-white text-black border-transparent shadow-lg shadow-white/10 scale-105' 
            : 'bg-white/5 text-ice/60 border-white/5 hover:bg-white/10 hover:text-white'
        }`}
    >
        {label}
    </button>
);

const PlatformTag = ({ name, value }) => {
    if (!value) return null;
    return (
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
            <span className="text-[10px] font-bold text-ice/40 uppercase">{name}</span>
            <span className="text-xs font-medium text-white truncate max-w-[80px]">{value}</span>
        </div>
    );
};

export default AdminDashboard;
