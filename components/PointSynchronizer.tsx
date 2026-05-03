// components/PointSynchronizer.tsx

/**
 * This project was developed by Nikandr Surkov.
 * You may not use this code if you purchased it from any source other than the official website https://nikandr.com.
 * If you purchased it from the official website, you may use it for your own projects,
 * but you may not resell it or publish it publicly.
 * 
 * Website: https://nikandr.com
 * YouTube: https://www.youtube.com/@NikandrSurkov
 * Telegram: https://t.me/nikandr_s
 * Telegram channel for news/updates: https://t.me/clicker_game_news
 * GitHub: https://github.com/nikandr-surkov
 */

'use client'

import { useEffect, useCallback, useRef, useState } from 'react';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import { notifyPearlBalancesRefresh } from '@/utils/pearl-balance-events';

// Same pattern as Settings/NotificationCenter: persist to localStorage so data survives close/reopen
const PENDING_SYNC_KEY = 'clicker_pending_sync';

export function PointSynchronizer() {
    const showToast = useToast();
    const {
        userTelegramInitData,
        energy,
        unsynchronizedPoints,
        points,
        pointsBalance,
        lastClickTimestamp,
        totalTaps,
        pointsPerClick,
        resetUnsynchronizedPoints,
        setPoints,
        setPointsBalance,
        setTotalTaps,
        setFrozenState,
    } = useGameStore();

    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const syncWithServer = useCallback(async () => {
        if (unsynchronizedPoints < 1 || isSyncing) return;
        setIsSyncing(true);
        const pointsToSync = unsynchronizedPoints;
        const syncTimestamp = Date.now();
        //showToast(`Trying to synchronize ${pointsToSync}`, 'success');

        try {
            console.log("Sending data to server:", {
                initData: userTelegramInitData,
                unsynchronizedPoints: pointsToSync,
                currentEnergy: energy,
                syncTimestamp,
            });

            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: userTelegramInitData,
                    unsynchronizedPoints: pointsToSync,
                    currentEnergy: energy,
                    syncTimestamp,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 403 && errorData.suspended) {
                    setFrozenState(true, errorData.suspensionReason || null);
                    return;
                }
                throw new Error(`Failed to sync with server: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log("Data from server: ", data);

            resetUnsynchronizedPoints(pointsToSync);
            if (typeof data.updatedPoints === 'number') setPoints(data.updatedPoints);
            if (typeof data.updatedPointsBalance === 'number') setPointsBalance(data.updatedPointsBalance);
            // Taps: use server value if present, else add taps from this sync so total never drops after sync
            const tapsFromThisSync = pointsPerClick > 0 ? Math.floor(pointsToSync / pointsPerClick) : 0;
            const minimumTotalTaps = totalTaps + tapsFromThisSync;
            const newTotalTaps = typeof data.updatedTotalTaps === 'number'
                ? Math.max(data.updatedTotalTaps, minimumTotalTaps)
                : minimumTotalTaps;
            setTotalTaps(newTotalTaps);
            try { localStorage.removeItem(PENDING_SYNC_KEY); } catch { /* ignore */ }
            notifyPearlBalancesRefresh();
            //showToast(`Successfully synchronized! Points synced: ${pointsToSync}`, 'success');
        } catch (error) {
            showToast(`Error syncing with server: ${error instanceof Error ? error.message : String(error)}`, 'error');
            console.error('Error syncing with server:', error);
        } finally {
            setIsSyncing(false);
        }
    }, [energy, isSyncing, points, pointsBalance, pointsPerClick, resetUnsynchronizedPoints, setPoints, setPointsBalance, setTotalTaps, setFrozenState, showToast, totalTaps, unsynchronizedPoints, userTelegramInitData]);

    // Sync every 600ms when there's pending
    useEffect(() => {
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
        }

        syncTimeoutRef.current = setTimeout(() => {
            if (unsynchronizedPoints >= 1) {
                syncWithServer();
            }
        }, 600);

        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [lastClickTimestamp, unsynchronizedPoints, syncWithServer]);

    // Persist pending to localStorage every 500ms while there's pending (survives force-close without visibility)
    useEffect(() => {
        if (unsynchronizedPoints < 1) return;
        const id = setInterval(() => {
            try {
                localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify({
                    unsynchronizedPoints,
                    points,
                    pointsBalance,
                    totalTaps,
                    savedAt: Date.now(),
                }));
            } catch { /* ignore */ }
        }, 500);
        return () => clearInterval(id);
    }, [unsynchronizedPoints, points, pointsBalance, totalTaps]);

    // Persist pending to localStorage when user leaves (same pattern as Settings / NotificationCenter)
    const pendingSyncRef = useRef({ initData: '', points: 0, energy: 0 });
    pendingSyncRef.current = {
        initData: userTelegramInitData,
        points: unsynchronizedPoints,
        energy,
    };

    useEffect(() => {
        const savePendingToStorage = () => {
            if (unsynchronizedPoints < 1) return;
            try {
                const payload = {
                    unsynchronizedPoints,
                    points,
                    pointsBalance,
                    totalTaps,
                    savedAt: Date.now(),
                };
                localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(payload));
            } catch { /* ignore */ }
        };

        const sendSyncBeacon = () => {
            if (isSyncing) return;
            const { initData, points: p, energy: e } = pendingSyncRef.current;
            if (p < 1 || !initData) return;
            savePendingToStorage();
            const url = typeof window !== 'undefined' ? `${window.location.origin}/api/sync` : '/api/sync';
            const body = JSON.stringify({
                initData,
                unsynchronizedPoints: p,
                currentEnergy: e,
                syncTimestamp: Date.now(),
            });
            navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' }));
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                savePendingToStorage();
                sendSyncBeacon();
            }
        };

        const handlePageHide = () => {
            savePendingToStorage();
            sendSyncBeacon();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('pagehide', handlePageHide);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('pagehide', handlePageHide);
        };
    }, [unsynchronizedPoints, isSyncing, points, pointsBalance, syncWithServer, totalTaps]);

    return null;
}