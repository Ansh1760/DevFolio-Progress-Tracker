import { Bell, Search, Menu, Info, CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileBadge from '../common/ProfileBadge';

const Topbar = ({ toggleSidebar }) => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    
    // Notifications State
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await userAPI.getNotifications();
                if (res.data.success) {
                    const notifs = res.data.data;
                    setNotifications(notifs);
                    
                    // Check unread count
                    const lastReadId = localStorage.getItem('lastReadNotifId');
                    if (!lastReadId && notifs.length > 0) {
                        setUnreadCount(notifs.length);
                    } else if (notifs.length > 0) {
                        const unread = notifs.findIndex(n => n._id === lastReadId);
                        setUnreadCount(unread === -1 ? notifs.length : unread);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch notifications", err);
            }
        };
        fetchNotifications();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotifs(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };
    
    const handleOpenNotifs = () => {
        setShowNotifs(!showNotifs);
        if (!showNotifs && notifications.length > 0) {
            setUnreadCount(0);
            localStorage.setItem('lastReadNotifId', notifications[0]._id);
        }
    };
    
    const getNotifIcon = (type) => {
        switch(type) {
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return <Info className="w-4 h-4 text-sky-500" />;
        }
    };

    return (
        <header className="h-16 md:h-20 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-20 px-3 md:px-6 lg:px-8 flex items-center justify-between w-full shadow-sm">
            <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <button className="md:hidden flex-shrink-0 text-text-secondary hover:text-foreground transition-colors p-1" onClick={toggleSidebar}>
                    <Menu className="w-6 h-6" />
                </button>
                {/* Mobile: show DevFolio brand in topbar */}
                <div className="flex md:hidden items-center gap-2 flex-shrink-0">
                    <div className="w-7 h-7 bg-primary/20 border border-primary/40 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">D</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">DevFolio</span>
                </div>
                <div className="hidden sm:block flex-1 max-w-xl relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-text-muted" />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="block w-full pl-11 pr-4 py-2.5 border border-border/60 rounded-xl leading-5 bg-surface/40 text-foreground placeholder-text-muted focus:outline-none focus:bg-surface focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all sm:text-sm shadow-inner" 
                        placeholder="Search users, topics (Press Enter)..." 
                    />
                </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-3 ml-2 flex-shrink-0">
                <div className="hidden sm:flex items-center gap-2 md:gap-2.5 bg-surface/60 px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl border border-border hover:border-border/80 transition-colors cursor-default shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse" />
                    <span className="text-xs md:text-sm font-semibold text-foreground">{user?.streak || 0}🔥</span>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2.5 bg-surface/60 px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl border border-border hover:border-border/80 transition-colors cursor-default shadow-sm">
                    <span className="text-yellow-500 font-bold text-sm md:text-base leading-none">🪙</span>
                    <span className="text-xs md:text-sm font-bold text-foreground">{user?.coins || 0}</span>
                </div>

                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={handleOpenNotifs}
                        className="relative p-2 md:p-2.5 text-text-secondary hover:text-foreground hover:bg-surface/50 rounded-xl transition-colors focus:outline-none"
                    >
                        <Bell className="w-4 h-4 md:w-5 md:h-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-background animate-pulse"></span>
                        )}
                    </button>
                    
                    <AnimatePresence>
                        {showNotifs && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-3 w-[calc(100vw-1rem)] sm:w-80 max-w-[340px] bg-surface border border-border rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right"
                                style={{ maxHeight: 'calc(100vh - 120px)' }}
                            >
                                <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50">
                                    <h3 className="font-bold text-foreground">Notifications</h3>
                                    <div className="flex items-center gap-2">
                                        {unreadCount > 0 && (
                                            <span className="text-xs font-semibold bg-primary text-foreground px-2.5 py-0.5 rounded-full">{unreadCount} New</span>
                                        )}
                                        <button onClick={() => setShowNotifs(false)} className="p-1 text-text-muted hover:text-foreground rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto scrollbar-hide">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-text-muted text-sm flex flex-col items-center gap-2">
                                            <Bell className="w-8 h-8 opacity-20" />
                                            <span>No notifications yet</span>
                                        </div>
                                    ) : (
                                        notifications.map((notif, idx) => (
                                            <div key={notif._id} className={`p-4 border-b border-border/50 hover:bg-white/[0.02] transition-colors ${idx < unreadCount ? 'bg-primary/5' : ''}`}>
                                                <div className="flex gap-3">
                                                    <div className="mt-0.5 shrink-0">
                                                        {getNotifIcon(notif.type)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white mb-1">{notif.title}</h4>
                                                        <p className="text-xs text-ice/70 leading-relaxed">{notif.message}</p>
                                                        <span className="text-[10px] text-ice/40 font-medium mt-2 block">
                                                            {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <div 
                        className={`h-8 w-8 md:h-10 md:w-10 relative cursor-pointer z-10 transition-colors shadow-sm flex-shrink-0 ${user?.profileBorder ? 'p-[2px]' : 'rounded-xl border border-border hover:border-primary/50 overflow-hidden'}`}
                        onClick={() => navigate('/profile')}
                    >
                        {user?.profileBorder && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-xl animate-pulse" />
                        )}
                        <img 
                            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=2B1D10&color=F8F5EF`} 
                            alt="Profile" 
                            className={`w-full h-full object-cover relative z-10 ${user?.profileBorder ? 'rounded-[10px]' : ''}`}
                        />
                    </div>
                    {user?.profileBadge && user.profileBadge !== 'none' && (
                        <div className="absolute -bottom-1 -right-1 z-20 pointer-events-none scale-90">
                            <ProfileBadge badgeType={user.profileBadge} className="w-4 h-4" />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Topbar;
