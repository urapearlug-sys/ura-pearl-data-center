// components/TopInfoSection.tsx

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

'use client'

import { useToast } from '@/contexts/ToastContext';
import IceCubes from '@/icons/IceCubes';
import Settings from '@/icons/Settings';
import { LEVELS } from '@/utils/consts';
import { useGameStore } from '@/utils/game-mechanics';
import { formatNumber, triggerHapticFeedback } from '@/utils/ui';
import Image from 'next/image';
import NotificationCenter from '@/components/NotificationCenter';

interface TopInfoSectionProps {
    isGamePage?: boolean;
    setCurrentView: (view: string) => void;
    onOpenMyProgress?: () => void;
}

export default function TopInfoSection({ isGamePage = false, setCurrentView, onOpenMyProgress }: TopInfoSectionProps) {
    const showToast = useToast();

    const {
        userTelegramName,
        gameLevelIndex,
        profitPerHour,
        totalDonatedPoints,
    } = useGameStore();

    const handleSettingsClick = () => {
        triggerHapticFeedback(window);
        setCurrentView('settings');
    };

    const handleOpenMyProgress = () => {
        triggerHapticFeedback(window);
        onOpenMyProgress?.();
    };

    const leftBlock = (
        <div className="flex items-center space-x-2">
            <div className="p-1 rounded-lg bg-[#1d2025]">
                <Image src={LEVELS[gameLevelIndex].smallImage} width={24} height={24} alt="Small Level Icon" />
            </div>
            <div>
                <p className="text-sm flex items-center gap-1">
                    {userTelegramName}
                    {totalDonatedPoints > 0 && (
                        <span className="text-amber-400" title="Donor">⭐</span>
                    )}
                </p>
            </div>
        </div>
    );

    return (
        <div className="px-4 z-10">
            <div className="flex items-center justify-between space-x-4 mt-4">
                <div className="flex items-center w-1/3">
                    {isGamePage && onOpenMyProgress ? (
                        <button type="button" onClick={handleOpenMyProgress} className="text-left">
                            {leftBlock}
                        </button>
                    ) : (
                        leftBlock
                    )}
                </div>
                <div className={`flex items-center w-fit ${isGamePage ? 'px-4' : 'px-8'} py-[2px] max-w-64`}>
                    {
                        isGamePage &&
                        <>
                            <div className="flex-1 text-center">
                                <p className="text-xs text-[#85827d] font-medium">Sync</p>
                                <div className="flex items-center justify-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1"></div>
                                </div>
                            </div>
                            <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                        </>
                    }
                    <div className="flex-1 text-center">
                        <p className="text-xs text-[#85827d] font-medium whitespace-nowrap overflow-hidden text-ellipsis">PEARLS per hour</p>
                        <div className="flex items-center justify-center space-x-1">
                            <IceCubes size={20} />
                            <p className="text-sm">+{formatNumber(profitPerHour)}</p>
                        </div>
                    </div>
                    {
                        isGamePage &&
                        <>
                            <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                            <div className="flex-1 flex items-center justify-center">
                                <NotificationCenter />
                            </div>
                            <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                            <button
                                onClick={handleSettingsClick}
                                className="flex-1 flex items-center justify-center text-white focus:outline-none"
                            >
                                <Settings className="w-6 h-6" />
                            </button>
                        </>
                    }
                </div>
            </div>
        </div>
    );
}