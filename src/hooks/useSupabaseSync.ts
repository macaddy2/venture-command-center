// ============================================================
// Supabase Sync Hook — Bidirectional data sync
// ============================================================
// When Supabase is configured:
// 1. Loads data from Supabase on mount
// 2. Subscribes to realtime changes
// 3. Pushes local mutations to Supabase
// When not configured, falls back to localStorage (default).
// ============================================================

import { useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Venture, Task, Milestone } from '../lib/types';

type Dispatch = (action: { type: string; payload: unknown }) => void;

interface SyncOptions {
    dispatch: Dispatch;
    onSyncComplete?: () => void;
    onSyncError?: (error: Error) => void;
}

/**
 * Hook that synchronizes app state with Supabase when configured.
 * Returns helper functions for pushing mutations to the remote DB.
 */
export function useSupabaseSync({ dispatch, onSyncComplete, onSyncError }: SyncOptions) {
    const isInitialized = useRef(false);

    // ── Load all data from Supabase ──
    const loadFromSupabase = useCallback(async () => {
        if (!isSupabaseConfigured || !supabase) return;

        try {
            const tables = [
                { name: 'ventures', action: 'SET_VENTURES' },
                { name: 'tasks', action: 'SET_TASKS' },
                { name: 'milestones', action: 'SET_MILESTONES' },
                { name: 'team_roles', action: 'SET_TEAM_ROLES' },
                { name: 'registrations', action: 'SET_REGISTRATIONS' },
                { name: 'github_stats', action: 'SET_GITHUB_STATS' },
                { name: 'ai_insights', action: 'SET_AI_INSIGHTS' },
                { name: 'health_snapshots', action: 'SET_HEALTH_SNAPSHOTS' },
                { name: 'financials', action: 'SET_FINANCIALS' },
                { name: 'documents', action: 'SET_DOCUMENTS' },
                { name: 'risks', action: 'SET_RISKS' },
                { name: 'recurring_tasks', action: 'SET_RECURRING_TASKS' },
                { name: 'resource_sharing', action: 'SET_RESOURCE_SHARING' },
            ];

            for (const { name, action } of tables) {
                const { data, error } = await supabase.from(name).select('*');
                if (error) {
                    console.warn(`[Supabase Sync] Failed to load ${name}:`, error.message); // eslint-disable-line no-console
                    continue;
                }
                if (data && data.length > 0) {
                    dispatch({ type: action, payload: data });
                }
            }

            onSyncComplete?.();
        } catch (err) {
            console.error('[Supabase Sync] Error loading data:', err); // eslint-disable-line no-console
            onSyncError?.(err as Error);
        }
    }, [dispatch, onSyncComplete, onSyncError]);

    // ── Subscribe to realtime changes ──
    const subscribeToChanges = useCallback(() => {
        if (!isSupabaseConfigured || !supabase) return;

        const channel = supabase
            .channel('vcc-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ventures' }, (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    dispatch({ type: 'UPDATE_VENTURE', payload: payload.new as Venture });
                } else if (payload.eventType === 'DELETE') {
                    dispatch({ type: 'DELETE_VENTURE', payload: (payload.old as Venture).id });
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    dispatch({ type: 'UPDATE_TASK', payload: payload.new as Task });
                } else if (payload.eventType === 'DELETE') {
                    dispatch({ type: 'DELETE_TASK', payload: (payload.old as Task).id });
                }
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones' }, (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    dispatch({ type: 'UPDATE_MILESTONE', payload: payload.new as Milestone });
                } else if (payload.eventType === 'DELETE') {
                    dispatch({ type: 'DELETE_MILESTONE', payload: (payload.old as Milestone).id });
                }
            })
            .subscribe();

        return () => {
            supabase?.removeChannel(channel);
        };
    }, [dispatch]);

    // ── Push a mutation to Supabase ──
    const pushToSupabase = useCallback(async (
        table: string,
        operation: 'upsert' | 'delete',
        data: Record<string, unknown>,
    ) => {
        if (!isSupabaseConfigured || !supabase) return;

        try {
            if (operation === 'upsert') {
                const { error } = await supabase.from(table).upsert(data);
                if (error) console.warn(`[Supabase] Upsert ${table} failed:`, error.message); // eslint-disable-line no-console
            } else if (operation === 'delete' && data.id) {
                const { error } = await supabase.from(table).delete().eq('id', data.id);
                if (error) console.warn(`[Supabase] Delete ${table} failed:`, error.message); // eslint-disable-line no-console
            }
        } catch (err) {
            console.error(`[Supabase] Push to ${table} failed:`, err); // eslint-disable-line no-console
        }
    }, []);

    // ── Initialize on mount ──
    useEffect(() => {
        if (isInitialized.current) return;
        isInitialized.current = true;

        if (isSupabaseConfigured) {
            loadFromSupabase();
            const unsubscribe = subscribeToChanges();
            return unsubscribe;
        }
    }, [loadFromSupabase, subscribeToChanges]);

    return {
        isConfigured: isSupabaseConfigured,
        pushToSupabase,
        reloadFromSupabase: loadFromSupabase,
    };
}

export default useSupabaseSync;
