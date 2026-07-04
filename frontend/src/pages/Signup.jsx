import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, ArrowRight } from 'lucide-react';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            await register(email, password);
            navigate('/onboarding');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            {/* Background elements */}
            <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky/10 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="glass rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_15px_var(--color-primary-glow)]">
                            <Code2 className="text-primary w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                        <p className="text-ice/70 text-sm">Start tracking your progress today</p>
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
                                className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/40 focus:outline-none focus:ring-2 focus:ring-sky/50 transition-all"
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
                                className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/40 focus:outline-none focus:ring-2 focus:ring-sky/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-ice/80 mb-1">Confirm Password</label>
                            <input 
                                type="password" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/40 focus:outline-none focus:ring-2 focus:ring-sky/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 group mt-6 shadow-lg shadow-primary/20"
                        >
                            Sign Up
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-ice/60">
                        Already have an account? <Link to="/login" className="text-sky hover:text-white transition-colors">Sign in</Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
