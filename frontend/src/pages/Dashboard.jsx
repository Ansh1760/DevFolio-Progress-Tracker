import DashboardLayout from '../components/layout/DashboardLayout';
import StatsOverview from '../components/dashboard/StatsOverview';
import CodingStats from '../components/dashboard/CodingStats';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import { useContext, useEffect, useState, useCallback } from 'react';
import ProfileBadge from '../components/common/ProfileBadge';
import { AuthContext } from '../context/AuthContext';
import { userAPI, walletAPI } from '../services/api';

const Dashboard = () => {
    const { user, updateUser, setRewardEvent } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = useCallback(async () => {
        try {
            const res = await userAPI.getDashboard();
            if (res.data.success) {
                setDashboardData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Called by CodingStats when the GFG Refresh button succeeds.
    // Merges the fresh GFG stats into dashboardData without a full re-fetch.
    const handleGfgSync = useCallback((freshGfg) => {
        setDashboardData((prev) => prev ? { ...prev, gfg: freshGfg } : prev);
    }, []);

    // Claim daily login reward — runs once per mount
    const claimDailyReward = useCallback(async () => {
        try {
            const res = await walletAPI.dailyLogin();
            if (res.data.success && !res.data.alreadyClaimed) {
                updateUser({ coins: res.data.totalCoins, streak: res.data.streak });
                setRewardEvent({ amount: res.data.reward, reason: 'Daily Login' });
                fetchDashboardData(); // Refresh stats to show new streak & coin
            }
        } catch (_) {
            // Silent — reward claim failure must not break dashboard
        }
    }, [fetchDashboardData, updateUser, setRewardEvent]);

    // Fetch unread global notifications
    const checkNotifications = useCallback(async () => {
        try {
            const res = await userAPI.getNotifications();
            if (res.data.success && res.data.data.length > 0) {
                const latest = res.data.data[0];
                const lastSeen = localStorage.getItem('lastSeenNotificationId');
                
                if (lastSeen !== latest._id) {
                    import('react-hot-toast').then(({ default: toast }) => {
                        toast(
                            <div className="flex flex-col gap-1">
                                <span className="font-bold text-md">{latest.title}</span>
                                <span className="text-sm opacity-90">{latest.message}</span>
                            </div>,
                            {
                                duration: 8000,
                                position: 'top-right',
                                style: {
                                    background: '#2B1D10',
                                    color: '#fff',
                                    border: '1px solid rgba(233, 226, 208, 0.2)'
                                },
                                icon: '🔔',
                            }
                        );
                    });
                    localStorage.setItem('lastSeenNotificationId', latest._id);
                }
            }
        } catch (_) {
            // silent
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        claimDailyReward();
        checkNotifications();
    }, [fetchDashboardData, claimDailyReward, checkNotifications]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-white text-xl">Loading dashboard...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>

            <div className="mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2 flex-wrap">
                    Welcome back,{' '}
                    <span className={user?.usernameColor ? "font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 tracking-tight drop-shadow-sm" : ""}>
                        {user?.fullName || 'Coder'}
                    </span>! 
                    <ProfileBadge badgeType={user?.profileBadge} className="w-6 h-6 shrink-0" />
                    👋
                </h2>
                <p className="text-ice/70">Here's a summary of your coding progress.</p>
            </div>

            <StatsOverview stats={{
                ...dashboardData?.stats,
                coins: user?.coins || 0,
                streak: user?.streak || 0,
                longestStreak: user?.longestStreak || 0
            }} />

            <CodingStats
                leetcode={dashboardData?.leetcode}
                gfg={dashboardData?.gfg}
                github={dashboardData?.github}
                codeforces={dashboardData?.codeforces}
                linkedinUrl={user?.linkedin?.profileUrl}
                profilePicture={user?.profilePicture}
                fullName={user?.fullName}
                onGfgSync={handleGfgSync}
            />

            <ActivityHeatmap 
                activityDates={dashboardData?.activityDates || []} 
                leetcodeCalendar={(() => {
                    console.log('Passing to ActivityHeatmap on Dashboard:', dashboardData?.leetcode?.submissionCalendar);
                    return dashboardData?.leetcode?.submissionCalendar;
                })()}
            />
        </DashboardLayout>
    );
};

export default Dashboard;
