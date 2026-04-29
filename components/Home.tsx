'use client';

import { useMemo, useState } from 'react';
import { useGameStore } from '@/utils/game-mechanics';
import { triggerHapticFeedback } from '@/utils/ui';

type HomeItem = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
};

const MOST_USED_ITEMS: HomeItem[] = [
  { id: 'profile', title: 'Profile', subtitle: 'Account & settings', route: 'settings' },
  { id: 'game', title: 'Game Hub', subtitle: 'Main gameplay', route: 'game' },
  { id: 'earn', title: 'Earn Tasks', subtitle: 'Complete activities', route: 'earn' },
  { id: 'services', title: 'Collection', subtitle: 'View assets', route: 'collection' },
  { id: 'friends', title: 'Friends', subtitle: 'Invite and track', route: 'friends' },
  { id: 'mine', title: 'Mine', subtitle: 'Upgrade production', route: 'mine' },
  { id: 'airdrop', title: 'Airdrop', subtitle: 'Wallet and claims', route: 'airdrop' },
];

const FAVORITE_ITEMS: HomeItem[] = [
  { id: 'fav-profile', title: 'Profile', subtitle: 'Account & settings', route: 'settings' },
  { id: 'fav-earn', title: 'Daily Rewards', subtitle: 'Top earning track', route: 'earn' },
  { id: 'fav-friends', title: 'Referrals', subtitle: 'Growth channel', route: 'friends' },
  { id: 'fav-collection', title: 'Collections', subtitle: 'Progress overview', route: 'collection' },
  { id: 'fav-mine', title: 'Mine Boost', subtitle: 'Income upgrades', route: 'mine' },
  { id: 'fav-airdrop', title: 'Airdrop Zone', subtitle: 'Token utilities', route: 'airdrop' },
  { id: 'fav-game', title: 'Quick Play', subtitle: 'Jump into game', route: 'game' },
];

interface HomeProps {
  setCurrentView: (view: string) => void;
}

export default function Home({ setCurrentView }: HomeProps) {
  const [activeTab, setActiveTab] = useState<'most_used' | 'favorites'>('most_used');
  const { userTelegramName } = useGameStore();

  const items = useMemo(
    () => (activeTab === 'most_used' ? MOST_USED_ITEMS : FAVORITE_ITEMS),
    [activeTab]
  );

  return (
    <div className="bg-black flex justify-center min-h-screen">
      <div className="w-full bg-black text-white flex flex-col max-w-xl pb-24">
        <div className="px-4 pt-4">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback(window);
              setCurrentView('settings');
            }}
            className="w-full rounded-2xl border border-[#2c2f38] bg-[#12141a] p-3 flex items-center gap-3 text-left hover:border-[var(--ura-yellow)] transition-colors"
          >
            <div className="w-10 h-10 rounded-full border border-[var(--ura-blue-medium)] bg-[#1f2330] flex items-center justify-center text-sm font-bold">
              {userTelegramName?.slice(0, 1)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-400">URA Platform · Profile</p>
              <p className="font-semibold truncate">{userTelegramName || 'Citizen'}</p>
            </div>
            <span className="text-[var(--ura-yellow)] text-sm font-semibold flex-shrink-0">Open</span>
          </button>

          <div className="mt-4 rounded-2xl border border-[var(--ura-blue-medium)] bg-gradient-to-r from-[var(--ura-blue-dark)] to-[var(--ura-blue-medium)] p-4 text-center">
            <p className="text-3xl font-black tracking-wide">PLAY, LEARN, EARN</p>
            <p className="text-sm text-blue-100 mt-1">Fiscal fun for URA Platform services</p>
          </div>

          <div className="mt-4 rounded-xl border border-[#2d2f38] bg-[#161923] p-1 grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                setActiveTab('most_used');
              }}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'most_used' ? 'bg-[var(--ura-blue-dark)] text-white' : 'text-gray-400'
              }`}
            >
              Most Used
            </button>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                setActiveTab('favorites');
              }}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === 'favorites' ? 'bg-[var(--ura-blue-dark)] text-white' : 'text-gray-400'
              }`}
            >
              Favorites
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  triggerHapticFeedback(window);
                  setCurrentView(item.route);
                }}
                className="rounded-xl border border-[#2d2f38] bg-[#151821] p-3 text-left hover:border-[var(--ura-yellow)] transition-colors"
              >
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-xs text-gray-400 mt-1">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
