'use client';

import React from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { formatNumber } from '@/utils/ui';
import type { LeaguesData } from '@/utils/types';

interface CurrentLeaguePopupProps {
  onClose: () => void;
  data: LeaguesData;
}

export default function CurrentLeaguePopup({ onClose, data }: CurrentLeaguePopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="bg-[#1d2025] rounded-t-3xl w-full max-w-xl overflow-hidden animate-slide-up max-h-[85vh] flex flex-col">
        <div className="px-4 py-3 flex justify-between items-center border-b border-[#3d4046] shrink-0">
          <h2 className="text-lg font-bold text-white">{data.currentTier} League</h2>
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#272a2f] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">This week (LP)</p>
              <p className="text-xl font-bold text-[#f3ba2f]">{formatNumber(data.weeklyPoints)} LP</p>
            </div>
            <div className="bg-[#272a2f] rounded-xl p-3 text-center">
              <p className="text-xs text-gray-400">Total (LP)</p>
              <p className="text-xl font-bold text-white">{formatNumber(data.totalPoints)} LP</p>
            </div>
            {(data.weeklyTeamPoints != null || data.totalTeamPoints != null) && (
              <>
                <div className="bg-[#272a2f] rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">This week (TP)</p>
                  <p className="text-xl font-bold text-sky-300">{formatNumber(data.weeklyTeamPoints ?? 0)} TP</p>
                </div>
                <div className="bg-[#272a2f] rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Total (TP)</p>
                  <p className="text-xl font-bold text-sky-300/90">{formatNumber(data.totalTeamPoints ?? 0)} TP</p>
                </div>
              </>
            )}
          </div>
          {data.rankInTier != null && (
            <p className="text-sm text-gray-400 mb-2">Your rank in {data.currentTier}: #{data.rankInTier}</p>
          )}
          <h3 className="text-[#f3ba2f] font-semibold mb-2">Tier leaderboard (this week)</h3>
          <ul className="space-y-2">
            {data.tierLeaderboard.map((row) => (
              <li key={row.rank} className="flex justify-between items-center py-2 border-b border-[#2d2f38]/50">
                <span className="text-gray-400 w-8">#{row.rank}</span>
                <span className="text-white flex-1 truncate ml-2">{row.name}</span>
                <span className="text-[#f3ba2f] font-medium">{formatNumber(row.leaguePoints)} LP</span>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="w-full mt-4 py-3 rounded-xl bg-[#272a2f] text-white font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}
