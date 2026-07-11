import DashboardLayout from '../components/layout/DashboardLayout';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import CodingStats from '../components/dashboard/CodingStats';
import { MapPin, Calendar, Trophy, Flame, RefreshCw, Award, Edit, Lock, Save, X, Star } from 'lucide-react';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { userAPI, authAPI, walletAPI } from '../services/api';
import { motion } from 'framer-motion';
import ProfileBadge from '../components/common/ProfileBadge';

const Profile = () => {
    const { user, setUser, updateUser, setRewardEvent } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    
    const [syncing, setSyncing] = useState(false);

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        profilePicture: user?.profilePicture || '',
        collegeName: user?.collegeName || '',
        branch: user?.branch || '',
        graduationYear: user?.graduationYear || '',
        bio: user?.bio || '',
        leetcodeUsername: user?.leetcodeUsername || '',
        gfgUsername: user?.gfgUsername || '',
        githubUsername: user?.githubUsername || '',
        codeforcesUsername: user?.codeforcesUsername || '',
        linkedin: {
            profileUrl: user?.linkedin?.profileUrl || ''
        }
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await userAPI.getDashboard();
                if (res.data.success) {
                    setDashboardData(res.data.data);
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            }
        };

        fetchDashboardData();
    }, []);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const res = await authAPI.updateProfile(formData);
            if (res.data.success) {
                setUser(res.data.data);
                setIsEditing(false);
                setMessage('Profile updated successfully!');
                
                // Refetch dashboard data so the new stats reflect immediately
                try {
                    const dashRes = await userAPI.getDashboard();
                    if (dashRes.data.success) {
                        setDashboardData(dashRes.data.data);
                    }
                } catch (err) {
                    console.error("Error refreshing dashboard stats:", err);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError("New passwords don't match");
            return;
        }
        
        try {
            const res = await authAPI.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (res.data.success) {
                setIsChangingPassword(false);
                setMessage('Password updated successfully!');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error changing password');
        }
    };

    const handleSyncStats = async () => {
        setSyncing(true);
        try {
            const res = await walletAPI.platformSync();
            if (res.data.success) {
                if (res.data.coinsEarned > 0) {
                    setRewardEvent({ amount: res.data.coinsEarned, reason: `Solved ${res.data.delta} problems` });
                    updateUser({ coins: res.data.totalCoins });
                } else {
                    setMessage('Stats synced successfully. No new problems solved.');
                    setTimeout(() => setMessage(''), 3000);
                }
                
                // Refresh dashboard data
                const dashRes = await userAPI.getDashboard();
                if (dashRes.data.success) setDashboardData(dashRes.data.data);
            }
        } catch (err) {
            setError('Sync failed. Please try again.');
        } finally {
            setSyncing(false);
        }
    };

    const badges = [
        { id: 1, name: 'First Blood', description: 'Solved your first problem', icon: '🩸', level: 'bronze', condition: dashboardData?.stats?.totalSolved >= 1 },
        { id: 2, name: '7 Day Streak', description: 'Maintained a 7-day coding streak', icon: '🔥', level: 'silver', condition: user?.streak >= 7 },
        { id: 3, name: '100 Coins', description: 'Earned 100 DevFolio Coins', icon: '🪙', level: 'gold', condition: user?.coins >= 100 },
    ].filter(b => b.condition);

    const getBadgeBorder = (level) => {
        switch(level) {
            case 'bronze': return 'border-orange-700/50 bg-orange-700/10 shadow-[0_0_15px_rgba(194,65,12,0.2)]';
            case 'silver': return 'border-gray-400/50 bg-gray-400/10 shadow-[0_0_15px_rgba(156,163,175,0.2)]';
            case 'gold': return 'border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]';
            case 'platinum': return 'border-sky/50 bg-sky/10 shadow-[0_0_15px_rgba(157,209,241,0.2)]';
            default: return 'border-border bg-navy-light/40';
        }
    };

    const handleGfgSync = (freshGfg) => {
        setDashboardData((prev) => prev ? { ...prev, gfg: freshGfg } : prev);
    };

    return (
        <DashboardLayout>
            {message && <div className="bg-green-500/20 border border-green-500 text-green-500 p-4 rounded-xl mb-4">{message}</div>}
            {error && <div className="bg-red-500/20 border border-red-500 text-red-500 p-4 rounded-xl mb-4">{error}</div>}

            {/* Header / Profile Info */}
            <div className="card-elevated mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center sm:items-start relative z-10">
                    <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl flex-shrink-0 bg-surface relative ${user?.profileBorder ? 'p-[4px]' : 'overflow-hidden border border-border shadow-md'}`}>
                        {user?.profileBorder && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl animate-pulse" />
                        )}
                        <img 
                            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=2B1D10&color=F8F5EF`} 
                            alt="Profile" 
                            className={`w-full h-full object-cover relative z-10 ${user?.profileBorder ? 'rounded-xl' : ''}`} 
                        />
                    </div>
                    
                    <div className="flex-1 w-full text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start mb-4 gap-3">
                            <div>
                                <h1 className="text-page-title flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                                    <span className={user?.usernameColor ? "font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tight drop-shadow-sm" : ""}>
                                        {user?.fullName || 'Anonymous Coder'}
                                    </span>
                                    <ProfileBadge badgeType={user?.profileBadge} className="w-7 h-7 sm:w-8 sm:h-8" />
                                    <span className="badge bg-primary/10 text-primary border-primary/30 shadow-sm">
                                        Rank: {dashboardData?.stats?.rank || 'Beginner'}
                                    </span>
                                </h1>
                                <p className="text-text-muted text-sm mt-1">@{user?.email?.split('@')[0] || 'username'}</p>
                            </div>
                            <div className="flex flex-col items-center sm:items-end gap-2">
                                <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                                    <button onClick={handleSyncStats} disabled={syncing} className="btn-secondary text-primary disabled:opacity-60 text-xs sm:text-sm px-3 py-1.5">
                                        <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${syncing ? 'animate-spin' : ''}`} /> {syncing ? 'Syncing...' : 'Sync'}
                                    </button>
                                    <button onClick={() => setIsEditing(true)} className="btn-secondary text-xs sm:text-sm px-3 py-1.5">
                                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Edit
                                    </button>
                                    <button onClick={() => setIsChangingPassword(true)} className="btn-secondary text-xs sm:text-sm px-3 py-1.5">
                                        <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Security
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                    <Star className="w-4 h-4 fill-yellow-500" />
                                    <span>{dashboardData?.stats?.starsCount || 0} {(dashboardData?.stats?.starsCount === 1) ? 'Star' : 'Stars'} Received</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-text-secondary justify-center sm:justify-start">
                            <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-text-muted"/> {user?.collegeName || 'Unknown College'}</div>
                            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-text-muted"/> Class of {user?.graduationYear || '2024'}</div>
                            {user?.linkedinUrl && (
                                <a href={user.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:text-primary-hover transition-colors font-medium">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    LinkedIn
                                </a>
                            )}
                            {user?.bio && <div className="w-full mt-2 text-text-muted italic">"{user.bio}"</div>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border relative z-10">
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-label mb-1">Global Rank</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-2"><Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500"/>#{dashboardData?.stats?.rankNumber || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-label mb-1">Total Solved</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground">{dashboardData?.stats?.totalSolved || 0}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-label mb-1">Streak</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-2"><Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500"/> {user?.streak || 0}</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-label mb-1">DevCoins</p>
                        <p className="text-xl sm:text-2xl font-bold text-foreground flex items-center justify-center gap-2"><span className="text-yellow-500 text-lg leading-none">🪙</span> {user?.coins || 0}</p>
                    </div>
                </div>
            </div>


            {/* Badges Showcase */}
            {badges.length > 0 && (
                <div className="card-glass mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-section-title flex items-center gap-2">
                            <Award className="w-5 h-5 text-primary" /> Achievement Badges
                        </h3>
                        <span className="badge bg-surface text-text-muted">
                            {badges.length} Unlocked
                        </span>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {badges.map((badge, i) => (
                            <motion.div 
                                key={badge.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className={`min-w-[140px] flex flex-col items-center justify-center p-4 rounded-2xl border ${getBadgeBorder(badge.level)} text-center group cursor-pointer`}
                                title={badge.description}
                            >
                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{badge.icon}</div>
                                <p className="font-bold text-white text-sm leading-tight">{badge.name}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <CodingStats leetcode={dashboardData?.leetcode} gfg={dashboardData?.gfg} github={dashboardData?.github} codeforces={dashboardData?.codeforces} onGfgSync={handleGfgSync} />
            <ActivityHeatmap 
                activityDates={dashboardData?.activityDates || []} 
                leetcodeCalendar={dashboardData?.leetcode?.submissionCalendar}
            />

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-navy-dark/80 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 w-full max-w-2xl my-auto">
                        <div className="flex justify-between items-center mb-5 sm:mb-6">
                            <h3 className="text-lg sm:text-xl font-bold text-white">Edit Profile</h3>
                            <button onClick={() => setIsEditing(false)} className="text-ice/70 hover:text-white p-1"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                        </div>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">Full Name</label>
                                    <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">Profile Picture URL</label>
                                    <input type="text" value={formData.profilePicture} onChange={(e) => setFormData({...formData, profilePicture: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">College Name</label>
                                    <input type="text" value={formData.collegeName} onChange={(e) => setFormData({...formData, collegeName: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">Branch</label>
                                    <input type="text" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">Graduation Year</label>
                                    <input type="number" value={formData.graduationYear} onChange={(e) => setFormData({...formData, graduationYear: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">Bio</label>
                                    <input type="text" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">LeetCode Username</label>
                                    <input type="text" value={formData.leetcodeUsername} onChange={(e) => setFormData({...formData, leetcodeUsername: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">GeeksforGeeks Username</label>
                                    <input type="text" value={formData.gfgUsername} onChange={(e) => setFormData({...formData, gfgUsername: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">GitHub Username</label>
                                    <input type="text" value={formData.githubUsername} onChange={(e) => setFormData({...formData, githubUsername: e.target.value})} className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-ice/70 text-sm mb-1">Codeforces Username</label>
                                    <input type="text" value={formData.codeforcesUsername} onChange={(e) => setFormData({...formData, codeforcesUsername: e.target.value})} className="input-field" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-ice/70 text-sm mb-1">LinkedIn URL</label>
                                    <input type="text" placeholder="https://linkedin.com/in/yourprofile (or username)" value={formData.linkedin.profileUrl} onChange={(e) => setFormData({...formData, linkedin: { profileUrl: e.target.value }})} className="input-field" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-3 sm:pt-4">
                                <button type="submit" className="btn-primary">
                                    <Save className="w-4 h-4" /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isChangingPassword && (
                <div className="fixed inset-0 bg-navy-dark/80 backdrop-blur-sm z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-surface border border-border rounded-2xl p-5 sm:p-6 w-full max-w-md my-auto">
                        <div className="flex justify-between items-center mb-5 sm:mb-6">
                            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2"><Lock className="w-5 h-5 text-sky"/> Change Password</h3>
                            <button onClick={() => setIsChangingPassword(false)} className="text-ice/70 hover:text-white p-1"><X className="w-5 h-5 sm:w-6 sm:h-6" /></button>
                        </div>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-ice/70 text-sm mb-1">Current Password</label>
                                <input type="password" required value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-ice/70 text-sm mb-1">New Password</label>
                                <input type="password" required minLength="6" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-ice/70 text-sm mb-1">Confirm New Password</label>
                                <input type="password" required minLength="6" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="input-field" />
                            </div>
                            <div className="flex justify-end pt-3 sm:pt-4">
                                <button type="submit" className="btn-primary">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default Profile;
