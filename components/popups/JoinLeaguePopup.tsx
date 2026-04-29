'use client';

import React, { useState } from 'react';
import { triggerHapticFeedback } from '@/utils/ui';
import { useToast } from '@/contexts/ToastContext';

interface JoinLeaguePopupProps {
  onClose: () => void;
  onJoin: (inviteCode: string) => Promise<boolean>;
  onSuccess: () => void;
  initialCode?: string;
}

export default function JoinLeaguePopup({ onClose, onJoin, onSuccess, initialCode = '' }: JoinLeaguePopupProps) {
  const [code, setCode] = useState(initialCode);
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToast();

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      showToast('Enter invite code', 'error');
      return;
    }
    triggerHapticFeedback(window);
    setSubmitting(true);
    try {
      const ok = await onJoin(trimmed);
      if (ok) {
        showToast('Joined league!', 'success');
        onSuccess();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60">
      <div className="bg-[#1d2025] rounded-t-3xl w-full max-w-xl overflow-hidden animate-slide-up">
        <div className="px-4 py-3 flex justify-between items-center border-b border-[#3d4046]">
          <h2 className="text-lg font-bold text-white">Join league</h2>
          <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div className="p-4 pb-8">
          <label className="block text-sm text-gray-400 mb-2">Invite code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. ABC12XYZ"
            className="w-full bg-[#272a2f] border border-[#3d4046] rounded-lg px-4 py-3 text-white placeholder-gray-500 uppercase"
            maxLength={12}
          />
          <div className="flex gap-3 mt-4">
            <button type="button" onClick={() => { triggerHapticFeedback(window); onClose(); }} className="flex-1 py-3 rounded-xl bg-[#272a2f] text-gray-300 font-medium">Cancel</button>
            <button type="button" onClick={handleSubmit} disabled={submitting} className="flex-1 py-3 rounded-xl bg-[#f3ba2f] text-black font-bold disabled:opacity-50">{submitting ? 'Joining…' : 'Join'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
