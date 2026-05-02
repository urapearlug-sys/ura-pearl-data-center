'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { initUtils } from '@telegram-apps/sdk';
import { useGameStore } from '@/utils/game-mechanics';
import { REFERRAL_BONUS_BASE, REFERRAL_BONUS_PREMIUM } from '@/utils/consts';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { getUserTelegramId } from '@/utils/user';
import { buildInviteLink } from '@/utils/referral-invite';
import { navGuild, pearlWhite, baseGift, bigGift } from '@/images';
import Copy from '@/icons/Copy';
import { useToast } from '@/contexts/ToastContext';
import GlobalRankingPopup from '@/components/popups/GlobalRankingPopup';

type GuildLeader = {
  rank: number;
  id: string;
  name: string;
  telegramId: string;
  points: number;
  region: string | null;
  regionLabel: string;
  referrals?: number;
};

type AreaBoard = {
  regionCode: string;
  regionLabel: string;
  memberCount: number;
  leaders: GuildLeader[];
};

type MeSummary = {
  globalRank: number;
  totalPlayers: number;
  referralCount: number;
  referralPearlsEarned: number;
  points: number;
  region: string | null;
  regionLabel: string;
  areaRank: number | null;
};

interface GuildProps {
  setCurrentView?: (view: string) => void;
}

function rankStyle(rank: number): string {
  if (rank === 1) return 'text-amber-300 bg-amber-500/15 border-amber-500/40';
  if (rank === 2) return 'text-slate-200 bg-slate-400/15 border-slate-400/35';
  if (rank === 3) return 'text-orange-300 bg-orange-600/15 border-orange-500/35';
  return 'text-gray-400 bg-[#1a1c22] border-[#2d2f38]';
}

