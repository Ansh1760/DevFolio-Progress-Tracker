import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login(email, password);
            if (!data.onboardingComplete) {
                navigate('/onboarding');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-steel/20 blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="glass rounded-2xl p-8 relative z-10 border border-white/10">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/30">
                            <Code2 className="text-primary w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-ice/70 text-sm">Sign in to continue your DSA journey</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-ice/80 mb-1">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-navy-light/50 border border-border rounded-lg px-4 py-2.5 text-white placeholder-ice/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ice/80 mb-1">Password</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-navy-light/50 border border-border rounded-lg px-4 py-2.5 text-white placeholder-ice/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        <div className="flex justify-end">
                            <Link to="/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button 
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group mt-6"
                        >
                            Sign In
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-ice/60">
                        Don't have an account? <Link to="/signup" className="text-sky hover:text-white transition-colors">Create one</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
