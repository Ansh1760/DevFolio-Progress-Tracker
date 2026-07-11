import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, School, BookOpen, GraduationCap, Code, Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react';

const Onboarding = () => {
    const { api, fetchUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        profilePicture: '',
        collegeName: '',
        branch: '',
        leetcodeUsername: '',
        gfgUsername: '',
        codeforcesUsername: '',
        linkedin: {
            profileUrl: ''
        }
    });

    const handleChange = (e) => {
        if (e.target.name === 'linkedin.profileUrl') {
            setFormData({ ...formData, linkedin: { profileUrl: e.target.value } });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Steps 1 and 2 just advance the wizard
        if (step !== 3) {
            nextStep();
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Save onboarding data to backend
            await api.post('/auth/onboarding', formData);
            // Refresh the user in context (so onboardingComplete becomes true)
            await fetchUser();
            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Onboarding error:', err);
            const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicators = () => (
        <div className="flex justify-center items-center space-x-4 mb-8">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all
                        ${step >= s ? 'bg-primary text-white shadow-[0_0_10px_var(--color-primary-glow)]' : 'bg-navy-light text-ice/50 border border-border'}
                    `}>
                        {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                    </div>
                    {s < 3 && (
                        <div className={`w-12 h-1 mx-2 rounded-full transition-all ${step > s ? 'bg-primary/50' : 'bg-border'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-steel/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl z-10"
            >
                <div className="glass rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h2>
                        <p className="text-ice/70">Let's personalise your DevFolio experience</p>
                    </div>

                    {renderStepIndicators()}

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/40 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2"><User className="w-4 h-4"/> Full Name</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                                        placeholder="e.g. Rahul Sharma"
                                        className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2"><User className="w-4 h-4"/> Profile Picture URL <span className="text-ice/40">(Optional)</span></label>
                                    <input type="text" name="profilePicture" value={formData.profilePicture} onChange={handleChange}
                                        placeholder="https://example.com/avatar.jpg"
                                        className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Academic Info */}
                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2"><School className="w-4 h-4"/> College Name</label>
                                    <input type="text" name="collegeName" value={formData.collegeName} onChange={handleChange} required
                                        placeholder="e.g. IIT Delhi"
                                        className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Branch</label>
                                        <input type="text" name="branch" value={formData.branch} onChange={handleChange} required
                                            placeholder="e.g. CSE"
                                            className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2"><GraduationCap className="w-4 h-4"/> Grad Year</label>
                                        <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} required
                                            min="2000" max="2030" placeholder="2025"
                                            className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Coding Profiles */}
                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2"><Code className="w-4 h-4 text-orange-400"/> LeetCode Username</label>
                                    <input type="text" name="leetcodeUsername" value={formData.leetcodeUsername} onChange={handleChange} required
                                        placeholder="e.g. rahulsharma_lc"
                                        className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2"><Briefcase className="w-4 h-4 text-green-400"/> GeeksforGeeks Username</label>
                                    <input type="text" name="gfgUsername" value={formData.gfgUsername} onChange={handleChange} required
                                        placeholder="e.g. rahulsharma_gfg"
                                        className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b1/Codeforces_logo.svg" alt="CF" className="w-4 h-4 bg-white rounded-sm p-0.5" />
                                        Codeforces Username (Optional)
                                    </label>
                                    <input type="text" name="codeforcesUsername" value={formData.codeforcesUsername || ''} onChange={handleChange}
                                        placeholder="e.g. tourist"
                                        className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-ice/80 mb-1 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        LinkedIn Username (Optional)
                                    </label>
                                    <input type="text" name="linkedin.profileUrl" value={formData.linkedin.profileUrl} onChange={handleChange}
                                        placeholder="e.g. rahulsharma"
                                        className="w-full bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white placeholder-ice/30 focus:outline-none focus:ring-2 focus:ring-sky/50" />
                                </div>
                            </motion.div>
                        )}

                        <div className="flex justify-between mt-8">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep}
                                    className="px-6 py-2.5 rounded-lg border border-border text-ice hover:bg-navy-light/50 transition-all">
                                    Back
                                </button>
                            ) : <div />}

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary hover:bg-primary/90 disabled:opacity-60 text-white font-medium px-8 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {step === 3
                                    ? (loading ? 'Saving...' : 'Finish Setup')
                                    : 'Next'
                                }
                                {!loading && step !== 3 && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
