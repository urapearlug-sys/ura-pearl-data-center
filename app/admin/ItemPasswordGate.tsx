'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { unlockAdminSectionAction, type UnlockSectionState } from '@/app/admin/actions/unlock-section';

const SECTION_LABELS: Record<string, string> = {
  '/admin/accounts': 'User accounts',
  '/admin/bot-users': 'Bot Users',
  '/admin/tasks': 'Manage Tasks',
  '/admin/daily-cipher': 'Decode',
  '/admin/daily-combo': 'Matrix',
  '/admin/cards': 'Collection Cards',
  '/admin/weekly-event': 'Weekly Event',
  '/admin/onchain-tasks': 'Onchain Tasks',
  '/admin/export': 'Export User Data',
  '/admin/fees-collection': 'Fees Collection',
  '/admin/staking-audit': 'Staking audit',
  '/admin/league-management': 'League Management',
  '/admin/global-tasks': 'Global Joinable Tasks',
  '/admin/quiz': 'Mitroplus Quiz',
  '/admin/daily-pattern': 'Daily Pattern',
  '/admin/shop': 'Shop (Match 2 Earn)',
  '/admin/milestone-banners': 'Milestone Banners',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-ura-gold text-black font-medium py-2 rounded-lg hover:bg-[#e5a82a] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Checking…' : 'Continue'}
    </button>
  );
}

export default function ItemPasswordGate({ pathname }: { pathname: string }) {
  const [state, formAction] = useFormState<UnlockSectionState, FormData>(unlockAdminSectionAction, null);

  const sectionName = SECTION_LABELS[pathname] ?? pathname.replace('/admin/', '');

  return (
    <div className="min-h-screen bg-ura-panel flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h2 className="text-xl font-bold text-[#f3ba2f] mb-2 text-center">Section password</h2>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Enter the password to access <strong className="text-white">{sectionName}</strong>.
        </p>
        <form action={formAction} className="bg-ura-panel-2 rounded-xl p-6 space-y-4">
          <input type="hidden" name="pathname" value={pathname} />
          <div>
            <label htmlFor="item-password" className="block text-sm text-gray-400 mb-1">
              Password
            </label>
            <input
              id="item-password"
              name="password"
              type="password"
              placeholder="Section password"
              className="w-full bg-ura-panel border border-ura-border/75 rounded-lg px-3 py-2 text-white placeholder-gray-500"
              autoFocus
              required
            />
          </div>
          {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
          <SubmitButton />
        </form>
        <p className="text-gray-500 text-xs mt-4 text-center leading-relaxed">
          This is <strong className="text-gray-400">ADMIN_ITEM_PASSWORD</strong> in Vercel — not your main admin login
          password. After a successful unlock, sections stay open for 24 hours in this browser.
        </p>
      </div>
    </div>
  );
}
