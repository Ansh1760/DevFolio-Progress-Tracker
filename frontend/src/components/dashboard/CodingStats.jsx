import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { RefreshCw } from 'lucide-react';
import { userAPI } from '../../services/api';

const StarRating = ({ stars, max = 6 }) => (
    <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
            <span key={i} className={`text-lg ${i < stars ? 'text-yellow-400' : 'text-navy-light/60'}`}>★</span>
        ))}
    </div>
);

/**
 * CodingStats
 *
 * Props:
 *   leetcode, gfg, github, codeforces — from dashboard API response
 *   linkedinUrl, profilePicture, fullName — for LinkedIn card
 *   onGfgSync — optional callback after a successful GFG sync
 *     (Dashboard passes this to update dashboardData state without a full reload)
 */
const CodingStats = ({ leetcode, gfg, github, codeforces, linkedinUrl, profilePicture, fullName, onGfgSync }) => {
    const [gfgSyncing, setGfgSyncing] = useState(false);
    const [gfgSyncError, setGfgSyncError] = useState('');

    const leetcodeData = [
        { name: 'Easy', value: leetcode?.easySolved || 0, color: '#10B981' },
        { name: 'Medium', value: leetcode?.mediumSolved || 0, color: '#F59E0B' },
        { name: 'Hard', value: leetcode?.hardSolved || 0, color: '#EF4444' },
    ];

    // Build bar chart data from the rawStats breakdown if available, otherwise omit
    const gfgData = gfg?.rawStats
        ? [
            { name: 'School', value: gfg.rawStats.school ?? 0 },
            { name: 'Basic', value: gfg.rawStats.basic ?? 0 },
            { name: 'Easy', value: gfg.rawStats.easy ?? 0 },
            { name: 'Medium', value: gfg.rawStats.medium ?? 0 },
            { name: 'Hard', value: gfg.rawStats.hard ?? 0 },
        ]
        : null;

    const handleGfgSync = async () => {
        setGfgSyncing(true);
        setGfgSyncError('');
        try {
            const res = await userAPI.syncGfg();
            if (res.data.success && onGfgSync) {
                onGfgSync(res.data.data);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Unable to fetch GeeksforGeeks data.';
            setGfgSyncError(msg);
        } finally {
            setGfgSyncing(false);
        }
    };

    const formatLastSynced = (ts) => {
        if (!ts) return null;
        const d = new Date(ts);
        return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    };


    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* LeetCode Stats */}
            <div className="card flex flex-col">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-card-title flex items-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png" alt="LeetCode" className="w-5 h-5 invert" />
                        LeetCode
                    </h3>
                    <span className="badge bg-orange-500/10 text-orange-500 border-orange-500/30">
                        #{leetcode?.ranking?.toLocaleString() || 'N/A'}
                    </span>
                </div>

                {leetcode ? (
                    leetcode.error ? (
                        <div className="flex-1 flex items-center justify-center text-red-500/80 text-sm text-center bg-red-500/5 rounded-xl border border-red-500/10">
                            Unable to fetch data.<br />Check username or try again later.
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-center mb-4">
                                <div className="relative">
                                    <div className="w-28 h-28">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={leetcodeData} innerRadius={38} outerRadius={52} paddingAngle={3} dataKey="value" stroke="none">
                                                    {leetcodeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip contentStyle={{ backgroundColor: '#1B1F52', borderColor: '#4B5694', borderRadius: '8px', fontSize: '12px' }} itemStyle={{ color: '#F0EDE8' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-xl font-bold text-foreground">{leetcode.totalSolved}</span>
                                        <span className="text-[10px] text-text-muted">solved</span>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 mt-auto">
                                {leetcodeData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2 text-sm">
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="text-text-muted flex-1">{item.name}</span>
                                        <span className="font-semibold text-foreground">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )
                ) : (
                    <div className="flex-1 flex items-center justify-center text-text-muted text-sm bg-surface/30 rounded-xl border border-dashed border-border">
                        Not Connected
                    </div>
                )}
            </div>

            {/* GFG Stats */}
            <div className="card flex flex-col">
                {/* Header row */}
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-card-title flex items-center gap-2">
                        <span className="text-green-500 font-extrabold text-lg leading-none">G</span>
                        GeeksforGeeks
                    </h3>
                    {/* Score badge */}
                    {gfg && !gfg.notSynced && !gfg.error && (
                        <span className="badge bg-green-500/10 text-green-500 border-green-500/30">
                            Score: {gfg.codingScore ?? 0}
                        </span>
                    )}
                </div>

                {/* Last synced + Refresh button row */}
                <div className="flex items-center justify-between mb-4 min-h-[20px]">
                    {gfg?.lastSynced ? (
                        <span className="text-[10px] text-text-muted">Synced {formatLastSynced(gfg.lastSynced)}</span>
                    ) : (
                        <span className="text-[10px] text-text-muted/70">Never synced</span>
                    )}
                    {/* Show refresh button only if username is set */}
                    {gfg && (
                        <button
                            onClick={handleGfgSync}
                            disabled={gfgSyncing}
                            title="Refresh GFG data"
                            className="flex items-center gap-1 text-[10px] text-green-400/70 hover:text-green-400 transition-colors disabled:opacity-50 ml-2"
                        >
                            <RefreshCw className={`w-3 h-3 ${gfgSyncing ? 'animate-spin' : ''}`} />
                            {gfgSyncing ? 'Syncing…' : 'Refresh'}
                        </button>
                    )}
                </div>

                {/* Sync error */}
                {gfgSyncError && (
                    <div className="text-red-400 text-[10px] mb-2 text-center">{gfgSyncError}</div>
                )}

                {/* Content */}
                {!gfg ? (
                    <div className="flex-1 flex items-center justify-center text-text-muted text-sm bg-surface/30 rounded-xl border border-dashed border-border">
                        Not Connected
                    </div>
                ) : gfg.notSynced ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3">
                        <p className="text-text-muted text-xs text-center">
                            GFG username is set but data has not been synced yet.
                        </p>
                        <button
                            onClick={handleGfgSync}
                            disabled={gfgSyncing}
                            className="btn-secondary text-green-500 py-1.5 px-3 text-xs"
                        >
                            <RefreshCw className={`w-3 h-3 ${gfgSyncing ? 'animate-spin' : ''}`} />
                            {gfgSyncing ? 'Syncing…' : 'Sync Now'}
                        </button>
                    </div>
                ) : gfg.error ? (
                    <div className="flex-1 flex items-center justify-center text-red-500/80 text-sm text-center bg-red-500/5 rounded-xl border border-red-500/10">
                        {gfg.message || 'Unable to fetch data.'}<br />
                        <span className="text-red-500/60 text-xs">Check username or try again later.</span>
                    </div>
                ) : (
                    <>
                        {/* Total solved count */}
                        <div className="text-center mb-3">
                            <span className="text-3xl font-bold text-foreground">{gfg.totalSolved ?? 0}</span>
                            <p className="text-text-muted text-xs mt-1">Total Solved</p>
                        </div>

                        {/* Institution rank if available */}
                        {gfg.institutionRank !== null && gfg.institutionRank !== undefined && (
                            <div className="flex justify-between items-center bg-surface/50 px-3 py-2 rounded-xl border border-border mb-3 shadow-inner">
                                <span className="text-text-muted text-xs">Institution Rank</span>
                                <span className="font-bold text-foreground text-sm">#{gfg.institutionRank}</span>
                            </div>
                        )}

                        {/* Bar chart for difficulty breakdown — only if rawStats exist */}
                        {gfgData ? (
                            <div className="flex-1 min-h-[100px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={gfgData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                                        <XAxis dataKey="name" stroke="#E8DCC7" fontSize={9} tickLine={false} axisLine={false} opacity={0.6} />
                                        <YAxis stroke="#E8DCC7" fontSize={9} tickLine={false} axisLine={false} opacity={0.6} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1B1F52', borderColor: '#4B5694', borderRadius: '8px', fontSize: '12px' }} />
                                        <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="text-text-muted text-[10px] text-center mt-2">
                                Difficulty breakdown not available
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* GitHub Stats */}
            <div className="card flex flex-col">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-card-title flex items-center gap-2">
                        <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        GitHub
                    </h3>
                    {github?.profileUrl && (
                        <a href={github.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary-hover transition-colors font-semibold">
                            View ↗
                        </a>
                    )}
                </div>

                {github ? (
                    github.error ? (
                        <div className="flex-1 flex items-center justify-center text-red-500/80 text-sm text-center bg-red-500/5 rounded-xl border border-red-500/10">
                            Unable to fetch data.<br />Check username or try again later.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 flex-1">
                            {github.avatarUrl && (
                                <div className="flex items-center gap-3 mb-2">
                                    <img src={github.avatarUrl} alt="GitHub" className="w-10 h-10 rounded-full border border-border shadow-sm" />
                                    <span className="text-sm text-text-muted">@{github.profileUrl?.split('/').pop()}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center bg-surface/50 p-3 rounded-xl border border-border shadow-inner">
                                <span className="text-text-muted text-sm">Repositories</span>
                                <span className="font-bold text-foreground">{github.publicRepos}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface/50 p-3 rounded-xl border border-border shadow-inner">
                                <span className="text-text-muted text-sm">Followers</span>
                                <span className="font-bold text-foreground">{github.followers}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface/50 p-3 rounded-xl border border-border shadow-inner">
                                <span className="text-text-muted text-sm">Following</span>
                                <span className="font-bold text-foreground">{github.following}</span>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex-1 flex items-center justify-center text-text-muted text-sm bg-surface/30 rounded-xl border border-dashed border-border">
                        Not Connected
                    </div>
                )}
            </div>

            {/* Codeforces Stats */}
            <div className="card flex flex-col">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-card-title flex items-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Codeforces_logo.svg" alt="Codeforces" className="w-5 h-5 bg-white rounded-sm p-0.5" />
                        Codeforces
                    </h3>
                    {codeforces?.profileUrl && (
                        <a href={codeforces.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:text-primary-hover transition-colors font-semibold">
                            View ↗
                        </a>
                    )}
                </div>

                {codeforces ? (
                    codeforces.error ? (
                        <div className="flex-1 flex items-center justify-center text-red-500/80 text-sm text-center bg-red-500/5 rounded-xl border border-red-500/10">
                            Unable to fetch data.<br />Check username or try again later.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3 flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {codeforces.avatar && (
                                    <img src={codeforces.avatar} alt="Codeforces" className="w-10 h-10 rounded-full border border-border shadow-sm" />
                                )}
                                <div>
                                    <span className="text-sm text-text-muted block">@{codeforces.username}</span>
                                    {codeforces.lastSynced && (
                                        <span className="text-[10px] text-text-muted/70">Synced {formatLastSynced(codeforces.lastSynced)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-2">
                                <div className="bg-surface/50 p-2.5 rounded-xl border border-border text-center shadow-inner">
                                    <p className="text-text-muted text-xs">Rating</p>
                                    <p className="font-bold text-foreground text-sm">{codeforces.rating}</p>
                                </div>
                                <div className="bg-surface/50 p-2.5 rounded-xl border border-border text-center shadow-inner">
                                    <p className="text-text-muted text-xs">Max Rating</p>
                                    <p className="font-bold text-foreground text-sm">{codeforces.maxRating}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center bg-surface/50 p-3 rounded-xl border border-border shadow-inner">
                                <span className="text-text-muted text-sm">Rank</span>
                                <span className="font-bold text-foreground capitalize">{codeforces.rank}</span>
                            </div>
                            <div className="flex justify-between items-center bg-surface/50 p-3 rounded-xl border border-border shadow-inner">
                                <span className="text-text-muted text-sm">Max Rank</span>
                                <span className="font-bold text-foreground capitalize">{codeforces.maxRank}</span>
                            </div>
                            <div className="flex justify-between items-center px-2 mt-1">
                                <span className="text-text-muted text-xs">Contribution: <span className="text-foreground font-medium">{codeforces.contribution}</span></span>
                                <span className="text-text-muted text-xs">Friends: <span className="text-foreground font-medium">{codeforces.friendOfCount}</span></span>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted text-sm gap-1 bg-surface/30 rounded-xl border border-dashed border-border">
                        <span>Codeforces profile not connected.</span>
                        <span className="text-xs text-primary font-medium">Go to Profile → Edit Profile to connect</span>
                    </div>
                )}
            </div>


        </div>
    );
};

export default CodingStats;
