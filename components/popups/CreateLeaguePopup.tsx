'use client';

import React, { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';
import { formatNumber } from '@/utils/ui';
import { LEAGUE_CREATION_FEE } from '@/utils/consts';
import { TERMS_AGREEMENT_LABEL_CREATOR } from '@/utils/teams-leagues-terms';

export interface TeamOption {
  id: string;
  name: string;
}

interface CreateLeaguePopupProps {
  onClose: () => void;
  /** Teams the user can use to create a league (only teams can create leagues). If empty, we show "Create a team first" and optional onOpenCreateTeam. */
  teams: TeamOption[];
  onCreate: (name: string, teamId: string, agreedToTerms: boolean) => Promise<{ inviteCode: string; inviteLink: string | null; name: string } | null>;
  onSuccess: () => void;
  userBalance?: number;
  /** When user has no team, call this when they tap "Create team" (e.g. close and open Create team popup) */
  onOpenCreateTeam?: () => void;
}

export default function CreateLeaguePopup({ onClose, teams, onCreate, onSuccess, userBalance, onOpenCreateTeam }: CreateLeaguePopupProps) {
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState(teams[0]?.id ?? '');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ inviteCode: string; inviteLink: string | null; name: string } | null>(null);
  const showToast = useToast();
  const canAfford = userBalance == null || userBalance >= LEAGUE_CREATION_FEE;
  const canCreate = teams.length > 0 && (teamId || teams[0]?.id);
  const noTeamYet = teams.length === 0;

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      showToast('Enter a league name', 'error');
      return;
    }
    const selectedTeamId = teamId || teams[0]?.id;
    if (!selectedTeamId) {
      showToast('Select a team. Only teams can create leagues.', 'error');
      return;
    }
    if (!canAfford) {
      showToast(`Commitment fee is ${formatNumber(LEAGUE_CREATION_FEE)} ALM. Your balance is insufficient.`, 'error');
      return;
    }
    if (!agreedToTerms) {
      showToast('You must agree to the Teams & Leagues Terms to create a league.', 'error');
      return;
    }
    triggerHapticFeedback(window);
    setSubmitting(true);
    try {
      const result = await onCreate(trimmed, selectedTeamId, true);
      if (result) {
        setCreated(result);
        onSuccess();
      }
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to create league', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => {
    if (!created?.inviteCode) return;
    triggerHapticFeedback(window);
    navigator.clipboard.writeText(created.inviteCode);
    showToast('Code copied', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="bg-[#1d2025] rounded-t-3xl w-full max-w-xl overflow-hidden animate-slide-up">
        <div className="px-4 py-3 flex justify-between items-center border-b border-[#3d4046]">
          <h2 className="text-lg font-bold text-white">Create league</h2>
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-4 pb-8">
          {noTeamYet ? (
            <>
              <p className="text-gray-300 text-sm mb-4">Only <strong className="text-white">teams</strong> can create leagues. Create a team first (1M ALM), then create a league with that team (10M ALM).</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="flex-1 py-3 rounded-xl bg-[#272a2f] text-gray-300 font-medium">Close</button>
                <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); onOpenCreateTeam?.(); }} className="flex-1 py-3 rounded-xl bg-[#f3ba2f] text-black font-bold">Create team</button>
              </div>
            </>
          ) : !created ? (
            <>
              <p className="text-sm text-amber-200/90 mb-3">
                Commitment fee: <strong className="text-white">{formatNumber(LEAGUE_CREATION_FEE)} ALM</strong> (only teams can create leagues)
              </p>
              {userBalance != null && (
                <p className="text-sm text-gray-400 mb-2">Your balance: {formatNumber(Math.floor(userBalance))} ALM</p>
              )}
              {teams.length > 1 && (
                <>
                  <label className="block text-sm text-gray-400 mb-2">Create league as team</label>
                  <select
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full bg-[#272a2f] border border-[#3d4046] rounded-lg px-4 py-3 text-white mb-3"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </>
              )}
              <label className="block text-sm text-gray-400 mb-2">League name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lagos Squad"
                className="w-full bg-[#272a2f] border border-[#3d4046] rounded-lg px-4 py-3 text-white placeholder-gray-500"
                maxLength={80}
              />
              <label className="flex items-start gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded border-[#3d4046] bg-[#272a2f] text-[#f3ba2f] focus:ring-[#f3ba2f]"
                />
                <span className="text-sm text-gray-300">{TERMS_AGREEMENT_LABEL_CREATOR}</span>
              </label>
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => { triggerHapticFeedback(window); onClose(); }}
                  className="flex-1 py-3 rounded-xl bg-[#272a2f] text-gray-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !canAfford || !canCreate || !agreedToTerms}
                  className="flex-1 py-3 rounded-xl bg-[#f3ba2f] text-black font-bold disabled:opacity-50"
                >
                  {submitting ? 'Creating…' : 'Create'}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-emerald-400 font-medium mb-2">League &quot;{created.name}&quot; created</p>
              <p className="text-sm text-gray-400 mb-2">Share this code so others can join:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={created.inviteCode}
                  className="flex-1 bg-[#272a2f] border border-[#3d4046] rounded-lg px-4 py-3 text-white text-lg font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={copyCode}
                  className="py-3 px-4 rounded-lg bg-[#f3ba2f] text-black font-semibold"
                >
                  Copy
                </button>
              </div>
              <button
                type="button"
                onClick={() => { triggerHapticFeedback(window); onClose(); }}
                className="w-full mt-4 py-3 rounded-xl bg-[#272a2f] text-white font-medium"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
