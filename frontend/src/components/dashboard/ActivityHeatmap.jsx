import { useState, useMemo } from 'react';

const ActivityHeatmap = ({ activityDates = [], leetcodeCalendar = null }) => {
    // Generate data array for the last 365 days
    const { weeks, monthLabels, totalContributions } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Convert activityDates and leetcodeCalendar to a frequency map
        const activityMap = {};
        let total = 0;
        
        if (leetcodeCalendar) {
            Object.keys(leetcodeCalendar).forEach(timestampStr => {
                const ts = parseInt(timestampStr, 10);
                const count = leetcodeCalendar[timestampStr];
                
                const d = new Date(ts * 1000); // LeetCode gives seconds
                d.setHours(0, 0, 0, 0);
                
                activityMap[d.getTime()] = (activityMap[d.getTime()] || 0) + count;
                total += count;
            });
        }
        
        // Merge with local activity
        activityDates.forEach(dateString => {
            const d = new Date(dateString);
            d.setHours(0, 0, 0, 0);
            activityMap[d.getTime()] = (activityMap[d.getTime()] || 0) + 1;
            total++;
        });

        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 364);
        
        const startDayOfWeek = startDate.getDay(); // 0 = Sun, 6 = Sat

        const generatedWeeks = [];
        let currentWeek = [];

        // Pad first week
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push(null);
        }

        let currentMonth = -1;
        const labels = [];

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            currentWeek.push({
                date,
                count: activityMap[date.getTime()] || 0
            });

            if (currentWeek.length === 7) {
                generatedWeeks.push(currentWeek);
                
                // Determine month label for this week
                const firstValidDay = currentWeek.find(d => d !== null);
                if (firstValidDay) {
                    const month = firstValidDay.date.getMonth();
                    if (month !== currentMonth) {
                        labels.push(firstValidDay.date.toLocaleString('default', { month: 'short' }));
                        currentMonth = month;
                    } else {
                        labels.push('');
                    }
                } else {
                    labels.push('');
                }
                
                currentWeek = [];
            }
        }

        // Pad last week if needed
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push(null);
            }
            generatedWeeks.push(currentWeek);
            labels.push('');
        }

        return { weeks: generatedWeeks, monthLabels: labels, totalContributions: total };
    }, [activityDates, leetcodeCalendar]);

    const getColor = (count) => {
        if (count === 0) return 'bg-[#2b2b2b] border-[#2b2b2b]/20'; // Empty state
        if (count < 3) return 'bg-[#0e4429] border-[#0e4429]/50';   // Light green
        if (count < 7) return 'bg-[#006d32] border-[#006d32]/50';   // Medium green
        if (count < 12) return 'bg-[#26a641] border-[#26a641]/50';  // Bright green
        return 'bg-[#39d353] border-[#39d353]/50 shadow-[0_0_8px_rgba(57,211,83,0.3)]'; // Max green
    };

    return (
        <div className="card mb-8 overflow-hidden flex flex-col">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-6 gap-2">
                <div>
                    <h3 className="text-lg font-bold text-foreground">Coding Activity</h3>
                    <p className="text-text-muted text-sm mt-0.5">{totalContributions} submissions in the past one year</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-text-muted">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-[#2b2b2b]" />
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-[#0e4429]" />
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-[#006d32]" />
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-[#26a641]" />
                        <div className="w-3.5 h-3.5 rounded-[2px] bg-[#39d353]" />
                    </div>
                    <span>More</span>
                </div>
            </div>

            <div className="flex items-start">
                {/* Y-Axis (Days of week) */}
                <div className="flex flex-col gap-[5px] mr-2 mt-[22px] text-[10px] text-text-muted font-medium select-none">
                    <div className="h-3.5"></div>
                    <div className="h-3.5 flex items-center leading-none">Mon</div>
                    <div className="h-3.5"></div>
                    <div className="h-3.5 flex items-center leading-none">Wed</div>
                    <div className="h-3.5"></div>
                    <div className="h-3.5 flex items-center leading-none">Fri</div>
                    <div className="h-3.5"></div>
                </div>

                {/* Heatmap Grid */}
                <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                    {/* X-Axis (Months) */}
                    <div className="flex gap-[5px] mb-2 h-4 text-[11px] text-text-muted font-medium select-none">
                        {monthLabels.map((label, index) => (
                            <div key={index} className="w-3.5 overflow-visible whitespace-nowrap leading-none">
                                {label}
                            </div>
                        ))}
                    </div>

                    {/* Squares */}
                    <div className="flex gap-[5px]">
                        {weeks.map((week, i) => (
                            <div key={i} className="flex flex-col gap-[5px]">
                                {week.map((day, j) => {
                                    if (!day) return <div key={j} className="w-3.5 h-3.5" />;
                                    
                                    return (
                                        <div 
                                            key={j}
                                            className={`w-3.5 h-3.5 rounded-[2px] border ${getColor(day.count)} transition-all hover:ring-1 hover:ring-foreground/50 cursor-pointer`}
                                            title={`${day.count} submissions on ${day.date.toDateString()}`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.25);
                }
            `}</style>
        </div>
    );
};

export default ActivityHeatmap;
