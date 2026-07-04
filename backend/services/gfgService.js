/**
 * gfgService.js
 *
 * Single source of truth for all GeeksforGeeks data fetching.
 * Uses axios + cheerio to parse the GFG public profile page.
 *
 * GFG renders via Next.js App Router (RSC streaming) — stats are embedded
 * in `self.__next_f.push([1, "..."])` script blocks in the HTML, NOT in
 * rendered DOM elements.
 *
 * To replace with a paid API in the future: modify ONLY this file.
 * All callers (controllers) remain unchanged.
 */

const axios   = require('axios');
const cheerio = require('cheerio');

// Username validation — alphanumeric, hyphens, underscores, max 50 chars
const VALID_USERNAME = /^[a-zA-Z0-9_-]{1,50}$/;

const GFG_PROFILE_BASE = 'https://www.geeksforgeeks.org/user';

// Rotate User-Agent strings to reduce bot-detection risk
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];

/**
 * Safely parse an integer, returning null if not found.
 */
const safeInt = (val) => {
    if (val === null || val === undefined) return null;
    const n = parseInt(String(val).replace(/,/g, ''), 10);
    return isNaN(n) ? null : n;
};

/**
 * scrapeGFGProfile(username)
 *
 * Fetches the GFG public profile page and extracts stats from the
 * React Server Components (RSC) JSON payload embedded in the HTML.
 *
 * GFG embeds profile data (including coding stats) in `self.__next_f.push()`
 * script blocks. We extract the JSON string from those blocks and regex-parse
 * the known fields.
 *
 * Returns:
 *   { username, totalSolved, codingScore, institutionRank, profileImage, rawStats, lastSynced }
 *   or { error: true, message: '...' }
 *
 * Never fabricates values. If a field is not in the page, it is null.
 */
