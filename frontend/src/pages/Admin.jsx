import DashboardLayout from '../components/layout/DashboardLayout';
import { Shield, Users, Trophy, Settings } from 'lucide-react';

const Admin = () => {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-500" /> Admin Dashboard
                </h2>
                <p className="text-ice/70">Manage users, leaderboards, and system settings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass rounded-xl p-6 border border-border/50 hover:border-red-500/50 transition-colors cursor-pointer group">
                    <Users className="w-8 h-8 text-ice mb-4 group-hover:text-red-500 transition-colors" />
                    <h3 className="text-lg font-bold text-white mb-1">User Management</h3>
                    <p className="text-sm text-ice/60">View, edit, or ban user accounts.</p>
                </div>
                <div className="glass rounded-xl p-6 border border-border/50 hover:border-red-500/50 transition-colors cursor-pointer group">
                    <Trophy className="w-8 h-8 text-ice mb-4 group-hover:text-red-500 transition-colors" />
                    <h3 className="text-lg font-bold text-white mb-1">Leaderboard Control</h3>
                    <p className="text-sm text-ice/60">Manage ranks, resolve disputes, and update points manually.</p>
                </div>
                <div className="glass rounded-xl p-6 border border-border/50 hover:border-red-500/50 transition-colors cursor-pointer group">
                    <Settings className="w-8 h-8 text-ice mb-4 group-hover:text-red-500 transition-colors" />
                    <h3 className="text-lg font-bold text-white mb-1">System Settings</h3>
                    <p className="text-sm text-ice/60">Configure global app settings, API keys, and coin rates.</p>
                </div>
            </div>
            
            <div className="glass rounded-2xl p-8 border border-red-500/20 bg-red-500/5 text-center">
                <h3 className="text-xl font-bold text-white mb-2">Restricted Access</h3>
                <p className="text-ice/70">Only users with the 'admin' role can access the full management features.</p>
            </div>
        </DashboardLayout>
    );
};

export default Admin;
