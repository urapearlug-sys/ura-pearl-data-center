// components/NotificationCenter.tsx
// In-app notification center: icon opens a panel listing active notifications

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { announcements } from '@/images';
import { triggerHapticFeedback } from '@/utils/ui';
import { getNotificationSeenIds, markNotificationsAsSeen } from '@/utils/notification-seen';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

function getSeenIds() {
  return getNotificationSeenIds();
}

function markAsSeen(ids: string[]) {
  markNotificationsAsSeen(ids);
}

function playNotificationSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // ignore if AudioContext not supported or user interaction required
  }
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [seenIds, setSeenIds] = useState<Set<string>>(() => getSeenIds());
  const panelRef = useRef<HTMLDivElement>(null);
  // null = newest (first) is expanded; otherwise the id of the expanded older notification
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const prevUnreadRef = useRef(0);

  // When notifications load or change, default to newest expanded
  useEffect(() => {
    setExpandedId(null);
  }, [notifications.length, notifications[0]?.id]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        // Normalize so imageUrl/videoUrl work whether API returns camelCase or snake_case
        setNotifications(
          list.map((n: Record<string, unknown>) => ({
            ...n,
            id: String(n.id ?? ''),
            title: String(n.title ?? ''),
            body: String(n.body ?? ''),
            imageUrl: (n.imageUrl ?? n.image_url ?? null) as string | null,
            videoUrl: (n.videoUrl ?? n.video_url ?? null) as string | null,
            isActive: Boolean(n.isActive ?? true),
            createdAt: String(n.createdAt ?? ''),
          })) as NotificationItem[]
        );
      }
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !seenIds.has(n.id)).length;

  useEffect(() => {
    if (prevUnreadRef.current === 0 && unreadCount > 0) {
      playNotificationSound();
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const id = setInterval(fetchNotifications, 60 * 1000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    setSeenIds(getSeenIds());
  }, [notifications]);

  useEffect(() => {
    if (open && notifications.length > 0) {
      const ids = notifications.map((n) => n.id);
      markAsSeen(ids);
      setSeenIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [open, notifications]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  const toggle = () => {
    triggerHapticFeedback(window);
    const willOpen = !open;
    if (willOpen && unreadCount > 0) playNotificationSound();
    setOpen((prev) => !prev);
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const sameDay = d.toDateString() === now.toDateString();
      if (sameDay) {
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
    } catch {
      return '';
    }
  };

  // Resolve relative URLs to absolute so images load in Telegram WebView / iframes
  const resolveMediaUrl = (url: string): string => {
    if (!url || typeof url !== 'string') return url;
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    if (typeof window !== 'undefined' && (trimmed.startsWith('/') || trimmed.startsWith('./'))) {
      const path = trimmed.startsWith('/') ? trimmed : trimmed.slice(1);
      return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
    }
    return trimmed;
  };

  return (
    <div className="relative flex items-center" ref={panelRef}>
      <button
        type="button"
        onClick={toggle}
        className="flex-1 flex items-center justify-center text-white focus:outline-none relative"
        aria-label="Notifications"
      >
        <Image src={announcements} alt="Notifications" width={24} height={24} className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] px-1 rounded-full bg-[#f3ba2f] text-black text-[10px] font-bold flex items-center justify-center" title="Unread notifications">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[min(320px,calc(100vw-2rem))] max-h-[70vh] overflow-hidden rounded-xl border border-[#2d2f38] bg-[#1d2025] shadow-xl z-50 flex flex-col">
          <div className="p-3 border-b border-[#2d2f38] flex items-center justify-between">
            <span className="font-semibold text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">({unreadCount} unread)</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white p-1"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="overflow-y-auto no-scrollbar flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-400 text-sm">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
            ) : (
              <ul className="divide-y divide-[#2d2f38]">
                {notifications.map((n, index) => {
                  const isNewest = index === 0;
                  const isExpanded = isNewest ? expandedId === null : expandedId === n.id;
                  const isTile = !isExpanded;

                  return (
                    <li key={n.id} className={isTile ? '' : 'p-3 hover:bg-[#272a2f]'}>
                      {isTile ? (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback(window);
                            setExpandedId(isNewest ? null : n.id);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-[#272a2f] flex items-center justify-between gap-2"
                        >
                          <span className="font-medium text-white text-sm truncate flex-1">{n.title}</span>
                          <span className="text-[10px] text-gray-500 flex-shrink-0">{formatDate(n.createdAt)}</span>
                        </button>
                      ) : (
                        <>
                          {n.imageUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden bg-[#1d2025]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={resolveMediaUrl(n.imageUrl)}
                                alt=""
                                className="w-full max-h-40 object-cover"
                                loading="lazy"
                              />
                            </div>
                          )}
                          {n.videoUrl && (
                            <div className="mb-2 rounded-lg overflow-hidden bg-[#1d2025]">
                              <video
                                src={resolveMediaUrl(n.videoUrl)}
                                controls
                                className="w-full max-h-48"
                                preload="metadata"
                              />
                            </div>
                          )}
                          <div className="font-medium text-white text-sm">{n.title}</div>
                          {n.body ? (
                            <p className="text-gray-400 text-xs mt-1 whitespace-pre-wrap break-words">{n.body}</p>
                          ) : null}
                          <div className="text-[10px] text-gray-500 mt-1">{formatDate(n.createdAt)}</div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