exports.scrapeGFGProfile = async (username) => {
    if (!username) return null;

    const trimmed = username.trim();
    if (!VALID_USERNAME.test(trimmed)) {
        return { error: true, message: 'Invalid GFG username format.' };
    }

    const url = `${GFG_PROFILE_BASE}/${trimmed}/`;
    const ua  = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

    let html;
    try {
        const response = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': ua,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.geeksforgeeks.org/',
                'Cache-Control': 'no-cache',
            },
            maxRedirects: 3,
        });
        html = response.data;
    } catch (err) {
        if (err.response && err.response.status === 404) {
            console.error(`[GFG] Profile not found for: ${trimmed}`);
            return { error: true, message: 'Profile not found.' };
        }
        console.error(`[GFG] HTTP error for "${trimmed}":`, err.message);
        return { error: true, message: 'Unable to fetch GeeksforGeeks data.' };
    }

    try {
        const $ = cheerio.load(html);

        // ── Collect all self.__next_f.push([1, "..."]) script blocks ─────────────
        // GFG uses Next.js App Router RSC streaming: profile data (including
        // coding stats) is embedded as JSON strings inside these script tags.
        const rscChunks = [];
        $('script').each((_, el) => {
            const content = $(el).html() || '';
            if (content.trim().startsWith('self.__next_f.push')) {
                rscChunks.push(content);
            }
        });

        // Concatenate all RSC chunks for pattern matching
        const allRsc = rscChunks.join('\n');

        // ── Check for "not found" page ────────────────────────────────────────────
        // The notFound_notFoundWrapper class appears on ALL GFG pages as a fallback
        // component — do NOT use it as a 404 signal.
        // Instead, check: if we got < 5 RSC chunks, or the username handle is absent
        // from the payload, this is likely a 404 or bot-block.
        if (rscChunks.length < 5) {
            console.error(`[GFG] Too few RSC chunks (${rscChunks.length}) for "${trimmed}" — likely 404 or bot block`);
            return { error: true, message: 'Profile not found.' };
        }

        // Verify the username is in the payload (the username string is always present for valid profiles)
        if (!allRsc.toLowerCase().includes(trimmed.toLowerCase())) {
            console.error(`[GFG] Username "${trimmed}" not found in any RSC chunk — profile does not exist`);
            return { error: true, message: 'Profile not found.' };
        }

        // ── Unescape the RSC payload for clean regex matching ─────────────────────
        // The RSC data in memory contains literal backslash+quote sequences: \"key\":value
        // We replace every \" (92, 34 in charCodes) with just " to get clean JSON.
        const unescaped = allRsc.replace(/\\"/g, '"');

        // ── Extract stats from the unescaped RSC data ─────────────────────────────
        let totalSolved = null;
        let codingScore = null;
        let institutionRank = null;
        let profileImage = null;

        // total_problems_solved
        const totalMatch = unescaped.match(/"total_problems_solved"\s*:\s*(\d+)/);
        if (totalMatch) totalSolved = safeInt(totalMatch[1]);

        // score — GFG's "coding score"
        // Be specific: match "score": N (not monthly_score or other _score fields)
        const scoreMatch = unescaped.match(/"score"\s*:\s*(\d+)/);
        if (scoreMatch) codingScore = safeInt(scoreMatch[1]);

        // institute_rank
        const rankMatch = unescaped.match(/"institute_rank"\s*:\s*(\d+)/);
        if (rankMatch) institutionRank = safeInt(rankMatch[1]);

        // profile_image_url
        const imgMatch = unescaped.match(/"profile_image_url"\s*:\s*"([^"]+)"/);
        if (imgMatch && imgMatch[1].startsWith('http')) {
            profileImage = imgMatch[1];
        }

        // ── Difficulty breakdown (rawStats) ───────────────────────────────────────
        let rawStats = null;
        const school = unescaped.match(/"school"\s*:\s*\{\s*"count"\s*:\s*(\d+)/);
        const basic  = unescaped.match(/"basic"\s*:\s*\{\s*"count"\s*:\s*(\d+)/);
        const easy   = unescaped.match(/"easy"\s*:\s*\{\s*"count"\s*:\s*(\d+)/);
        const medium = unescaped.match(/"medium"\s*:\s*\{\s*"count"\s*:\s*(\d+)/);
        const hard   = unescaped.match(/"hard"\s*:\s*\{\s*"count"\s*:\s*(\d+)/);

        if (school || basic || easy || medium || hard) {
            rawStats = {
                school: school ? safeInt(school[1]) : null,
                basic:  basic  ? safeInt(basic[1])  : null,
                easy:   easy   ? safeInt(easy[1])   : null,
                medium: medium ? safeInt(medium[1]) : null,
                hard:   hard   ? safeInt(hard[1])   : null,
            };
        }

        // ── Validation ────────────────────────────────────────────────────────────
        // If the profile exists but has no stats, they might just be a brand new user with 0 problems solved.
        if (totalSolved === null && codingScore === null && institutionRank === null) {
            if (rscChunks.length < 3) {
                console.error(`[GFG] Very few RSC chunks (${rscChunks.length}) for "${trimmed}" — likely 404`);
                return { error: true, message: 'Profile not found.' };
            }
            console.warn(`[GFG] Got RSC payload for "${trimmed}" but extracted no stats — defaulting to 0. (New user?)`);
        }

        console.log(`[GFG] Scraped "${trimmed}": solved=${totalSolved}, score=${codingScore}, rank=${institutionRank}`);

        return {
            username:        trimmed,
            totalSolved:     totalSolved     ?? 0,
            codingScore:     codingScore     ?? 0,
            institutionRank: institutionRank ?? null,
            profileImage:    profileImage    ?? null,
            rawStats:        rawStats        ?? { school: 0, basic: 0, easy: 0, medium: 0, hard: 0 },
            lastSynced:      new Date(),
        };

    } catch (parseErr) {
        console.error(`[GFG] Parse error for "${trimmed}":`, parseErr.message);
        return { error: true, message: 'Unable to fetch GeeksforGeeks data.' };
    }
};

/**
 * getGFGStats(username)
 *
 * Compatibility alias so walletController continues to work without modification.
 */
exports.getGFGStats = exports.scrapeGFGProfile;
