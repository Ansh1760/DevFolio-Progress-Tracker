const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.getCodeforcesStats = async (username) => {
    if (!username) return null;
    
    try {
        const response = await fetchFn(`https://codeforces.com/api/user.info?handles=${username}`);
        
        if (!response.ok) {
            console.error(`Codeforces API returned ${response.status} for ${username}`);
            return { error: true, message: 'Unable to fetch data.' };
        }
        
        const data = await response.json();
        
        if (data && data.status === 'OK' && data.result && data.result.length > 0) {
            const user = data.result[0];
            return {
                username: user.handle,
                rating: user.rating || 0,
                maxRating: user.maxRating || 0,
                rank: user.rank || 'Unrated',
                maxRank: user.maxRank || 'Unrated',
                contribution: user.contribution || 0,
                friendOfCount: user.friendOfCount || 0,
                avatar: user.avatar,
                profileUrl: `https://codeforces.com/profile/${user.handle}`,
                lastSynced: new Date()
            };
        }
        
        return { error: true, message: 'Unable to fetch data. Check username.' };
    } catch (error) {
        console.error('Error fetching Codeforces stats:', error);
        return { error: true, message: 'Unable to fetch data.' };
    }
};
