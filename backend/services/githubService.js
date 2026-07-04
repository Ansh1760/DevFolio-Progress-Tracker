const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.getGitHubStats = async (username) => {
    if (!username) return null;
    try {
        const response = await fetchFn(`https://api.github.com/users/${username}`);
        if (!response.ok) {
            console.error(`GitHub API returned ${response.status} for ${username}`);
            return { error: true, message: 'Unable to fetch data.' };
        }
        const data = await response.json();

        // Fetch repos as requested
        let repoCount = data.public_repos;
        try {
            const reposResponse = await fetchFn(`https://api.github.com/users/${username}/repos`);
            if (reposResponse.ok) {
                const reposData = await reposResponse.json();
                if (Array.isArray(reposData)) {
                    repoCount = reposData.length;
                }
            }
        } catch (e) {
            console.error('Error fetching repos from GitHub:', e);
        }
        
        return {
            publicRepos: repoCount,
            followers: data.followers,
            following: data.following,
            avatarUrl: data.avatar_url,
            profileUrl: data.html_url
        };
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        return { error: true, message: 'Unable to fetch data.' };
    }
};
