'use client';

import React, { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import { formatNumber } from '@/utils/ui';
import {
  TEAM_CHALLENGE_MIN_STAKE,
  TEAM_CHALLENGE_MAX_STAKE,
  TEAM_CHALLENGE_MIN_TARGET_ALM,
  TEAM_CHALLENGE_MAX_TARGET_ALM,
  TEAM_CHALLENGE_MIN_DAYS,
  TEAM_CHALLENGE_MAX_DAYS,
} from '@/utils/consts';

interface MyTeam {
  id: string;
  name: string;
  isCreator: boolean;
}

interface CreateTeamChallengePopupProps {
  onClose: () => void;
  initData: string;
  myTeams: MyTeam[];
  onCreate: (params: { creatorTeamId: string; opponentTeamId: string; targetAlm: number; durationDays: number; stakePerTeam: number }) => Promise<void>;
  onSuccess: () => void;
}

export default function CreateTeamChallengePopup({ onClose, initData, myTeams, onCreate, onSuccess }: CreateTeamChallengePopupProps) {
  const [creatorTeamId, setCreatorTeamId] = useState(myTeams[0]?.id ?? '');
  const [opponentCode, setOpponentCode] = useState('');
  const [opponentTeam, setOpponentTeam] = useState<{ id: string; name: string } | null>(null);
  const [targetAlm, setTargetAlm] = useState(100_000_000);
  const [durationDays, setDurationDays] = useState(7);
  const [stakePerTeam, setStakePerTeam] = useState(30_000_000);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  const creatorTeams = myTeams.filter((t) => t.isCreator);
  if (myTeams.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-[#1d2025] rounded-2xl p-6 max-w-sm">
          <p className="text-gray-300 mb-4">Create or join a team first, then you can challenge another team.</p>
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="w-full py-2 rounded-lg bg-[#272a2f] text-white">Close</button>
        </div>
      </div>
    );
  }
  if (creatorTeams.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-[#1d2025] rounded-2xl p-6 max-w-sm">
          <p className="text-gray-300 mb-4">Only the creator of a team can start a challenge. Use a team you created.</p>
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="w-full py-2 rounded-lg bg-[#272a2f] text-white">Close</button>
        </div>
      </div>
    );
  }

  const handleLookup = async () => {
    const code = opponentCode.trim().toUpperCase();
    if (!code) {
      showToast('Enter opponent team invite code', 'error');
      return;
    }
    triggerHapticFeedback(window);
    setLookupLoading(true);
    setOpponentTeam(null);
    try {
      const res = await fetch(`/api/teams/by-code?code=${encodeURIComponent(code)}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Team not found');
      }
      const data = await res.json();
      setOpponentTeam({ id: data.id, name: data.name });
      showToast(`Found: ${data.name}`, 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Team not found', 'error');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!creatorTeamId || !opponentTeam) {
      showToast('Select your team and look up opponent team by code', 'error');
      return;
    }
    if (creatorTeamId === opponentTeam.id) {
      showToast('Cannot challenge your own team', 'error');
      return;
    }
    const target = Math.floor(targetAlm);
    const days = Math.floor(durationDays);
    const stake = Math.floor(stakePerTeam);
    if (target < TEAM_CHALLENGE_MIN_TARGET_ALM || target > TEAM_CHALLENGE_MAX_TARGET_ALM) {
      showToast(`Target must be ${formatNumber(TEAM_CHALLENGE_MIN_TARGET_ALM)} - ${formatNumber(TEAM_CHALLENGE_MAX_TARGET_ALM)} ALM`, 'error');
      return;
    }
    if (days < TEAM_CHALLENGE_MIN_DAYS || days > TEAM_CHALLENGE_MAX_DAYS) {
      showToast(`Duration must be ${TEAM_CHALLENGE_MIN_DAYS}-${TEAM_CHALLENGE_MAX_DAYS} days`, 'error');
      return;
    }
    if (stake < TEAM_CHALLENGE_MIN_STAKE || stake > TEAM_CHALLENGE_MAX_STAKE) {
      showToast(`Stake must be ${formatNumber(TEAM_CHALLENGE_MIN_STAKE)} - ${formatNumber(TEAM_CHALLENGE_MAX_STAKE)} ALM`, 'error');
      return;
    }
    triggerHapticFeedback(window);
    setSubmitting(true);
    try {
      await onCreate({ creatorTeamId, opponentTeamId: opponentTeam.id, targetAlm: target, durationDays: days, stakePerTeam: stake });
      onSuccess();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to create challenge', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center">
      <div className="bg-[#1d2025] rounded-t-3xl sm:rounded-2xl w-full max-w-xl overflow-hidden animate-slide-up sm:animate-none max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3d4046] shrink-0">
          <h2 className="text-lg font-bold text-white">Create team challenge</h2>
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="p-2 rounded-full text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-gray-400">Your team (you must be creator) stakes ALM. Opponent team creator must accept and stake the same to start. First to reach the target (or highest at the end) wins the full prize pool.</p>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Your team</label>
            <select
              value={creatorTeamId}
              onChange={(e) => setCreatorTeamId(e.target.value)}
              className="w-full bg-[#272a2f] border border-[#3d4046] rounded-lg px-3 py-2 text-white"
            >
              {creatorTeams.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Opponent team (invite code)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={opponentCode}
                onChange={(e) => { setOpponentCode(e.target.value.toUpperCase()); setOpponentTeam(null); }}
                placeholder="e.g. ABC12XYZ"
                className="flex-1 bg-[#272a2f] border border-[#3d4046] rounded-lg px-3 py-2 text-white placeholder-gray-500 font-mono"
              />
              <button type="button" onClick={handleLookup} disabled={lookupLoading} className="py-2 px-4 rounded-lg bg-[#272a2f] text-[#f3ba2f] font-medium disabled:opacity-50">{lookupLoading ? '…' : 'Look up'}</button>
            </div>
            {opponentTeam && <p className="text-sm text-emerald-400 mt-1">Opponent: {opponentTeam.name}</p>}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Target ALM (first to reach wins, or highest at end)</label>
            <input
              type="number"
              min={TEAM_CHALLENGE_MIN_TARGET_ALM}
              max={TEAM_CHALLENGE_MAX_TARGET_ALM}
              value={targetAlm}
              onChange={(e) => setTargetAlm(Number(e.target.value))}
              className="w-full bg-[#272a2f] border border-[#3d4046] rounded-lg px-3 py-2 text-white"
            />
            <p className="text-xs text-gray-500 mt-0.5">{formatNumber(TEAM_CHALLENGE_MIN_TARGET_ALM)} - {formatNumber(TEAM_CHALLENGE_MAX_TARGET_ALM)} ALM</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Duration (days)</label>
            <input
              type="number"
              min={TEAM_CHALLENGE_MIN_DAYS}
              max={TEAM_CHALLENGE_MAX_DAYS}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full bg-[#272a2f] border border-[#3d4046] rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Stake per team (ALM) – you pay this now; opponent pays on accept</label>
            <input
              type="number"
              min={TEAM_CHALLENGE_MIN_STAKE}
              max={TEAM_CHALLENGE_MAX_STAKE}
              value={stakePerTeam}
              onChange={(e) => setStakePerTeam(Number(e.target.value))}
              className="w-full bg-[#272a2f] border border-[#3d4046] rounded-lg px-3 py-2 text-white"
            />
            <p className="text-xs text-gray-500 mt-0.5">Prize pool = {formatNumber(stakePerTeam * 2)} ALM (others can add more)</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="flex-1 py-3 rounded-xl bg-[#272a2f] text-gray-300 font-medium">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={submitting || !opponentTeam} className="flex-1 py-3 rounded-xl bg-[#f3ba2f] text-black font-bold disabled:opacity-50">{submitting ? 'Creating…' : 'Create challenge'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
