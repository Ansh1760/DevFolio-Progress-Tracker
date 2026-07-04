import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminApi';
import { ShieldAlert, KeyRound, Loader2, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await adminService.login({ adminId, password });
            if (res.data.success) {
                localStorage.setItem('adminToken', res.data.token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid Credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="glass rounded-2xl p-8 border-2 border-red-500/20 shadow-[0_0_50px_-12px_rgba(239,68,68,0.25)]">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 border border-red-500/20 shadow-inner">
                            <ShieldAlert className="w-8 h-8 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 text-center">Admin Portal</h1>
                        <p className="text-ice/70 text-sm text-center">Authorized personnel only. All access attempts are logged.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-black text-sm mb-1.5 font-medium">Admin ID</label>
                            <input
                                type="text"
                                value={adminId}
                                onChange={(e) => setAdminId(e.target.value)}
                                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-black focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-500"
                                placeholder="Enter your Admin ID"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-black text-sm mb-1.5 font-medium">Master Password</label>
                            <div className="relative">
                                <KeyRound className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border border-border rounded-xl pl-11 pr-4 py-3 text-black focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all placeholder:text-gray-500"
                                    placeholder="••••••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-red-600/20 disabled:opacity-70 mt-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                <>Authenticate <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>
                </div>
                <div className="text-center mt-6">
                    <p className="text-ice/40 text-xs">If you are not an administrator, <a href="/" className="text-sky hover:underline cursor-pointer">return to the main site</a>.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
