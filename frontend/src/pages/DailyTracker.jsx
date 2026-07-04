import DashboardLayout from '../components/layout/DashboardLayout';
import { Target, CheckCircle2, Circle, Edit3, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { trackerAPI } from '../services/api';

const DailyTracker = () => {
    const [trackerId, setTrackerId] = useState(null);
    const [goals, setGoals] = useState([]);
    const [newGoal, setNewGoal] = useState('');
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTracker = async () => {
            try {
                const res = await trackerAPI.getToday();
                if (res.data.success) {
                    setTrackerId(res.data.data._id);
                    setGoals(res.data.data.goals || []);
                    setNotes(res.data.data.notes || "");
                }
            } catch (error) {
                console.error("Error fetching tracker:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTracker();
    }, []);

    const saveTracker = async (updatedGoals, updatedNotes) => {
        if (!trackerId) return;
        setSaving(true);
        try {
            await trackerAPI.updateTracker(trackerId, { goals: updatedGoals, notes: updatedNotes });
        } catch (error) {
            console.error("Error saving tracker:", error);
        } finally {
            setSaving(false);
        }
    };

    const toggleGoal = (id) => {
        const updatedGoals = goals.map(g => g._id === id || g.id === id ? { ...g, completed: !g.completed } : g);
        setGoals(updatedGoals);
        saveTracker(updatedGoals, notes);
    };

    const addGoal = (e) => {
        e.preventDefault();
        if(!newGoal.trim()) return;
        const updatedGoals = [...goals, { id: Date.now().toString(), text: newGoal, completed: false }];
        setGoals(updatedGoals);
        setNewGoal('');
        saveTracker(updatedGoals, notes);
    };

    const handleSaveNotes = () => {
        saveTracker(goals, notes);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="text-white text-xl">Loading tracker...</div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary" /> Daily Tracker
                </h2>
                <p className="text-ice/70">Set your daily goals, track your progress, and take learning notes.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Goals Section */}
                <div className="glass rounded-2xl p-6 border border-border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">Today's Goals</h3>
                        <span className="text-sm bg-primary/20 text-primary px-3 py-1 rounded-full font-medium border border-primary/30">
                            {goals.filter(g => g.completed).length} / {goals.length} Completed
                        </span>
                    </div>

                    <form onSubmit={addGoal} className="mb-6 flex gap-2">
                        <input 
                            type="text" 
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            placeholder="Add a new goal for today..." 
                            className="flex-1 bg-navy-light/40 border border-border/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky/50 transition-colors"
                        />
                        <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
                            Add
                        </button>
                    </form>

                    <div className="space-y-3">
                        {goals.length === 0 ? (
                            <p className="text-ice/50 text-center py-4">No goals for today yet.</p>
                        ) : goals.map((goal, i) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={goal._id || goal.id} 
                                onClick={() => toggleGoal(goal._id || goal.id)}
                                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${goal.completed ? 'bg-green-400/5 border-green-400/20' : 'bg-navy-light/30 border-border/50 hover:bg-navy-light/60'}`}
                            >
                                {goal.completed ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                                ) : (
                                    <Circle className="w-6 h-6 text-ice/40 flex-shrink-0" />
                                )}
                                <span className={`flex-1 font-medium ${goal.completed ? 'text-ice/50 line-through' : 'text-white'}`}>
                                    {goal.text}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Notes Section */}
                <div className="glass rounded-2xl p-6 border border-border flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-sky" /> Learning Summary
                        </h3>
                        <button onClick={handleSaveNotes} disabled={saving} className="flex items-center gap-2 text-sm bg-navy-light/50 hover:bg-navy-light/80 border border-border/50 text-white px-3 py-1.5 rounded-lg transition-colors">
                            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>

                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="flex-1 w-full bg-navy-light/20 border border-border/30 rounded-xl p-4 text-ice/90 leading-relaxed focus:outline-none focus:border-sky/50 transition-colors resize-none min-h-[300px]"
                        placeholder="Write down what you learned today, algorithms you discovered, or concepts you need to revise..."
                    />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default DailyTracker;
