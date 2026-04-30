// components/Earn.tsx

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

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import IceCube from '@/icons/IceCube';
import { useGameStore } from '@/utils/game-mechanics';
import { ACTIVITY_TAB_CATEGORIES } from '@/utils/consts';
import { capitalizeFirstLetter, formatNumber, triggerHapticFeedback } from '@/utils/ui';
import { imageMap, getTaskImageSrc, dailyReward, dailyCipher, dailyCombo, baseGift, uraDailyPearlCoins } from '@/images';
import TaskPopup from './popups/TaskPopup';
import DailyLoginPopup from './popups/DailyLoginPopup';
import DailyCipherPopup from './popups/DailyCipherPopup';
import DailyComboPopup from './popups/DailyComboPopup';
import MiniGamesPopup from './popups/MiniGamesPopup';
import MiniGamesHubPopup from './popups/MiniGamesHubPopup';
import WeeklyEventPopup from './popups/WeeklyEventPopup';
import DonationPopup from './popups/DonationPopup';
import CreateLeaguePopup from './popups/CreateLeaguePopup';
import CreateTeamPopup from './popups/CreateTeamPopup';
import JoinTeamPopup from './popups/JoinTeamPopup';
import JoinLeaguePopup from './popups/JoinLeaguePopup';
import ChampionshipPopup from './popups/ChampionshipPopup';
import LeagueDetailPopup from './popups/LeagueDetailPopup';
import CurrentLeaguePopup from './popups/CurrentLeaguePopup';
import LeagueLevelsPopup from './popups/LeagueLevelsPopup';
import TeamLevelsPopup from './popups/TeamLevelsPopup';
import LeagueListPopup from './popups/LeagueListPopup';
import BrowseTeamsPopup from './popups/BrowseTeamsPopup';
import LeagueChallengesPopup from './popups/LeagueChallengesPopup';
import LeagueChallengeDetailPopup from './popups/LeagueChallengeDetailPopup';
import CreateLeagueChallengePopup from './popups/CreateLeagueChallengePopup';
import TeamChallengesPopup from './popups/TeamChallengesPopup';
import TeamChallengeDetailPopup from './popups/TeamChallengeDetailPopup';
import CreateTeamChallengePopup from './popups/CreateTeamChallengePopup';
import LeaguePointsTablePopup from './popups/LeaguePointsTablePopup';
import LeaguesGuidePopup from './popups/LeaguesGuidePopup';
import LeadershipDashboardPopup from './popups/LeadershipDashboardPopup';
import TeamMemberDashboardPopup from './popups/TeamMemberDashboardPopup';
import GlobalTasksPopup from './popups/GlobalTasksPopup';
import MitrolabsQuizPopup from './popups/MitrolabsQuizPopup';
import { Task, LeaguesData } from '@/utils/types';

interface EarnProps {
  setCurrentView?: (view: string) => void;
  openMoreDefault?: boolean;
  initialTab?: string;
  minimalOnly?: boolean;
}

