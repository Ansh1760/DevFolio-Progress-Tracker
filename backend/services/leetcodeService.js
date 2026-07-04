const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.getLeetCodeStats = async (username) => {
    if (!username) return null;
    try {
        const graphqlQuery = {
            query: `
                query getUserProfile($username: String!) { 
                    matchedUser(username: $username) { 
                        submitStats: submitStatsGlobal { 
                            acSubmissionNum { 
                                difficulty 
                                count 
                            } 
                        } 
                        profile { 
                            ranking 
                        } 
                        userCalendar { 
                            submissionCalendar 
                        } 
                    } 
                }
            `,
            variables: { username }
        };

        const res = await fetchFn('https://leetcode.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            },
            body: JSON.stringify(graphqlQuery)
        });
        
        if (!res.ok) {
            console.error(`LeetCode API returned ${res.status} for ${username}`);
            return { error: true, message: 'Unable to fetch data.' };
        }
        
        const data = await res.json();
        
        if (!data?.data?.matchedUser) {
            return { error: true, message: 'User not found.' };
        }

        const matchedUser = data.data.matchedUser;
        const ac = matchedUser.submitStats?.acSubmissionNum || [];
        const easySolved = ac.find(item => item.difficulty === 'Easy')?.count || 0;
        const mediumSolved = ac.find(item => item.difficulty === 'Medium')?.count || 0;
        const hardSolved = ac.find(item => item.difficulty === 'Hard')?.count || 0;
        const totalSolved = ac.find(item => item.difficulty === 'All')?.count || 0;
        const ranking = matchedUser.profile?.ranking || 0;
        
        let submissionCalendar = null;
        try {
            if (matchedUser.userCalendar?.submissionCalendar) {
                submissionCalendar = JSON.parse(matchedUser.userCalendar.submissionCalendar);
            }
        } catch (err) {
            console.error("Error parsing leetcode calendar:", err);
        }
        
        return {
            totalSolved,
            easySolved,
            mediumSolved,
            hardSolved,
            ranking,
            submissionCalendar
        };
    } catch (error) {
        console.error('Error fetching LeetCode stats:', error);
        return { error: true, message: 'Unable to fetch data.' };
    }
};
