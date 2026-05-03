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

/** Rank badge on light URA panels (matches Learn card contrast). */
function rankStyleLight(rank: number): string {
  if (rank === 1) return 'text-amber-800 bg-amber-100 border-amber-400';
  if (rank === 2) return 'text-slate-800 bg-slate-200 border-slate-400';
  if (rank === 3) return 'text-orange-900 bg-orange-100 border-orange-400';
  return 'text-[#335f97] bg-[#dbe9ff] border-[#8bb4ef]/60';
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
    <div className="bg-[#0f3c86] min-h-screen pb-28 flex justify-center">
      <div className="w-full max-w-xl px-4 pt-4">
        <div className="rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-4 mb-4 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-xl border border-[#3f6db5] bg-white p-3 shadow-sm">
              <Image src={navGuild} alt="" width={56} height={56} className="object-contain" />
            </div>
            <div>
              <h1 className="text-[#16427f] text-2xl font-bold tracking-tight">Citizen Guild</h1>
              <p className="text-[#335f97] text-sm mt-1 font-medium leading-relaxed max-w-md mx-auto">
                Uganda Revenue Authority · Fiscal Fun community. Grow your circle, climb national and area boards, and
                earn pearl rewards for every friend who joins.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-blue-100 py-12 text-sm">Loading guild…</p>
        ) : error ? (
          <p className="text-center text-rose-200 py-8 text-sm">{error}</p>
        ) : (
          <>
            {me ? (
              <section
                className="mb-4 rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-4"
                aria-label="Your guild standing"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[#123f78] mb-3">Your standing</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-white border border-[#dbe9ff] p-3 shadow-sm">
                    <p className="text-[#335f97] text-xs font-semibold">National rank</p>
                    <p className="text-xl text-[#16427f] font-bold tabular-nums mt-1">
                      #{me.globalRank}
                      <span className="text-[#335f97] text-sm font-normal"> / {formatNumber(me.totalPlayers)}</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-[#dbe9ff] p-3 shadow-sm">
                    <p className="text-[#335f97] text-xs font-semibold">Pearl points</p>
                    <p className="text-xl text-amber-800 tabular-nums mt-1 flex items-center justify-center gap-1 font-bold">
                      <Image src={pearlWhite} alt="" width={18} height={18} className="object-contain" />
                      {formatNumber(me.points)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white border border-[#dbe9ff] p-3 shadow-sm">
                    <p className="text-[#335f97] text-xs font-semibold">Friends invited</p>
                    <p className="text-xl text-[#16427f] font-bold tabular-nums mt-1">{me.referralCount}</p>
                  </div>
                  <div className="rounded-xl bg-white border border-[#dbe9ff] p-3 shadow-sm">
                    <p className="text-[#335f97] text-xs font-semibold">Pearls from referrals</p>
                    <p className="text-xl text-amber-800 font-bold tabular-nums mt-1">{formatNumber(me.referralPearlsEarned)}</p>
                  </div>
                </div>
                {me.areaRank != null ? (
                  <p className="mt-3 text-xs text-[#335f97] leading-relaxed">
                    Area board ({me.regionLabel}): you are <span className="text-[#16427f] font-semibold">#{me.areaRank}</span> among
                    players in the same language group.
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-[#335f97]">Set your app language/region to appear on area boards.</p>
                )}
              </section>
            ) : null}

            <section className="mb-4" aria-label="Referrals">
              <h2 className="text-white text-lg font-bold mb-1">Referrals &amp; rewards</h2>
              <p className="text-blue-100 text-xs font-medium mb-3 leading-relaxed">
                You and each friend get white pearls when they start from your link. Premium friends earn a bigger bonus
                for both sides.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-3 hover:border-[#f3ba2f] transition-colors">
                  <Image src={baseGift} alt="" width={40} height={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#16427f]">Standard invite</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Image src={pearlWhite} alt="" width={16} height={16} className="object-contain" />
                      <span className="text-xs text-[#335f97]">
                        <span className="text-amber-800 font-semibold">+{formatNumber(REFERRAL_BONUS_BASE)}</span> each
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-3 hover:border-[#f3ba2f] transition-colors">
                  <Image src={bigGift} alt="" width={40} height={40} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#16427f]">Telegram Premium friend</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Image src={pearlWhite} alt="" width={16} height={16} className="object-contain" />
                      <span className="text-xs text-[#335f97]">
                        <span className="text-amber-800 font-semibold">+{formatNumber(REFERRAL_BONUS_PREMIUM)}</span> each
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-xl bg-[#f3ba2f] text-[#123f78] text-sm font-bold shadow-sm hover:brightness-105 active:brightness-95"
                >
                  Share invite
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-14 h-12 rounded-xl border-2 border-[#3f6db5] bg-[#0f315f] flex items-center justify-center text-blue-100 hover:bg-[#123f78] transition-colors"
                  aria-label="Copy invite link"
                >
                  {copyLabel === 'Copied!' ? <span className="text-[#f3ba2f] font-bold">✓</span> : <Copy />}
                </button>
              </div>
              {setCurrentView ? (
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setCurrentView('friends');
                  }}
                  className="mt-3 w-full py-2.5 text-sm font-semibold text-[#f4f8ff] border border-[#8bb4ef]/50 rounded-xl bg-[#0f315f] hover:border-[#f3ba2f] hover:bg-[#123f78] transition-colors"
                >
                  Open full friends list &amp; bonuses →
                </button>
              ) : null}
            </section>

            <section className="mb-4" aria-label="National leaderboard">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="text-white text-lg font-bold">Uganda · National pearl board</h2>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setShowRankings(true);
                  }}
                  className="text-xs font-semibold text-[#f3ba2f] shrink-0 hover:underline"
                >
                  Full table
                </button>
              </div>
              <p className="text-blue-100 text-xs mb-3 leading-relaxed">Top citizens by total pearl points across Fiscal Fun.</p>
              <ul className="rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] divide-y divide-[#dbe9ff] overflow-hidden shadow-sm">
                {nationalLeaders.map((u) => (
                  <li key={u.id} className="flex items-center gap-3 px-3 py-2.5 bg-white/60">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${rankStyleLight(u.rank)}`}
                    >
                      {u.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#16427f] truncate">{u.name}</p>
                      <p className="text-[10px] text-[#335f97] truncate">{u.regionLabel}</p>
                    </div>
                    <span className="text-sm text-amber-800 font-bold tabular-nums shrink-0">{formatNumber(u.points)}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-4" aria-label="Referral champions">
              <h2 className="text-white text-lg font-bold mb-1">Referral champions</h2>
              <p className="text-blue-100 text-xs mb-3">Players who brought the most friends into the guild.</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                {referralChampions.map((u) => (
                  <div
                    key={u.id}
                    className="min-w-[140px] rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] p-3 flex flex-col shadow-sm hover:border-[#f3ba2f] transition-colors"
                  >
                    <span
                      className={`text-[10px] font-bold w-6 h-6 rounded-md flex items-center justify-center border mb-2 ${rankStyleLight(u.rank)}`}
                    >
                      {u.rank}
                    </span>
                    <p className="text-xs font-semibold text-[#16427f] line-clamp-2 leading-snug">{u.name}</p>
                    <p className="text-lg text-[#123f78] font-bold mt-2 tabular-nums">{u.referrals ?? 0}</p>
                    <p className="text-[10px] text-[#335f97]">invites</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-4" aria-label="Area leaderboards">
              <h2 className="text-white text-lg font-bold mb-1">Area leaderboards</h2>
              <p className="text-blue-100 text-xs mb-3 leading-relaxed">
                Groups follow the app language / region codes in your profile. Compare ranks within your community
                cluster — the same filters power the global rankings explorer.
              </p>
              <div className="space-y-2">
                {areaBoards.map((board) => {
                  const open = expandedArea === board.regionCode;
                  return (
                    <div
                      key={board.regionCode}
                      className="rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] overflow-hidden shadow-sm hover:border-[#f3ba2f]/80 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback(window);
                          setExpandedArea(open ? null : board.regionCode);
                        }}
                        className="w-full flex items-center justify-between gap-2 px-3 py-3 text-left hover:bg-white/80"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#16427f] truncate">{board.regionLabel}</p>
                          <p className="text-[11px] text-[#335f97]">{formatNumber(board.memberCount)} members</p>
                        </div>
                        <span className="text-[#123f78] text-lg shrink-0 font-bold">{open ? '▾' : '▸'}</span>
                      </button>
                      {open ? (
                        <ul className="border-t border-[#dbe9ff] px-2 py-2 space-y-1 bg-white/50">
                          {board.leaders.map((u) => (
                            <li key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#f4f8ff]">
                              <span className="text-[10px] text-[#335f97] w-5 tabular-nums font-medium">#{u.rank}</span>
                              <span className="text-xs text-[#16427f] font-medium truncate flex-1">{u.name}</span>
                              <span className="text-xs text-amber-800 font-bold tabular-nums">{formatNumber(u.points)}</span>
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
              className="w-full py-2.5 text-sm font-semibold text-blue-100 border border-dashed border-[#3f6db5] rounded-xl hover:border-[#f3ba2f] hover:text-white transition-colors"
            >
              Refresh guild data
            </button>
          </>
        )}
      </div>
      {showRankings ? <GlobalRankingPopup onClose={() => setShowRankings(false)} /> : null}
    </div>
  );
}
