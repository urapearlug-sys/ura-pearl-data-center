'use client';

import KaribuDailyPopup from '@/components/KaribuDailyPopup';
import { consumeKaribuDailyBack } from '@/utils/karibu-navigation';

interface KaribuDailyPageProps {
  setCurrentView: (view: string) => void;
}

/** Full-view wrapper so Earn / deep links still open the small Karibu popup. */
export default function KaribuDailyPage({ setCurrentView }: KaribuDailyPageProps) {
  return (
    <div className="bg-[#0f3c86] min-h-screen">
      <KaribuDailyPopup
        onClose={() => {
          const v = consumeKaribuDailyBack();
          setCurrentView(v);
        }}
      />
    </div>
  );
}