export default function Guild({ setCurrentView }: GuildProps) {
  const showToast = useToast();
  const { userTelegramInitData } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nationalLeaders, setNationalLeaders] = useState<GuildLeader[]>([]);
  const [referralChampions, setReferralChampions] = useState<GuildLeader[]>([]);
  const [areaBoards, setAreaBoards] = useState<AreaBoard[]>([]);
  const [me, setMe] = useState<MeSummary | null>(null);
  const [expandedArea, setExpandedArea] = useState<string | null>(null);
  const [showRankings, setShowRankings] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy link');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (userTelegramInitData) params.set('initData', userTelegramInitData);
      const res = await fetch(`/api/guild/overview?${params}`, { cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : 'Failed to load');
      setNationalLeaders(Array.isArray(data.nationalLeaders) ? data.nationalLeaders : []);
      setReferralChampions(Array.isArray(data.referralChampions) ? data.referralChampions : []);
      setAreaBoards(Array.isArray(data.areaBoards) ? data.areaBoards : []);
      setMe(data.me && typeof data.me === 'object' ? data.me : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load guild');
    } finally {
      setLoading(false);
    }
  }, [userTelegramInitData]);

  useEffect(() => {
    void load();
  }, [load]);

  const resolveTelegramId = useCallback(async (): Promise<string | null> => {
    if (typeof window !== 'undefined') {
      try {
        const WebApp = (await import('@twa-dev/sdk')).default;
        const id = WebApp.initDataUnsafe?.user?.id?.toString() ?? null;
        if (id) return id;
      } catch {
        // ignore
      }
    }
    return getUserTelegramId(userTelegramInitData);
  }, [userTelegramInitData]);

  const handleCopy = useCallback(async () => {
    triggerHapticFeedback(window);
    const userTelegramId = await resolveTelegramId();
    if (!userTelegramId) {
      showToast('Open from Telegram to copy your invite link.', 'error');
      return;
    }
    const inviteLink = buildInviteLink(userTelegramId);
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopyLabel('Copied!');
      showToast('Invite link copied!', 'success');
      setTimeout(() => setCopyLabel('Copy link'), 2000);
    } catch {
      showToast('Could not copy.', 'error');
    }
  }, [resolveTelegramId, showToast]);

  const handleShare = useCallback(async () => {
    const userTelegramId = await resolveTelegramId();
    if (!userTelegramId) {
      showToast('Open from Telegram to share.', 'error');
      return;
    }
    triggerHapticFeedback(window);
    const inviteLink = buildInviteLink(userTelegramId);
    const shareText =
      'Join the URA Fiscal Fun Guild on Telegram — play, learn, and earn white pearls with Uganda Revenue Authority. 🇺🇬✨';
    try {
      const utils = initUtils();
      const fullUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareText)}`;
      utils.openTelegramLink(fullUrl);
    } catch {
      showToast('Share is only available inside Telegram.', 'error');
    }
  }, [resolveTelegramId, showToast]);

  return (
    <div className="bg-black flex justify-center min-h-screen">
      <div className="w-full bg-black text-white font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="mt-[2px] bg-[#1d2025] rounded-t-[46px] min-h-[80vh] overflow-y-auto no-scrollbar pb-32">
            <div className="px-4 pt-5 pb-6">
              <div className="flex flex-col items-center gap-2 mb-6">
                <div className="rounded-2xl border border-[#2d2f38] bg-[#151821] p-3 shadow-lg">
                  <Image src={navGuild} alt="" width={56} height={56} className="object-contain" />
                </div>
                <h1 className="text-2xl text-center tracking-tight">Citizen Guild</h1>
                <p className="text-center text-sm text-gray-400 font-medium max-w-md leading-relaxed">
                  Uganda Revenue Authority · Fiscal Fun community. Grow your circle, climb national and area boards, and
                  earn pearl rewards for every friend who joins.
                </p>
              </div>

              {loading ? (
                <p className="text-center text-gray-500 py-12">Loading guild…</p>
              ) : error ? (
                <p className="text-center text-rose-400/90 py-8">{error}</p>
              ) : (
                <>
                  {me ? (
                    <section className="mb-6 rounded-2xl border border-violet-500/35 bg-gradient-to-br from-violet-950/40 to-[#151821] p-4" aria-label="Your guild standing">
                      <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-200/90 mb-3">Your standing</h2>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-black/25 border border-white/10 p-3">
                          <p className="text-gray-500 text-xs font-semibold">National rank</p>
                          <p className="text-xl text-white tabular-nums mt-1">
                            #{me.globalRank}
                            <span className="text-gray-500 text-sm font-normal"> / {formatNumber(me.totalPlayers)}</span>
                          </p>
                        </div>
                        <div className="rounded-xl bg-black/25 border border-white/10 p-3">
                          <p className="text-gray-500 text-xs font-semibold">Pearl points</p>
                          <p className="text-xl text-[#f3ba2f] tabular-nums mt-1 flex items-center gap-1">
                            <Image src={pearlWhite} alt="" width={18} height={18} className="object-contain" />
                            {formatNumber(me.points)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-black/25 border border-white/10 p-3">
                          <p className="text-gray-500 text-xs font-semibold">Friends invited</p>
                          <p className="text-xl text-white tabular-nums mt-1">{me.referralCount}</p>
                        </div>
                        <div className="rounded-xl bg-black/25 border border-white/10 p-3">
                          <p className="text-gray-500 text-xs font-semibold">Pearls from referrals</p>
                          <p className="text-xl text-[#f3ba2f] tabular-nums mt-1">{formatNumber(me.referralPearlsEarned)}</p>
                        </div>
                      </div>
                      {me.areaRank != null ? (
                        <p className="mt-3 text-xs text-gray-400">
                          Area board ({me.regionLabel}): you are <span className="text-white font-semibold">#{me.areaRank}</span> among
                          players in the same language group.
                        </p>
                      ) : (
                        <p className="mt-3 text-xs text-gray-500">Play with a set language/region to appear on area boards.</p>
                      )}
                    </section>
                  ) : null}

                  <section className="mb-6" aria-label="Referrals">
                    <h2 className="text-lg text-white mb-2">Referrals &amp; rewards</h2>
                    <p className="text-xs text-gray-500 font-medium mb-3">
                      You and each friend get white pearls when they start from your link. Premium friends earn a bigger
                      bonus for both sides.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-3 bg-[#272a2f] rounded-xl p-3 border border-[#2d2f38]">
                        <Image src={baseGift} alt="" width={40} height={40} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white">Standard invite</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Image src={pearlWhite} alt="" width={16} height={16} className="object-contain" />
                            <span className="text-xs text-gray-300">
                              <span className="text-[#f3ba2f]">+{formatNumber(REFERRAL_BONUS_BASE)}</span> each
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-[#272a2f] rounded-xl p-3 border border-[#2d2f38]">
                        <Image src={bigGift} alt="" width={40} height={40} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-white">Telegram Premium friend</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Image src={pearlWhite} alt="" width={16} height={16} className="object-contain" />
                            <span className="text-xs text-gray-300">
                              <span className="text-[#f3ba2f]">+{formatNumber(REFERRAL_BONUS_PREMIUM)}</span> each
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleShare}
                        className="flex-1 py-3 rounded-xl bg-[#2b4f98] text-white text-sm font-semibold"
                      >
                        Share invite
                      </button>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="w-14 h-12 rounded-xl bg-[#3d4046] flex items-center justify-center text-white"
                        aria-label="Copy invite link"
                      >
                        {copyLabel === 'Copied!' ? '✓' : <Copy />}
                      </button>
                    </div>
                    {setCurrentView ? (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback(window);
                          setCurrentView('friends');
                        }}
                        className="mt-3 w-full py-2 text-sm text-violet-300 font-semibold border border-violet-500/40 rounded-xl hover:bg-violet-500/10"
                      >
                        Open full friends list &amp; bonuses →
                      </button>
                    ) : null}
                  </section>

                  <section className="mb-6" aria-label="National leaderboard">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h2 className="text-lg text-white">Uganda · National pearl board</h2>
                      <button
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback(window);
                          setShowRankings(true);
                        }}
                        className="text-xs font-semibold text-cyan-300 shrink-0"
                      >
                        Full table
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">Top citizens by total pearl points across Fiscal Fun.</p>
                    <ul className="rounded-xl border border-[#2d2f38] bg-[#141821] divide-y divide-[#2d2f38] overflow-hidden">
                      {nationalLeaders.map((u) => (
                        <li key={u.id} className="flex items-center gap-3 px-3 py-2.5">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${rankStyle(u.rank)}`}
                          >
                            {u.rank}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-white truncate">{u.name}</p>
                            <p className="text-[10px] text-gray-500 truncate">{u.regionLabel}</p>
                          </div>
                          <span className="text-sm text-[#f3ba2f] tabular-nums shrink-0">{formatNumber(u.points)}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="mb-6" aria-label="Referral champions">
                    <h2 className="text-lg text-white mb-2">Referral champions</h2>
                    <p className="text-xs text-gray-500 mb-3">Players who brought the most friends into the guild.</p>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                      {referralChampions.map((u) => (
                        <div
                          key={u.id}
                          className="min-w-[140px] rounded-xl border border-[#2d2f38] bg-[#1a1c22] p-3 flex flex-col"
                        >
                          <span className={`text-[10px] font-bold w-6 h-6 rounded-md flex items-center justify-center border mb-2 ${rankStyle(u.rank)}`}>
                            {u.rank}
                          </span>
                          <p className="text-xs text-white font-semibold line-clamp-2 leading-snug">{u.name}</p>
                          <p className="text-lg text-cyan-300 mt-2 tabular-nums">{u.referrals ?? 0}</p>
                          <p className="text-[10px] text-gray-500">invites</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="mb-4" aria-label="Area leaderboards">
                    <h2 className="text-lg text-white mb-2">Area leaderboards</h2>
                    <p className="text-xs text-gray-500 mb-3">
                      Groups follow the app language / region codes in your profile. Compare ranks within your community
                      cluster — the same filters power the global rankings explorer.
                    </p>
                    <div className="space-y-2">
                      {areaBoards.map((board) => {
                        const open = expandedArea === board.regionCode;
                        return (
                          <div key={board.regionCode} className="rounded-xl border border-[#2d2f38] bg-[#141821] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHapticFeedback(window);
                                setExpandedArea(open ? null : board.regionCode);
                              }}
                              className="w-full flex items-center justify-between gap-2 px-3 py-3 text-left hover:bg-white/5"
                            >
                              <div className="min-w-0">
                                <p className="text-sm text-white font-semibold truncate">{board.regionLabel}</p>
                                <p className="text-[11px] text-gray-500">{formatNumber(board.memberCount)} members</p>
                              </div>
                              <span className="text-gray-500 text-lg shrink-0">{open ? '▾' : '▸'}</span>
                            </button>
                            {open ? (
                              <ul className="border-t border-[#2d2f38] px-2 py-2 space-y-1">
                                {board.leaders.map((u) => (
                                  <li key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#1d2025]/80">
                                    <span className="text-[10px] text-gray-500 w-5 tabular-nums">#{u.rank}</span>
                                    <span className="text-xs text-white truncate flex-1">{u.name}</span>
                                    <span className="text-xs text-[#f3ba2f] tabular-nums">{formatNumber(u.points)}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      void load();
                    }}
                    className="w-full py-2 text-sm text-gray-400 border border-dashed border-[#2d2f38] rounded-xl"
                  >
                    Refresh guild data
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showRankings ? <GlobalRankingPopup onClose={() => setShowRankings(false)} /> : null}
    </div>
  );
}
