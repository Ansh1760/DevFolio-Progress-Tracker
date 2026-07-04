import React from 'react';
import { CheckCircle2, BadgeCheck } from 'lucide-react';

const ProfileBadge = ({ badgeType, className = 'w-5 h-5' }) => {
    if (!badgeType || badgeType === 'none') return null;

    if (badgeType === 'green_tick') {
        return (
            <div title="Verified Coder" className={`inline-flex items-center justify-center text-green-500 rounded-full ${className} shadow-[0_0_8px_rgba(34,197,94,0.4)] bg-green-500/10`}>
                <CheckCircle2 className="w-full h-full fill-green-500 text-white" />
            </div>
        );
    }

    if (badgeType === 'blue_tick') {
        return (
            <div title="Premium Verified Coder" className={`inline-flex items-center justify-center text-blue-500 rounded-full ${className} shadow-[0_0_10px_rgba(59,130,246,0.5)] bg-blue-500/10`}>
                <BadgeCheck className="w-full h-full fill-blue-500 text-white" />
            </div>
        );
    }

    return null;
};

export default ProfileBadge;
