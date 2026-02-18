// ============================================================
// GitHub API Client — Fetch repo stats, commits, and PRs
// ============================================================
// Reads VITE_GITHUB_TOKEN from env or localStorage.
// Falls back gracefully when no token is available.
// ============================================================

const GITHUB_API = 'https://api.github.com';

interface GitHubRepoStats {
    stars: number;
    forks: number;
    openIssues: number;
    watchers: number;
    defaultBranch: string;
    updatedAt: string;
}

interface GitHubCommitInfo {
    count7d: number;
    lastCommitMessage: string;
    lastCommitDate: string;
}

interface GitHubPR {
    number: number;
    title: string;
    state: string;
    created_at: string;
    user: string;
}

// Cache to avoid hammering the API
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
    const entry = cache.get(key);
    if (entry && Date.now() < entry.expiry) return entry.data as T;
    return null;
}

function setCache(key: string, data: unknown) {
    cache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

function getToken(): string {
    return import.meta.env.VITE_GITHUB_TOKEN || localStorage.getItem('vcc-github-token') || '';
}

export function isGitHubConfigured(): boolean {
    return !!getToken();
}

async function ghFetch<T>(path: string): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${GITHUB_API}${path}`, { headers });
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(`GitHub API ${res.status}: ${msg}`);
    }
    return res.json();
}

/**
 * Fetch basic repo stats (stars, forks, issues, etc.)
 */
export async function fetchRepoStats(owner: string, repo: string): Promise<GitHubRepoStats> {
    const cacheKey = `repo:${owner}/${repo}`;
    const cached = getCached<GitHubRepoStats>(cacheKey);
    if (cached) return cached;

    const data = await ghFetch<Record<string, unknown>>(`/repos/${owner}/${repo}`);
    const stats: GitHubRepoStats = {
        stars: data.stargazers_count as number,
        forks: data.forks_count as number,
        openIssues: data.open_issues_count as number,
        watchers: data.subscribers_count as number,
        defaultBranch: data.default_branch as string,
        updatedAt: data.updated_at as string,
    };
    setCache(cacheKey, stats);
    return stats;
}

/**
 * Fetch commit count for the last N days
 */
export async function fetchRecentCommits(
    owner: string,
    repo: string,
    days: number = 7,
): Promise<GitHubCommitInfo> {
    const cacheKey = `commits:${owner}/${repo}:${days}`;
    const cached = getCached<GitHubCommitInfo>(cacheKey);
    if (cached) return cached;

    const since = new Date(Date.now() - days * 86400000).toISOString();
    const data = await ghFetch<Array<Record<string, unknown>>>(
        `/repos/${owner}/${repo}/commits?since=${since}&per_page=100`,
    );

    const info: GitHubCommitInfo = {
        count7d: data.length,
        lastCommitMessage: data.length > 0
            ? ((data[0].commit as Record<string, unknown>)?.message as string || '').split('\n')[0]
            : '',
        lastCommitDate: data.length > 0
            ? (data[0].commit as Record<string, Record<string, unknown>>)?.author?.date as string || ''
            : '',
    };
    setCache(cacheKey, info);
    return info;
}

/**
 * Fetch open pull requests
 */
export async function fetchOpenPRs(owner: string, repo: string): Promise<GitHubPR[]> {
    const cacheKey = `prs:${owner}/${repo}`;
    const cached = getCached<GitHubPR[]>(cacheKey);
    if (cached) return cached;

    const data = await ghFetch<Array<Record<string, unknown>>>(
        `/repos/${owner}/${repo}/pulls?state=open&per_page=30`,
    );

    const prs: GitHubPR[] = data.map(pr => ({
        number: pr.number as number,
        title: pr.title as string,
        state: pr.state as string,
        created_at: pr.created_at as string,
        user: (pr.user as Record<string, unknown>)?.login as string || '',
    }));
    setCache(cacheKey, prs);
    return prs;
}

/**
 * Validate a GitHub token by making a test API call
 */
export async function validateToken(token: string): Promise<{ valid: boolean; username?: string; error?: string }> {
    try {
        const res = await fetch(`${GITHUB_API}/user`, {
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (res.ok) {
            const data = await res.json();
            return { valid: true, username: data.login };
        }
        return { valid: false, error: `HTTP ${res.status}` };
    } catch (err) {
        return { valid: false, error: (err as Error).message };
    }
}
