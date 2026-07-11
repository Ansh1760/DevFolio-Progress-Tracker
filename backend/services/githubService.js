const fetchFn = typeof fetch !== 'undefined' ? fetch : (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.getGitHubStats = async (username) => {
    if (!username) return null;
    try {
        const headers = { 'User-Agent': 'DevFolio-App' };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }
        const response = await fetchFn(`https://api.github.com/users/${username}`, { headers });
        
        if (!response.ok) {
            console.error(`GitHub API returned ${response.status} for ${username}`);
            return { error: true, message: 'Unable to fetch data.' };
        }
        
        const data = await response.json();

        return {
            publicRepos: data.public_repos,
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
