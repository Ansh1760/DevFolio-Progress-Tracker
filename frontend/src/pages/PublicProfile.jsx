import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import CodingStats from '../components/dashboard/CodingStats';
import { AuthContext } from '../context/AuthContext';
import {
    MapPin, Calendar, Flame, Trophy, Coins, ArrowLeft,
    Code2, GraduationCap, Award, ExternalLink, Star
} from 'lucide-react';
import { userAPI } from '../services/api';
import { motion } from 'framer-motion';
import ProfileBadge from '../components/common/ProfileBadge';

const StatBadge = ({ label, value, icon: Icon, color }) => (
    <div className="flex flex-col items-center justify-center">
        <p className="text-label mb-1">{label}</p>
        <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            {value ?? '—'}
        </p>
    </div>
);

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [starData, setStarData] = useState({ count: 0, hasStarred: false });
    const [isStarring, setIsStarring] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userAPI.getPublicProfile(id);
                if (res.data.success) {
                    setProfileData(res.data.data);
                    setStarData({
                        count: res.data.data.profile.starsCount || 0,
                        hasStarred: res.data.data.profile.hasStarred || false
                    });
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    const handleToggleStar = async () => {
        if (!currentUser || currentUser._id === id || isStarring) return;
        setIsStarring(true);
        try {
            // Optimistic update
            const newHasStarred = !starData.hasStarred;
            setStarData(prev => ({
                count: prev.count + (newHasStarred ? 1 : -1),
                hasStarred: newHasStarred
            }));
            
            const res = await userAPI.toggleStar(id);
            if (res.data.success) {
                setStarData({
                    count: res.data.starsCount,
                    hasStarred: res.data.hasStarred
                });
            }
        } catch (err) {
            // Revert on error
            setStarData(prev => ({
                count: prev.count + (prev.hasStarred ? -1 : 1),
                hasStarred: !prev.hasStarred
            }));
            console.error('Failed to toggle star', err);
        } finally {
            setIsStarring(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-white text-xl">Loading profile...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !profileData) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <p className="text-red-400 text-lg">{error || 'Profile not found'}</p>
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sky hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const { profile, leetcode, gfg, github, codeforces } = profileData;

    const totalSolved = (leetcode?.totalSolved || 0) + (gfg?.totalSolved || 0);

    const badges = [
        { name: 'First Blood', icon: '🩸', level: 'bronze', condition: totalSolved >= 1 },
        { name: '7 Day Streak', icon: '🔥', level: 'silver', condition: profile.streak >= 7 },
        { name: '100 Coins', icon: '🪙', level: 'gold', condition: profile.coins >= 100 },
        { name: 'Century Club', icon: '💯', level: 'gold', condition: totalSolved >= 100 },
        { name: 'Grinder', icon: '⚙️', level: 'platinum', condition: totalSolved >= 500 },
    ].filter(b => b.condition);

    const getBadgeBorder = (level) => {
        switch (level) {
            case 'bronze': return 'border-orange-700/50 bg-orange-700/10';
            case 'silver': return 'border-gray-400/50 bg-gray-400/10';
            case 'gold': return 'border-yellow-400/50 bg-yellow-400/10';
            case 'platinum': return 'border-sky/50 bg-sky/10';
            default: return 'border-border bg-navy-light/40';
        }
    };

    return (
        <DashboardLayout>
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-ice/60 hover:text-white transition-colors mb-6 text-sm"
            >
                <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Profile Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-elevated mb-8 relative overflow-hidden"
            >
                {/* Glowing background effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center sm:items-start relative z-10">
                    <div className="relative flex-shrink-0">
                        <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl relative ${profile.profileBorder ? 'p-[4px]' : 'overflow-hidden border border-border shadow-md bg-surface'}`}>
                            {profile.profileBorder && (
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl animate-pulse" />
                            )}
                            <img
                                src={profile.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'User')}&background=2B1D10&color=F8F5EF&size=128`}
                                alt={profile.fullName}
                                className={`w-full h-full object-cover relative z-10 ${profile.profileBorder ? 'rounded-xl' : ''}`}
                            />
                        </div>
                        {profile.streak >= 7 && (
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-orange-500/20 border border-orange-500/50 rounded-full flex items-center justify-center text-sm z-20">
                                🔥
                            </div>
                        )}
                    </div>

                    <div className="flex-1 w-full text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-center sm:items-start mb-3 sm:mb-4 gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
                                <h1 className={`text-page-title mb-1 ${profile.usernameColor ? "font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tight drop-shadow-sm" : ""}`}>
                                    {profile.fullName || 'Anonymous Coder'}
                                </h1>
                                <ProfileBadge badgeType={profile.profileBadge} className="w-7 h-7 sm:w-8 sm:h-8" />
                            </div>
                            
                            {/* Star Button */}
                            <div className="flex flex-col items-center sm:items-end gap-1">
                                <button 
                                    onClick={handleToggleStar}
                                    disabled={!currentUser || currentUser._id === id || isStarring}
                                    className={`relative flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)] hover:shadow-[0_0_25px_rgba(234,179,8,0.4)] ${
                                        starData.hasStarred 
                                            ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' 
                                            : 'bg-primary border border-yellow-500/30 text-white hover:text-yellow-300 hover:-translate-y-1'
                                    }`}
                                >
                                    <Star className={`w-4 h-4 sm:w-5 sm:h-5 ${starData.hasStarred ? 'fill-yellow-500' : ''}`} />
                                    <span className="text-sm sm:text-lg">{starData.count} {starData.count === 1 ? 'Star' : 'Stars'}</span>
                                </button>
                                {!starData.hasStarred && currentUser && currentUser._id !== id && (
                                    <span className="text-xs text-yellow-400/80 font-medium animate-pulse">✨ Give them a star!</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-text-secondary mb-3 mt-2 justify-center sm:justify-start">
                            {profile.collegeName && (
                                <div className="flex items-center gap-1.5">
                                    <GraduationCap className="w-4 h-4 text-text-muted" />
                                    {profile.collegeName}
                                    {profile.branch && <span className="text-text-muted">· {profile.branch}</span>}
                                </div>
                            )}
                            {profile.graduationYear && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-text-muted" />
                                    Class of {profile.graduationYear}
                                </div>
                            )}
                        </div>
                        {profile.bio && (
                            <p className="text-text-muted italic mb-3 sm:mb-4 text-sm">"{profile.bio}"</p>
                        )}

                        {/* External links */}
                        <div className="flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start">
                            {profile.githubUsername && (
                                <a
                                    href={`https://github.com/${profile.githubUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-ice/80 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> {profile.githubUsername}
                                </a>
                            )}
                            {profile.leetcodeUsername && (
                                <a
                                    href={`https://leetcode.com/${profile.leetcodeUsername}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-500/40 text-orange-400 hover:text-orange-300 px-3 py-1.5 rounded-lg text-sm transition-all"
                                >
                                    <Code2 className="w-4 h-4" /> {profile.leetcodeUsername}
                                </a>
                            )}
                            {profile.linkedinUrl && (
                                <a
                                    href={profile.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 bg-sky/10 hover:bg-sky/20 border border-sky/20 hover:border-sky/40 text-sky hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> LinkedIn
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border relative z-10">
                    <StatBadge label="Total Solved" value={totalSolved} icon={Code2} color="text-sky" />
                    <StatBadge label="Current Streak" value={`${profile.streak} days`} icon={Flame} color="text-orange-400" />
                    <StatBadge label="Longest Streak" value={`${profile.longestStreak} days`} icon={Trophy} color="text-yellow-400" />
                    <StatBadge label="DevCoins" value={profile.coins} color="text-yellow-300" />
                </div>
            </motion.div>

            {/* Badges */}
            {badges.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="card-glass mb-8"
                >
                    <h3 className="text-section-title mb-5 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary" /> Achievements
                    </h3>
                    <div className="flex gap-4 flex-wrap">
                        {badges.map((badge, i) => (
                            <div
                                key={i}
                                className={`flex flex-col items-center justify-center px-5 py-4 rounded-2xl border ${getBadgeBorder(badge.level)} text-center min-w-[100px]`}
                            >
                                <div className="text-3xl mb-2">{badge.icon}</div>
                                <p className="text-white font-bold text-xs">{badge.name}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Platform Stats */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                <CodingStats 
                    leetcode={leetcode} 
                    gfg={gfg} 
                    github={github} 
                    codeforces={codeforces}
                    linkedinUrl={profile?.linkedin?.profileUrl}
                    profilePicture={profile?.profilePicture}
                    fullName={profile?.fullName}
                />
            </motion.div>

            {/* Activity Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <ActivityHeatmap 
                    activityDates={profile.activityDates || []} 
                    leetcodeCalendar={leetcode?.submissionCalendar}
                />
            </motion.div>
        </DashboardLayout>
    );
};

export default PublicProfile;
