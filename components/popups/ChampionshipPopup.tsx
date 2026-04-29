'use client';

import React from 'react';
import { triggerHapticFeedback } from '@/utils/ui';

interface ChampionshipPopupProps {
  onClose: () => void;
  nextWeek: string;
  topQualify: number;
  qualified: boolean;
}

export default function ChampionshipPopup({ onClose, nextWeek, topQualify, qualified }: ChampionshipPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="bg-[#1d2025] rounded-t-3xl w-full max-w-xl overflow-hidden animate-slide-up">
        <div className="px-4 py-3 flex justify-between items-center border-b border-[#3d4046]">
          <h2 className="text-lg font-bold text-[#f3ba2f]">AfroLumens Championship</h2>
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-4 pb-8">
          <p className="text-white font-medium mb-2">Every 8 weeks, top {topQualify} from Diamond & Legend leagues enter the Championship Event.</p>
          <ul className="text-gray-300 text-sm space-y-1 list-disc pl-5 mb-4">
            <li>Huge prize pool</li>
            <li>NFT trophy</li>
            <li>Public leaderboard</li>
          </ul>
          <p className="text-gray-400 text-sm">Next championship: Week {nextWeek}</p>
          {qualified && <p className="text-emerald-400 font-medium mt-2">You are in the running! Keep climbing.</p>}
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="w-full mt-4 py-3 rounded-xl bg-[#272a2f] text-white font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}
