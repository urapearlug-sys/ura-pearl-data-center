// components/Settings.tsx

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

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/utils/game-mechanics';
import IceCubes from '@/icons/IceCubes';
import { useToast } from '@/contexts/ToastContext';
import Toggle from '@/components/Toggle';
import { triggerHapticFeedback } from '@/utils/ui';

interface SettingsProps {
    setCurrentView: (view: string) => void;
}

export default function Settings({ setCurrentView }: SettingsProps) {
    const showToast = useToast();
    const { pointsBalance } = useGameStore();

    const [vibrationEnabled, setVibrationEnabled] = useState(true);
    const [animationEnabled, setAnimationEnabled] = useState(true);

    useEffect(() => {
        const storedVibration = localStorage.getItem('vibrationEnabled');
        const storedAnimation = localStorage.getItem('animationEnabled');

        setVibrationEnabled(storedVibration !== 'false');
        setAnimationEnabled(storedAnimation !== 'false');
    }, []);

    const handleVibrationToggle = () => {
        const newValue = !vibrationEnabled;
        if (vibrationEnabled) {
            triggerHapticFeedback(window);
        }
        setVibrationEnabled(newValue);
        localStorage.setItem('vibrationEnabled', newValue.toString());
        showToast(newValue ? 'Vibration enabled' : 'Vibration disabled', 'success');
    };

    const handleAnimationToggle = () => {
        triggerHapticFeedback(window);
        const newValue = !animationEnabled;
        setAnimationEnabled(newValue);
        localStorage.setItem('animationEnabled', newValue.toString());
        showToast(newValue ? 'Animation enabled' : 'Animation disabled', 'success');
    };

    const handleBackToGame = () => {
        triggerHapticFeedback(window);
        setCurrentView('game');
    };

    return (
        <div className="bg-black flex justify-center min-h-screen">
            <div className="w-full bg-black text-white font-bold flex flex-col max-w-xl">
                <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
                    <div className="mt-[2px] bg-[#1d2025] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-1 pb-24">
                            <h1 className="text-2xl text-center mt-4">Settings</h1>

                            <div className="bg-[#272a2f] rounded-lg p-4 mt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <p>Touch vibration</p>
                                    <Toggle enabled={vibrationEnabled} setEnabled={handleVibrationToggle} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p>Floating points animation</p>
                                    <Toggle enabled={animationEnabled} setEnabled={handleAnimationToggle} />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    triggerHapticFeedback(window);
                                    if (typeof window !== 'undefined') window.sessionStorage.setItem('openHowToPlay', '1');
                                    setCurrentView('game');
                                }}
                                className="w-full mt-4 flex items-center justify-between bg-[#272a2f] rounded-lg p-4 text-left"
                            >
                                <span className="text-white">How to play</span>
                                <span className="text-2xl">📖</span>
                            </button>

                            <div className="mt-4">
                                <p className="text-gray-400 text-sm mb-2">Legal</p>
                                <div className="flex flex-col gap-2">
                                    <Link
                                        href="/clicker/privacy"
                                        onClick={() => triggerHapticFeedback(window)}
                                        className="flex items-center justify-between bg-[#272a2f] rounded-lg p-4 text-left"
                                    >
                                        <span className="text-white">Privacy Policy</span>
                                        <span className="text-[#f3ba2f]">→</span>
                                    </Link>
                                    <Link
                                        href="/clicker/terms"
                                        onClick={() => triggerHapticFeedback(window)}
                                        className="flex items-center justify-between bg-[#272a2f] rounded-lg p-4 text-left"
                                    >
                                        <span className="text-white">Terms of Service</span>
                                        <span className="text-[#f3ba2f]">→</span>
                                    </Link>
                                </div>
                            </div>

                            <button
                                onClick={handleBackToGame}
                                className="mx-auto block mt-4 text-center text-[#f3ba2f]"
                            >
                                Back to Game
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}