const useFetchTasks = (userTelegramInitData: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`/api/tasks?initData=${encodeURIComponent(userTelegramInitData)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [userTelegramInitData]);

  return { tasks, setTasks, isLoading };
};

export default function Earn({ setCurrentView, openMoreDefault = false, initialTab = 'All', minimalOnly = false }: EarnProps) {
  const { userTelegramInitData, pointsBalance } = useGameStore();
  const { tasks, setTasks, isLoading } = useFetchTasks(userTelegramInitData);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDailyLogin, setShowDailyLogin] = useState(false);
  const [showDailyCipher, setShowDailyCipher] = useState(false);
  const [showDailyCombo, setShowDailyCombo] = useState(false);
  const [showMiniGames, setShowMiniGames] = useState(false);
  const [showMiniGamesHub, setShowMiniGamesHub] = useState(false);
  const [showWeeklyEvent, setShowWeeklyEvent] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [leaguesData, setLeaguesData] = useState<LeaguesData | null>(null);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [myTeams, setMyTeams] = useState<Array<{ id: string; name: string; isCreator: boolean }>>([]);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showJoinTeam, setShowJoinTeam] = useState(false);
  const [showCreateLeague, setShowCreateLeague] = useState(false);
  const [showJoinLeague, setShowJoinLeague] = useState(false);
  const [showChampionship, setShowChampionship] = useState(false);
  const [showLeagueDetailId, setShowLeagueDetailId] = useState<string | null>(null);
  const [joinLeagueInitialCode, setJoinLeagueInitialCode] = useState('');
  const [showLeaguesGuide, setShowLeaguesGuide] = useState(false);
  const [showLeagueLevels, setShowLeagueLevels] = useState(false);
  const [showBrowseLeagues, setShowBrowseLeagues] = useState(false);
  const [showBrowseTeams, setShowBrowseTeams] = useState(false);
  const [showTeamLevels, setShowTeamLevels] = useState(false);
  const [showLeagueChallenges, setShowLeagueChallenges] = useState(false);
  const [showLeagueChallengeDetailId, setShowLeagueChallengeDetailId] = useState<string | null>(null);
  const [showCreateLeagueChallenge, setShowCreateLeagueChallenge] = useState(false);
  const [showTeamChallenges, setShowTeamChallenges] = useState(false);
  const [showTeamChallengeDetailId, setShowTeamChallengeDetailId] = useState<string | null>(null);
  const [showCreateTeamChallenge, setShowCreateTeamChallenge] = useState(false);
  const [showLeaguePointsTable, setShowLeaguePointsTable] = useState(false);
  const [showLeadershipDashboard, setShowLeadershipDashboard] = useState(false);
  const [showTeamMemberDashboardId, setShowTeamMemberDashboardId] = useState<string | null>(null);
  const [showGlobalTasks, setShowGlobalTasks] = useState(false);
  const [showMitrolabsQuiz, setShowMitrolabsQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [whitePearlInput, setWhitePearlInput] = useState<string>('50');
  const [bluePearlInput, setBluePearlInput] = useState<string>('25');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (openMoreDefault) {
      setShowMoreMenu(true);
    }
  }, [openMoreDefault]);

  const ownedTeams = useMemo(() => myTeams.filter((t) => t.isCreator), [myTeams]);
  const memberTeam = useMemo(() => myTeams.find((t) => !t.isCreator), [myTeams]);
  const ownedLeagues = useMemo(() => leaguesData?.customLeagues?.filter((cl) => cl.isCreator) ?? [], [leaguesData?.customLeagues]);
  const hasLeadership = ownedTeams.length > 0 || ownedLeagues.length > 0;

  const fetchLeagues = useCallback(async () => {
    if (!userTelegramInitData) return;
    setLeaguesLoading(true);
    try {
      const res = await fetch(`/api/leagues?initData=${encodeURIComponent(userTelegramInitData)}`);
      if (res.ok) {
        const data = await res.json();
        setLeaguesData(data);
      }
    } catch {
      setLeaguesData(null);
    } finally {
      setLeaguesLoading(false);
    }
  }, [userTelegramInitData]);

  const fetchTeams = useCallback(async () => {
    if (!userTelegramInitData) return;
    try {
      const res = await fetch(`/api/teams?initData=${encodeURIComponent(userTelegramInitData)}`);
      if (res.ok) {
        const data = await res.json();
        setMyTeams((data.teams ?? []).map((t: { id: string; name: string; isCreator: boolean }) => ({ id: t.id, name: t.name, isCreator: t.isCreator })));
      } else {
        setMyTeams([]);
      }
    } catch {
      setMyTeams([]);
    }
  }, [userTelegramInitData]);

  useEffect(() => {
    if (activeTab === 'Leagues') {
      fetchLeagues();
      fetchTeams();
    }
  }, [activeTab, fetchLeagues, fetchTeams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('league');
    if (code && activeTab === 'Leagues') {
      setJoinLeagueInitialCode(code);
      setShowJoinLeague(true);
    }
  }, [activeTab]);

  const handleTaskSelection = useCallback((task: Task) => {
    if (!task.isCompleted) {
      triggerHapticFeedback(window);
      setSelectedTask(task);
    }
  }, []);

  const handleTaskUpdate = useCallback((updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(t =>
        t.id === updatedTask.id ? updatedTask : t
      )
    );
  }, [setTasks]);

  const displayTasks = useMemo(() => {
    const list =
      activeTab === 'All'
        ? tasks.filter((t) => t.type !== 'REFERRAL')
        : tasks.filter((t) => t.category === activeTab);
    return [...list].sort((a, b) => (a.isCompleted === b.isCompleted ? 0 : a.isCompleted ? 1 : -1));
  }, [activeTab, tasks]);

  const tabHasPending = useMemo(() => {
    const allTasksExcludingReferrals = tasks.filter((t) => t.type !== 'REFERRAL');
    const out: Record<string, boolean> = { All: allTasksExcludingReferrals.some((t) => !t.isCompleted) };
    ACTIVITY_TAB_CATEGORIES.forEach((cat) => {
      out[cat] = tasks.filter((t) => t.category === cat).some((t) => !t.isCompleted);
    });
    return out;
  }, [tasks]);

  const tabLabels = useMemo(() => ['All', ...ACTIVITY_TAB_CATEGORIES], []);
  const whitePearls = Math.max(0, Math.floor(Number(whitePearlInput) || 0));
  const bluePearls = Math.max(0, Math.floor(Number(bluePearlInput) || 0));
  const whiteToGoldish = Math.floor(whitePearls / 50);
  const blueToGoldish = Math.floor(bluePearls / 25);
  const totalGoldish = whiteToGoldish + blueToGoldish;

  const pearlConverterCard = (
    <div className="rounded-2xl border border-[#3d4046] bg-[#1a1c22] p-4">
      <h2 className="text-base font-bold text-white">Pearl Converter</h2>
      <p className="text-xs text-gray-400 mt-1">Use sample values to estimate Goldish output.</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'White', accent: 'text-slate-200' },
          { label: 'Blue', accent: 'text-[#5fa8ff]' },
          { label: 'Goldish', accent: 'text-[var(--ura-yellow)]' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[#2d2f38] bg-[#12141a] p-2 text-center">
            <Image src={uraDailyPearlCoins} alt={`${item.label} pearl`} width={42} height={42} className="mx-auto h-10 w-10 object-contain" />
            <p className={`text-[11px] font-semibold mt-1 ${item.accent}`}>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="rounded-lg border border-[#2d2f38] bg-[#12141a] p-2">
          <span className="text-[11px] text-gray-400">White pearls</span>
          <input
            type="number"
            min={0}
            value={whitePearlInput}
            onChange={(e) => setWhitePearlInput(e.target.value)}
            className="mt-1 w-full bg-transparent text-white text-sm outline-none"
          />
        </label>
        <label className="rounded-lg border border-[#2d2f38] bg-[#12141a] p-2">
          <span className="text-[11px] text-gray-400">Blue pearls</span>
          <input
            type="number"
            min={0}
            value={bluePearlInput}
            onChange={(e) => setBluePearlInput(e.target.value)}
            className="mt-1 w-full bg-transparent text-white text-sm outline-none"
          />
        </label>
      </div>

      <div className="mt-3 rounded-lg border border-[#2d2f38] bg-[#12141a] px-3 py-2 text-xs text-gray-300">
        <p>White conversion: <span className="text-white font-semibold">{whiteToGoldish}</span> Goldish ({whitePearls} / 50)</p>
        <p>Blue conversion: <span className="text-white font-semibold">{blueToGoldish}</span> Goldish ({bluePearls} / 25)</p>
        <p className="mt-1 text-[var(--ura-yellow)] font-semibold">Total estimated Goldish: {totalGoldish}</p>
      </div>
    </div>
  );

  const pearlCategoryCard = (
    <div className="mt-3 rounded-2xl border border-[#3d4046] bg-[#1a1c22] p-4">
      <h2 className="text-sm font-bold text-white">PEARL CATEGORIES</h2>
      <div className="mt-2 space-y-2 text-xs text-gray-300">
        <p><span className="text-white font-semibold">White</span> — no approval needed (activities like Karibu Daily, Quiz, and similar tasks).</p>
        <p><span className="text-[#5fa8ff] font-semibold">Blue</span> — earned from report-type activities and requires URA admin approval.</p>
        <p><span className="text-[var(--ura-yellow)] font-semibold">Goldish</span> — approved pearls, ready for withdrawal or transfer.</p>
      </div>
      <p className="mt-2 text-[11px] text-gray-400">
        Conversion rules: <span className="text-white">50 White = 1 Goldish</span> · <span className="text-white">25 Blue = 1 Goldish</span>
      </p>
    </div>
  );

  if (minimalOnly) {
    return (
      <div className="bg-black flex justify-center min-h-screen">
        <div className="w-full bg-black text-white font-bold flex flex-col max-w-xl">
          <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
            <div className="mt-[2px] bg-[#1d2025] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
              <div className="px-4 pt-6 pb-24">
                {pearlConverterCard}
                {pearlCategoryCard}
                <div className="flex justify-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowMoreMenu(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-[#272a2f] border border-[#3d4046] text-white hover:border-[#f3ba2f] transition-colors"
                  >
                    More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showMoreMenu && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
            <div className="w-full max-w-xl rounded-t-3xl bg-[#1d2025] border-t border-[#3d4046] p-4 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">More</h3>
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setShowMoreMenu(false);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Game', view: 'game' },
                  { name: 'Mine', view: 'mine' },
                  { name: 'Collection', view: 'collection' },
                  { name: 'Friends', view: 'friends' },
                  { name: 'Airdrop', view: 'airdrop' },
                ].map((item) => (
                  <button
                    key={item.view}
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowMoreMenu(false);
                      setCurrentView?.(item.view);
                    }}
                    className="rounded-xl border border-[#3d4046] bg-[#272a2f] py-3 text-white font-semibold hover:border-[#f3ba2f] transition-colors"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-black flex justify-center min-h-screen">
      <div className="w-full bg-black text-white font-bold flex flex-col max-w-xl">
        <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
          <div className="mt-[2px] bg-[#1d2025] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
            <div className="px-4 pt-1 pb-24">
              <div className="relative mt-4">
                <div className="flex justify-center mb-4">
                  <IceCube className="w-24 h-24 mx-auto" />
                </div>
                <h1 className="text-2xl text-center mb-2">Earn More ALM</h1>
                <p className="text-center text-[#f3ba2f] font-bold mb-4">
                  Balance: {formatNumber(Math.floor(pointsBalance))} ALM
                </p>
                <div className="mb-5">{pearlConverterCard}</div>
                {pearlCategoryCard}
                <div className="flex justify-center mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowMoreMenu(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#272a2f] border border-[#3d4046] text-white hover:border-[#f3ba2f] transition-colors"
                  >
                    More
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowDailyLogin(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#f3ba2f]/15 to-amber-500/20 border border-amber-500/40 hover:from-amber-500/25 hover:to-amber-500/25 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-amber-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center flex-shrink-0 ring-2 ring-amber-500/50">
                      <Image src={dailyReward} alt="Karibu Daily" width={28} height={28} className="rounded-lg" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-base font-bold text-white block">Karibu Daily</span>
                      <span className="text-xs text-amber-200/90">Asante Rewards</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowDailyCipher(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-cyan-500/15 to-cyan-500/20 border border-cyan-500/40 hover:from-cyan-500/25 hover:to-cyan-500/25 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-cyan-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center flex-shrink-0 ring-2 ring-cyan-500/50">
                      <Image src={dailyCipher} alt="Decode" width={28} height={28} className="rounded-lg" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-base font-bold text-white block">Decode</span>
                      <span className="text-xs text-cyan-200/90">Dot – Dash challenge</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowDailyCombo(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-violet-500/20 via-violet-500/15 to-violet-500/20 border border-violet-500/40 hover:from-violet-500/25 hover:to-violet-500/25 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-violet-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center flex-shrink-0 ring-2 ring-violet-500/50">
                      <Image src={dailyCombo} alt="Matrix" width={28} height={28} className="rounded-lg" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-base font-bold text-white block">Matrix</span>
                      <span className="text-xs text-violet-200/90">Pick 3 cards</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowMiniGames(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-emerald-500/15 to-emerald-500/20 border border-emerald-500/40 hover:from-emerald-500/25 hover:to-emerald-500/25 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-emerald-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center flex-shrink-0 ring-2 ring-emerald-500/50">
                      <span className="text-2xl" aria-hidden>🔐</span>
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-base font-bold text-white block">Daily Pattern</span>
                      <span className="text-xs text-emerald-200/90">Draw the pattern</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowWeeklyEvent(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 via-rose-500/15 to-rose-500/20 border border-rose-500/40 hover:from-rose-500/25 hover:to-rose-500/25 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-rose-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center flex-shrink-0 ring-2 ring-rose-500/50">
                      <Image src={baseGift} alt="Weekly Event" width={28} height={28} className="rounded-lg" />
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-base font-bold text-white block">Weekly Event</span>
                      <span className="text-xs text-rose-200/90">Challenge & leaderboard</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowDonation(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-500/20 via-emerald-500/15 to-teal-500/20 border border-teal-500/40 hover:from-teal-500/25 hover:to-teal-500/25 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-teal-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center flex-shrink-0 ring-2 ring-teal-500/50">
                      <span className="text-2xl" aria-hidden>❤️</span>
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-base font-bold text-white block">Donation Center</span>
                      <span className="text-xs text-teal-200/90">Donate ALM for charity</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowMiniGamesHub(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-indigo-500/20 border border-indigo-500/40 hover:from-indigo-500/25 hover:to-indigo-500/25 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-indigo-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center flex-shrink-0 ring-2 ring-indigo-500/50">
                      <span className="text-2xl" aria-hidden>🎮</span>
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-base font-bold text-white block">More</span>
                      <span className="text-xs text-indigo-200/90">Mini games hub</span>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      triggerHapticFeedback(window);
                      setShowMitrolabsQuiz(true);
                    }}
                    className="flex-1 min-w-[140px] flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border border-amber-500/40 hover:from-amber-500/25 hover:to-amber-500/25 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-amber-500/10"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#272a2f] flex items-center justify-center flex-shrink-0 ring-2 ring-amber-500/50">
                      <span className="text-2xl" aria-hidden>📝</span>
                    </div>
                    <div className="text-left min-w-0">
                      <span className="text-base font-bold text-white block">Mitroplus Quiz</span>
                      <span className="text-xs text-amber-200/90">Answer & earn ALM</span>
                    </div>
                  </button>
                </div>

                {/* Activities section – tabbed list (scroll down to see) */}
                <section
                  id="earn-activities"
                  className="mt-10 pt-6 border-t border-[#2d2f38]"
                  aria-label="Activities"
                >
                  <h2 className="text-xl font-bold text-white mb-4">Activities</h2>
                  {isLoading ? (
                    <div className="text-center text-gray-400 py-10">Loading activities...</div>
                  ) : (
                    <>
                      <div className="flex gap-1 p-1 rounded-xl bg-[#1a1c22] border border-[#2d2f38] mb-4">
                        {tabLabels.map((tab) => (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => {
                              triggerHapticFeedback(window);
                              setActiveTab(tab);
                            }}
                            className={`relative flex-1 min-w-0 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                              activeTab === tab
                                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                                : 'text-gray-400 hover:text-white hover:bg-[#272a2f]'
                            }`}
                          >
                            {capitalizeFirstLetter(tab)}
                            {tabHasPending[tab] && (
                              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#1a1c22]" aria-hidden />
                            )}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-3">
                        {activeTab === 'Leagues' ? (
                          <>
                            {leaguesLoading ? (
                              <div className="text-center text-gray-400 py-10">Loading leagues…</div>
                            ) : (
                              <div className="space-y-8">
                                {/* Grid 1: Your status */}
                                <section>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your status</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); if (leaguesData) setShowLeagueDetailId('current'); }}
                                      className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-left"
                                    >
                                      <span className="text-3xl">🏆</span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white">Current league</p>
                                        <p className="text-sm text-amber-200/90">{leaguesData?.currentTier ?? 'Bronze'} · {leaguesData?.weeklyPoints ?? 0} LP this week{(leaguesData?.weeklyTeamPoints ?? 0) > 0 ? ` · ${leaguesData?.weeklyTeamPoints ?? 0} TP` : ''}</p>
                                        {leaguesData?.rankInTier != null && (
                                          <p className="text-xs text-gray-400">Rank #{leaguesData.rankInTier} in tier</p>
                                        )}
                                      </div>
                                      <span className="text-gray-400">→</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowChampionship(true); }}
                                      className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 text-left"
                                    >
                                      <span className="text-3xl">🔥</span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white">AfroLumens Championship</p>
                                        <p className="text-sm text-rose-200/90">Top 100 Diamond & Legend · Every 8 weeks</p>
                                      </div>
                                      <span className="text-gray-400">→</span>
                                    </button>
                                  </div>
                                </section>

                                {/* Grid 2: Learn & levels */}
                                <section>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Learn & levels</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowLeagueLevels(true); }}
                                      className="flex items-center gap-3 p-4 rounded-xl bg-[#252836] border border-[#3d4046] text-left hover:border-amber-500/40 transition-colors"
                                    >
                                      <span className="text-2xl">📊</span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-white">League levels</p>
                                        <p className="text-xs text-gray-400">Bronze to Legend</p>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowTeamLevels(true); }}
                                      className="flex items-center gap-3 p-4 rounded-xl bg-[#252836] border border-[#3d4046] text-left hover:border-sky-500/40 transition-colors"
                                    >
                                      <span className="text-2xl">👥</span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-white">Team levels</p>
                                        <p className="text-xs text-gray-400">How teams work</p>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowLeaguePointsTable(true); }}
                                      className="flex items-center gap-3 p-4 rounded-xl bg-[#252836] border border-[#3d4046] text-left hover:border-[#f3ba2f]/40 transition-colors"
                                    >
                                      <span className="text-2xl">📈</span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-white">How to earn LP</p>
                                        <p className="text-xs text-gray-400">Activity table</p>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowLeaguesGuide(true); }}
                                      className="flex items-center gap-3 p-4 rounded-xl bg-[#252836] border border-[#3d4046] text-left hover:border-[#f3ba2f]/40 transition-colors"
                                    >
                                      <span className="text-2xl">📖</span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-white">User guide</p>
                                        <p className="text-xs text-gray-400">Tiers, LP, leagues</p>
                                      </div>
                                    </button>
                                  </div>
                                </section>

                                {/* Grid 3: Teams */}
                                <section>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Teams</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowCreateTeam(true); }}
                                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/10 border border-sky-500/30 text-left"
                                    >
                                      <span className="text-2xl">👥</span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-white">Create team</p>
                                        <p className="text-xs text-sky-200/90">1M ALM · Required for leagues</p>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowJoinTeam(true); }}
                                      className="flex items-center gap-3 p-4 rounded-xl bg-[#252836] border border-sky-500/30 text-left hover:border-sky-500/50"
                                    >
                                      <span className="text-2xl">🔗</span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-white">Join team</p>
                                        <p className="text-xs text-gray-400">Invite code · No fee</p>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowBrowseTeams(true); }}
                                      className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-[#252836] border border-[#3d4046] text-left hover:border-sky-500/40 transition-colors"
                                    >
                                      <span className="text-2xl">📋</span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white">Browse teams</p>
                                        <p className="text-sm text-gray-400">List · Request to join or get invite code</p>
                                      </div>
                                      <span className="text-gray-400">→</span>
                                    </button>
                                    {memberTeam && (
                                      <button
                                        type="button"
                                        onClick={() => { triggerHapticFeedback(window); setShowTeamMemberDashboardId(memberTeam.id); }}
                                        className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/10 border border-sky-500/30 text-left"
                                      >
                                        <span className="text-2xl">📊</span>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-bold text-white">Team dashboard</p>
                                          <p className="text-sm text-sky-200/90">{memberTeam.name} · Announcements, TP/LP, tasks</p>
                                        </div>
                                        <span className="text-gray-400">→</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowTeamChallenges(true); }}
                                      className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-left"
                                    >
                                      <span className="text-2xl">👥</span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white">Team vs Team</p>
                                        <p className="text-sm text-cyan-200/90">Challenge another team · First to target ALM wins prize</p>
                                      </div>
                                      <span className="text-gray-400">→</span>
                                    </button>
                                  </div>
                                </section>

                                {/* Grid 4: Leagues */}
                                <section>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Leagues</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowCreateLeague(true); }}
                                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-left"
                                    >
                                      <span className="text-2xl">➕</span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-white">Create league</p>
                                        <p className="text-xs text-emerald-200/90">10M ALM · Need a team</p>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setJoinLeagueInitialCode(''); setShowJoinLeague(true); }}
                                      className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/30 text-left"
                                    >
                                      <span className="text-2xl">🔗</span>
                                      <div className="min-w-0">
                                        <p className="font-bold text-white">Join league</p>
                                        <p className="text-xs text-violet-200/90">Enter invite code</p>
                                      </div>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowBrowseLeagues(true); }}
                                      className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-[#252836] border border-[#3d4046] text-left hover:border-violet-500/40 transition-colors"
                                    >
                                      <span className="text-2xl">📋</span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white">Browse leagues</p>
                                        <p className="text-sm text-gray-400">List, performance, members · Request to join</p>
                                      </div>
                                      <span className="text-gray-400">→</span>
                                    </button>
                                    {leaguesData?.customLeagues && leaguesData.customLeagues.length > 0 && (
                                      <>
                                        <p className="col-span-2 text-xs font-medium text-gray-500 mt-1">My leagues</p>
                                        {leaguesData.customLeagues.map((cl) => (
                                          <button
                                            key={cl.id}
                                            type="button"
                                            onClick={() => { triggerHapticFeedback(window); setShowLeagueDetailId(cl.id); }}
                                            className="col-span-2 flex items-center justify-between p-3 rounded-xl bg-[#252836] border border-[#2d2f38] text-left hover:border-violet-500/40"
                                          >
                                            <div>
                                              <p className="font-medium text-white">{cl.name}</p>
                                              <p className="text-xs text-gray-400">{cl.memberCount} members{cl.myRank != null ? ` · Rank #${cl.myRank}` : ''}{cl.myPoints != null ? ` · ${cl.myPoints} LP` : ''}</p>
                                            </div>
                                            <span className="text-gray-500">→</span>
                                          </button>
                                        ))}
                                      </>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowLeagueChallenges(true); }}
                                      className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-left"
                                    >
                                      <span className="text-2xl">⚔️</span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white">League Competition</p>
                                        <p className="text-sm text-amber-200/90">Teams competing · First to target ALM wins prize</p>
                                      </div>
                                      <span className="text-gray-400">→</span>
                                    </button>
                                  </div>
                                </section>

                                {/* Grid 5: Global competitions */}
                                <section>
                                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Global competitions</h3>
                                  <div className="grid grid-cols-2 gap-3">
                                    <button
                                      type="button"
                                      onClick={() => { triggerHapticFeedback(window); setShowGlobalTasks(true); }}
                                      className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-left"
                                    >
                                      <span className="text-2xl">🏆</span>
                                      <div className="min-w-0 flex-1">
                                        <p className="font-bold text-white">Joinable tasks</p>
                                        <p className="text-sm text-emerald-200/90">10 team + 10 league · Browse, invite opponent, stake · First to target wins</p>
                                      </div>
                                      <span className="text-gray-400">→</span>
                                    </button>
                                  </div>
                                </section>

                                {/* Grid 6: Management (if owner) */}
                                {hasLeadership && (
                                  <section>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Management</h3>
                                    <div className="grid grid-cols-2 gap-3">
                                      <button
                                        type="button"
                                        onClick={() => { triggerHapticFeedback(window); setShowLeadershipDashboard(true); }}
                                        className="col-span-2 flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/30 text-left"
                                      >
                                        <span className="text-2xl">⚙️</span>
                                        <div className="min-w-0 flex-1">
                                          <p className="font-bold text-white">Team / League management</p>
                                          <p className="text-sm text-violet-200/90">Members, announcements, mute, ban, opinions</p>
                                        </div>
                                        <span className="text-gray-400">→</span>
                                      </button>
                                    </div>
                                  </section>
                                )}
                              </div>
                            )}
                          </>
                        ) : displayTasks.length === 0 ? (
                          <div className="text-center text-gray-500 py-10 rounded-xl bg-[#1a1c22]/50 border border-[#2d2f38] px-4">
                            <p className="font-medium text-gray-400">No activities in this section.</p>
                          </div>
                        ) : (
                          displayTasks.map((task) => (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() => handleTaskSelection(task)}
                              className="w-full text-left flex items-center justify-between gap-3 rounded-xl p-4 bg-gradient-to-br from-[#252836] to-[#1e2029] border border-[#2d2f38] hover:border-violet-500/40 hover:from-[#2a2c38] hover:to-[#22242e] active:scale-[0.99] transition-all duration-200 shadow-lg"
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-11 h-11 rounded-xl bg-[#1a1c22] flex items-center justify-center flex-shrink-0 border border-[#2d2f38] overflow-hidden">
                                  {(() => {
                                    const imgSrc = getTaskImageSrc(task.image);
                                    return imgSrc ? (
                                      <Image src={imgSrc} alt={task.title} width={36} height={36} className="rounded-lg object-cover" />
                                    ) : (
                                    <IceCube className="w-6 h-6 text-[#f3ba2f]" />
                                    );
                                  })()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-white truncate">{task.title}</p>
                                  {task.type === 'REFERRAL' && task.taskData?.friendsNumber != null && (
                                    <p className="text-sm text-gray-400 mt-0.5">
                                      Number of friends (required): {Number(task.taskData.friendsNumber)}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <IceCube className="w-4 h-4 text-[#f3ba2f] flex-shrink-0" />
                                    <span className="text-sm font-medium text-[#f3ba2f]">{formatNumber(task.points)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                {task.isCompleted ? (
                                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                ) : (
                                  <span className="text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
      {selectedTask && (
        <TaskPopup
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskUpdate}
        />
      )}
      {showDailyLogin && (
        <DailyLoginPopup onClose={() => setShowDailyLogin(false)} />
      )}
      {showDailyCipher && (
        <DailyCipherPopup onClose={() => setShowDailyCipher(false)} />
      )}
      {showDailyCombo && (
        <DailyComboPopup onClose={() => setShowDailyCombo(false)} />
      )}
      {showMiniGames && (
        <MiniGamesPopup onClose={() => setShowMiniGames(false)} onlyGameId="pattern_dots" />
      )}
      {showMiniGamesHub && (
        <MiniGamesHubPopup onClose={() => setShowMiniGamesHub(false)} />
      )}
      {showMitrolabsQuiz && (
        <MitrolabsQuizPopup onClose={() => setShowMitrolabsQuiz(false)} />
      )}
      {showWeeklyEvent && (
        <WeeklyEventPopup onClose={() => setShowWeeklyEvent(false)} />
      )}
      {showDonation && (
        <DonationPopup onClose={() => setShowDonation(false)} />
      )}
      {showCreateTeam && (
        <CreateTeamPopup
          onClose={() => setShowCreateTeam(false)}
          userBalance={pointsBalance}
          onCreate={async (name, agreedToTerms) => {
            if (!userTelegramInitData) return null;
            const res = await fetch('/api/teams', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: userTelegramInitData, name, agreedToTerms }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            return { id: data.id, inviteCode: data.inviteCode, name: data.name };
          }}
          onSuccess={() => { fetchTeams(); fetchLeagues(); }}
        />
      )}
      {showJoinTeam && (
        <JoinTeamPopup
          onClose={() => setShowJoinTeam(false)}
          onJoin={async (inviteCode) => {
            if (!userTelegramInitData) return false;
            const res = await fetch('/api/teams/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: userTelegramInitData, inviteCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            return true;
          }}
          onSuccess={() => { fetchTeams(); fetchLeagues(); }}
        />
      )}
      {showCreateLeague && (
        <CreateLeaguePopup
          onClose={() => setShowCreateLeague(false)}
          teams={myTeams.filter((t) => t.isCreator).map((t) => ({ id: t.id, name: t.name }))}
          userBalance={pointsBalance}
          onOpenCreateTeam={() => { setShowCreateLeague(false); setShowCreateTeam(true); }}
          onCreate={async (name, teamId, agreedToTerms) => {
            if (!userTelegramInitData) return null;
            const res = await fetch('/api/leagues', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: userTelegramInitData, name, teamId, agreedToTerms }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            return { inviteCode: data.inviteCode, inviteLink: data.inviteLink, name: data.name };
          }}
          onSuccess={() => { fetchLeagues(); fetchTeams(); }}
        />
      )}
      {showJoinLeague && (
        <JoinLeaguePopup
          onClose={() => setShowJoinLeague(false)}
          initialCode={joinLeagueInitialCode}
          onJoin={async (inviteCode) => {
            if (!userTelegramInitData) return false;
            const res = await fetch('/api/leagues/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: userTelegramInitData, inviteCode }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
            return true;
          }}
          onSuccess={fetchLeagues}
        />
      )}
      {showChampionship && leaguesData && (
        <ChampionshipPopup
          onClose={() => setShowChampionship(false)}
          nextWeek={leaguesData.nextChampionshipWeek}
          topQualify={leaguesData.championship.topQualify}
          qualified={leaguesData.championship.qualified}
        />
      )}
      {showLeagueDetailId === 'current' && leaguesData && (
        <CurrentLeaguePopup data={leaguesData} onClose={() => setShowLeagueDetailId(null)} />
      )}
      {showLeagueDetailId && showLeagueDetailId !== 'current' && userTelegramInitData && (
        <LeagueDetailPopup
          leagueId={showLeagueDetailId}
          initData={userTelegramInitData}
          onClose={() => setShowLeagueDetailId(null)}
        />
      )}
      {showLeagueLevels && (
        <LeagueLevelsPopup onClose={() => setShowLeagueLevels(false)} />
      )}
      {showTeamLevels && (
        <TeamLevelsPopup onClose={() => setShowTeamLevels(false)} />
      )}
      {showBrowseTeams && (
        <BrowseTeamsPopup
          onClose={() => setShowBrowseTeams(false)}
          initData={userTelegramInitData}
          onOpenJoinTeam={() => { setShowBrowseTeams(false); setShowJoinTeam(true); }}
        />
      )}
      {showBrowseLeagues && userTelegramInitData && (
        <LeagueListPopup
          onClose={() => setShowBrowseLeagues(false)}
          initData={userTelegramInitData}
          onOpenLeague={(id) => { setShowBrowseLeagues(false); setShowLeagueDetailId(id); }}
        />
      )}
      {showLeagueChallenges && userTelegramInitData && (
        <LeagueChallengesPopup
          onClose={() => setShowLeagueChallenges(false)}
          initData={userTelegramInitData}
          onCreateChallenge={() => { setShowLeagueChallenges(false); setShowCreateLeagueChallenge(true); }}
          onViewChallenge={(id) => { setShowLeagueChallenges(false); setShowLeagueChallengeDetailId(id); }}
        />
      )}
      {showLeagueChallengeDetailId && userTelegramInitData && (
        <LeagueChallengeDetailPopup
          challengeId={showLeagueChallengeDetailId}
          onClose={() => setShowLeagueChallengeDetailId(null)}
          initData={userTelegramInitData}
          onAccept={() => setShowLeagueChallenges(true)}
        />
      )}
      {showTeamChallenges && userTelegramInitData && (
        <TeamChallengesPopup
          onClose={() => setShowTeamChallenges(false)}
          initData={userTelegramInitData}
          onCreateChallenge={() => { setShowTeamChallenges(false); setShowCreateTeamChallenge(true); }}
          onViewChallenge={(id) => { setShowTeamChallenges(false); setShowTeamChallengeDetailId(id); }}
        />
      )}
      {showTeamChallengeDetailId && userTelegramInitData && (
        <TeamChallengeDetailPopup
          challengeId={showTeamChallengeDetailId}
          onClose={() => setShowTeamChallengeDetailId(null)}
          initData={userTelegramInitData}
          onAccept={() => setShowTeamChallenges(true)}
        />
      )}
      {showCreateTeamChallenge && userTelegramInitData && (
        <CreateTeamChallengePopup
          onClose={() => setShowCreateTeamChallenge(false)}
          initData={userTelegramInitData}
          myTeams={myTeams}
          onCreate={async (params) => {
            const res = await fetch('/api/team-challenges', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: userTelegramInitData, ...params }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
          }}
          onSuccess={() => { setShowTeamChallenges(true); fetchTeams(); }}
        />
      )}
      {showCreateLeagueChallenge && userTelegramInitData && leaguesData && (
        <CreateLeagueChallengePopup
          onClose={() => setShowCreateLeagueChallenge(false)}
          initData={userTelegramInitData}
          myLeagues={leaguesData.customLeagues.map((cl) => ({ id: cl.id, name: cl.name, isCreator: cl.isCreator }))}
          onCreate={async (params) => {
            const res = await fetch('/api/league-challenges', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData: userTelegramInitData, ...params }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed');
          }}
          onSuccess={fetchLeagues}
        />
      )}
      {showLeaguePointsTable && (
        <LeaguePointsTablePopup onClose={() => setShowLeaguePointsTable(false)} />
      )}
      {showLeaguesGuide && (
        <LeaguesGuidePopup onClose={() => setShowLeaguesGuide(false)} />
      )}
      {showLeadershipDashboard && userTelegramInitData && (
        <LeadershipDashboardPopup
          onClose={() => setShowLeadershipDashboard(false)}
          initData={userTelegramInitData}
          ownedTeams={ownedTeams.map((t) => ({ id: t.id, name: t.name }))}
          ownedLeagues={ownedLeagues.map((l) => ({ id: l.id, name: l.name }))}
          onSuccess={() => { fetchLeagues(); fetchTeams(); }}
        />
      )}
      {showTeamMemberDashboardId && userTelegramInitData && (
        <TeamMemberDashboardPopup
          teamId={showTeamMemberDashboardId}
          teamName={myTeams.find((t) => t.id === showTeamMemberDashboardId)?.name ?? 'Team'}
          onClose={() => setShowTeamMemberDashboardId(null)}
          initData={userTelegramInitData}
        />
      )}
      {showGlobalTasks && (
        <GlobalTasksPopup
          onClose={() => setShowGlobalTasks(false)}
          initData={userTelegramInitData}
          myTeams={myTeams}
          myLeagues={leaguesData?.customLeagues?.map((cl) => ({ id: cl.id, name: cl.name, isCreator: cl.isCreator })) ?? []}
        />
      )}
      {showMoreMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70">
          <div className="w-full max-w-xl rounded-t-3xl bg-[#1d2025] border-t border-[#3d4046] p-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">More</h3>
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setShowMoreMenu(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Game', view: 'game' },
                { name: 'Mine', view: 'mine' },
                { name: 'Collection', view: 'collection' },
                { name: 'Friends', view: 'friends' },
                { name: 'Airdrop', view: 'airdrop' },
              ].map((item) => (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback(window);
                    setShowMoreMenu(false);
                    setCurrentView?.(item.view);
                  }}
                  className="rounded-xl border border-[#3d4046] bg-[#272a2f] py-3 text-white font-semibold hover:border-[#f3ba2f] transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}