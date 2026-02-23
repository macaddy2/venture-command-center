// ============================================================
// useGitHub Hook — Fetch and sync GitHub stats for ventures
// ============================================================
// Polls GitHub API on a configurable interval.
// Dispatches SET_GITHUB_STATS to update the store.
// ============================================================

import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../lib/store';
import { isGitHubConfigured, fetchRepoStats, fetchRecentCommits, fetchOpenPRs } from '../lib/github';
import type { GitHubStats } from '../lib/types';
import { generateId } from '../lib/utils';

interface RepoMapping {
    ventureId: string;
    owner: string;
    repo: string;
}

/**
 * Hook that polls GitHub for repo stats and updates the store.
 * @param repoMappings - Array of venture-to-repo mappings
 * @param intervalMs - Polling interval in ms (default 15 min)
 */
export function useGitHub(repoMappings: RepoMapping[], intervalMs: number = 15 * 60 * 1000) {
    const { dispatch } = useStore();
    const intervalRef = useRef<number | null>(null);

    const syncAll = useCallback(async () => {
        if (!isGitHubConfigured() || repoMappings.length === 0) return;

        const stats: GitHubStats[] = [];

        for (const { ventureId, owner, repo } of repoMappings) {
            try {
                const [repoStats, commits, prs] = await Promise.all([
                    fetchRepoStats(owner, repo),
                    fetchRecentCommits(owner, repo, 7),
                    fetchOpenPRs(owner, repo),
                ]);

                stats.push({
                    id: generateId(),
                    venture_id: ventureId,
                    repos: 1,
                    commits_7d: commits.count7d,
                    prs_open: prs.length,
                    issues_open: repoStats.openIssues,
                    last_activity: repoStats.updatedAt
                        ? new Date(repoStats.updatedAt).toLocaleDateString()
                        : '',
                    synced_at: new Date().toISOString(),
                });
            } catch (err) {
                console.warn(`[GitHub] Failed to sync ${owner}/${repo}:`, err); // eslint-disable-line no-console
            }
        }

        if (stats.length > 0) {
            dispatch({ type: 'SET_GITHUB_STATS', payload: stats });
        }
    }, [repoMappings, dispatch]);

    useEffect(() => {
        if (!isGitHubConfigured()) return;

        // Initial sync
        syncAll();

        // Set up polling
        intervalRef.current = window.setInterval(syncAll, intervalMs);

        return () => {
            if (intervalRef.current) window.clearInterval(intervalRef.current);
        };
    }, [syncAll, intervalMs]);

    return { syncAll, isConfigured: isGitHubConfigured() };
}

export default useGitHub;
