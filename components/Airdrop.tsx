// components/Airdrop.tsx

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

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { paidTrophy1, pearlWhite, tonWallet } from '@/images';
import { useTonConnectUI } from '@tonconnect/ui-react';
import Angle from '@/icons/Angle';
import Copy from '@/icons/Copy';
import Cross from '@/icons/Cross';
import Wallet from '@/icons/Wallet';
import { useGameStore } from '@/utils/game-mechanics';
import { useToast } from '@/contexts/ToastContext';
import IceCube from '@/icons/IceCube';
import { Address } from "@ton/core";
import { triggerHapticFeedback } from '@/utils/ui';
import OnchainTaskPopup from './popups/OnchainTaskPopup';
import GlobalRankingPopup from './popups/GlobalRankingPopup';
import TransfersSection from './TransfersSection';
import ShopSection from './ShopSection';

interface OnchainTask {
    id: string;
    smartContractAddress: string;
    price: string;
    collectionMetadata: {
        name: string;
        description: string;
        image: string;
    };
    itemMetadata: any;
    points: number;
    isActive: boolean;
    isCompleted: boolean;
}

type AirdropSection = 'airdrop' | 'market';

export default function Airdrop() {
    const [tonConnectUI] = useTonConnectUI();
    const { tonWalletAddress, setTonWalletAddress, userTelegramInitData } = useGameStore();
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const showToast = useToast();
    const [onchainTasks, setOnchainTasks] = useState<OnchainTask[]>([]);
    const [selectedOnchainTask, setSelectedOnchainTask] = useState<OnchainTask | null>(null);
    const [showRankings, setShowRankings] = useState(false);
    const [section, setSection] = useState<AirdropSection>('airdrop');
    const [marketSubView, setMarketSubView] = useState<'hub' | 'shop'>('hub');
    const [shopEnabled, setShopEnabled] = useState<boolean>(true);

    const fetchShopSettings = useCallback(async () => {
        try {
            const res = await fetch(`/api/shop/settings?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setShopEnabled(data.shopEnabled ?? true);
            }
        } catch {
            setShopEnabled(true);
        }
    }, []);

    useEffect(() => {
        if (section === 'market') fetchShopSettings();
    }, [section, fetchShopSettings]);

    // Re-fetch shop visibility when user returns to the tab (admin may have toggled)
    useEffect(() => {
        if (section !== 'market') return;
        const onFocus = () => fetchShopSettings();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [section, fetchShopSettings]);

    useEffect(() => {
        if (!shopEnabled && marketSubView === 'shop') setMarketSubView('hub');
    }, [shopEnabled, marketSubView]);

    const fetchOnchainTasks = useCallback(async () => {
        try {
            const response = await fetch(`/api/onchain-tasks?initData=${encodeURIComponent(userTelegramInitData)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch onchain tasks');
            }
            const data = await response.json();
            setOnchainTasks(data);
        } catch (error) {
            console.error('Error fetching onchain tasks:', error);
            showToast("Failed to load onchain tasks", "error");
        }
    }, [userTelegramInitData, showToast]);

    useEffect(() => {
        fetchOnchainTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchOnchainTasks]);

    const saveWalletAddress = useCallback(async (address: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/wallet/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: userTelegramInitData,
                    walletAddress: address,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save wallet address');
            }

            const data = await response.json();
            setTonWalletAddress(data.walletAddress);
            return true;
        } catch (error) {
            console.error('Error saving wallet address:', error);
            return false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userTelegramInitData, setTonWalletAddress]);

    const disconnectWallet = useCallback(async () => {
        try {
            const response = await fetch('/api/wallet/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    initData: userTelegramInitData,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to disconnect wallet');
            }
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            throw error;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userTelegramInitData]);

    const handleWalletConnection = useCallback(async (address: string) => {
        setIsLoading(true);
        try {
            const success = await saveWalletAddress(address);
            if (!success) {
                if (tonConnectUI.account?.address) {
                    await tonConnectUI.disconnect();
                }
                showToast("Failed to save wallet address. Please try connecting again.", "error");
            } else {
                showToast("Wallet connected successfully!", "success");
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            showToast("An error occurred while connecting the wallet.", "error");
        } finally {
            setIsLoading(false);
            setIsConnecting(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [saveWalletAddress, showToast, tonConnectUI]);

    const handleWalletDisconnection = useCallback(async () => {
        setIsLoading(true);
        try {
            await disconnectWallet();
            setTonWalletAddress(null);
            showToast("Wallet disconnected successfully!", "success");
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            showToast("An error occurred while disconnecting the wallet.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [disconnectWallet, setTonWalletAddress, showToast]);

    useEffect(() => {
        const unsubscribe = tonConnectUI.onStatusChange(
            async (wallet) => {
                if (wallet && isConnecting) {
                    await handleWalletConnection(wallet.account.address);
                } else if (!wallet && !isConnecting) {
                    await handleWalletDisconnection();
                }
            },
            (err) => {
                // Handle TonConnect errors (e.g. "Operation aborted" when user closes modal)
                if (err?.message?.includes('Operation aborted') || err?.message?.includes('aborted')) {
                    setIsConnecting(false);
                    return;
                }
                console.warn('TonConnect error:', err);
                setIsConnecting(false);
                showToast('Wallet connection was interrupted. Please try again.', 'error');
            }
        );

        return () => {
            unsubscribe();
        };
    }, [tonConnectUI, handleWalletConnection, handleWalletDisconnection, isConnecting, showToast]);

    const handleWalletAction = async () => {
        triggerHapticFeedback(window);
        try {
            if (tonConnectUI.account?.address) {
                await tonConnectUI.disconnect();
            } else {
                setIsConnecting(true);
                await tonConnectUI.openModal();
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('Operation aborted') || msg.includes('aborted')) {
                setIsConnecting(false);
                return; // User closed modal - no need to show error
            }
            setIsConnecting(false);
            console.error('TonConnect wallet action error:', err);
            showToast('Wallet action failed. Please try again.', 'error');
        }
    };

    const formatAddress = (address: string) => {
        const tempAddress = Address.parse(address).toString();
        return `${tempAddress.slice(0, 4)}...${tempAddress.slice(-4)}`;
    };

    const copyToClipboard = () => {
        if (tonWalletAddress) {
            triggerHapticFeedback(window);
            navigator.clipboard.writeText(tonWalletAddress);
            setCopied(true);
            showToast("Address copied to clipboard!", "success");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOnchainTaskClick = (task: OnchainTask) => {
        if (!task.isCompleted) {
            triggerHapticFeedback(window);
            setSelectedOnchainTask(task);
        }
    };

    const handleTaskUpdate = useCallback((updatedTask: OnchainTask) => {
        setOnchainTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === updatedTask.id ? updatedTask : t
            )
        );
    }, []);

    return (
        <div className="bg-black flex justify-center min-h-screen">
            <div className="w-full bg-black text-white font-bold flex flex-col max-w-xl">
                <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
                    <div className="mt-[2px] bg-[#1d2025] rounded-t-[46px] h-full overflow-y-auto no-scrollbar">
                        <div className="px-4 pt-1 pb-24">
                            <div className="relative mt-4">
                                <div className="flex justify-center mb-4">
                                    <Image src={pearlWhite} alt="White Pearl" width={96} height={96} className="rounded-full mr-2" />
                                </div>
                                <h1 className="text-2xl text-center mb-2">Airdrop & Market</h1>
                                <p className="text-gray-300 text-center mb-4 font-normal">
                                    {section === 'airdrop' ? 'Complete challenges to qualify for the Airdrop. Connect wallet and view rankings.' : 'P2P coming soon. Shop: list products and sell for PEARLS.'}
                                </p>

                                <div className="flex gap-1 p-1 rounded-xl bg-[#1a1c22] border border-[#2d2f38] mb-6">
                                    <button
                                        type="button"
                                        onClick={() => { triggerHapticFeedback(window); setSection('airdrop'); }}
                                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold ${section === 'airdrop' ? 'bg-[#f3ba2f] text-black' : 'text-gray-400 hover:text-white hover:bg-[#272a2f]'}`}
                                    >
                                        Airdrop
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { triggerHapticFeedback(window); setSection('market'); }}
                                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold ${section === 'market' ? 'bg-[#f3ba2f] text-black' : 'text-gray-400 hover:text-white hover:bg-[#272a2f]'}`}
                                    >
                                        <span className="block">Market</span>
                                        <span className="block text-[10px] font-normal opacity-80">P2P & Shop</span>
                                    </button>
                                </div>

                                {section === 'market' ? (
                                    marketSubView === 'hub' ? (
                                        <div className="space-y-4">
                                            <p className="text-gray-400 text-sm text-center">Choose a section</p>
                                            <button
                                                type="button"
                                                className="w-full py-6 px-4 rounded-xl bg-[#272a2f] border border-[#3d4046] text-left hover:border-amber-500/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-lg font-semibold text-white">P2P</div>
                                                        <div className="text-gray-400 text-sm">Trade PEARLS for TON with others</div>
                                                    </div>
                                                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">Coming soon</span>
                                                </div>
                                            </button>
                                            {shopEnabled && (
                                                <button
                                                    type="button"
                                                    onClick={() => { triggerHapticFeedback(window); setMarketSubView('shop'); }}
                                                    className="w-full py-6 px-4 rounded-xl bg-[#272a2f] border border-[#3d4046] text-left hover:border-[#f3ba2f]/50 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-lg font-semibold text-[#f3ba2f]">Shop (Match 2 Earn)</div>
                                                            <div className="text-gray-400 text-sm">List products, sell for PEARLS</div>
                                                        </div>
                                                        <Angle size={24} className="text-[#f3ba2f]" />
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <ShopSection
                                            onBack={() => setMarketSubView('hub')}
                                            userTelegramInitData={userTelegramInitData}
                                        />
                                    )
                                ) : (
                                <>
                                {/* Global Rankings Button */}
                                <button
                                    onClick={() => {
                                        triggerHapticFeedback(window);
                                        setShowRankings(true);
                                    }}
                                    className="w-full bg-gradient-to-r from-[#f3ba2f] to-[#e6a422] text-black font-bold py-4 px-6 rounded-xl mb-6 flex items-center justify-between hover:from-[#e6a422] hover:to-[#d99a1c] transition-all shadow-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center text-xl">
                                            🏆
                                        </div>
                                        <div className="text-left">
                                            <div className="text-lg">Country Ranking</div>
                                            <div className="text-sm opacity-75">View players by country</div>
                                        </div>
                                    </div>
                                    <Angle size={32} className="text-black" />
                                </button>
                                <h2 className="text-base mt-8 mb-4">Wallet</h2>

                                {isLoading ? (
                                    <div className="flex justify-between items-center bg-[#272a2f] rounded-lg p-4 w-full">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse mr-2"></div>
                                            <div className="flex flex-col">
                                                <div className="w-32 h-4 bg-gray-300 rounded animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
                                    </div>
                                ) : !tonWalletAddress ? (
                                    <button
                                        onClick={handleWalletAction}
                                        className="flex justify-between items-center bg-[#319ee0] rounded-lg p-4 cursor-pointer w-full"
                                        disabled={isLoading}
                                    >
                                        <div className="flex items-center">
                                            <Image src={tonWallet} alt="Ton wallet" width={40} height={40} className="rounded-lg mr-2" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">Connect your TON wallet</span>
                                            </div>
                                        </div>
                                        <Angle size={42} className="text-white" />
                                    </button>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleWalletAction}
                                            className="w-12 h-12 bg-[#33363b] rounded-lg text-white font-bold flex items-center justify-center"
                                            disabled={isLoading}
                                        >
                                            <Cross className="text-[#8b8e93]" />
                                        </button>
                                        <button
                                            onClick={copyToClipboard}
                                            className="flex-grow justify-between py-3 bg-[#33363b] rounded-lg text-white font-medium"
                                            disabled={isLoading}
                                        >
                                            <div className="w-full flex justify-between px-4 items-center">
                                                <div className="flex items-center gap-2">
                                                    <Wallet className="text-[#8b8e93]" />
                                                    <span>{formatAddress(tonWalletAddress)}</span>
                                                </div>
                                                <div>
                                                    <Copy className="text-[#8b8e93]" />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                )}
                                <TransfersSection userTelegramInitData={userTelegramInitData} />
                                <h2 className="text-base mt-8 mb-4">Tasks</h2>
                                <div className="space-y-2">
                                    {onchainTasks.map((task) => (
                                        <button
                                            key={task.id}
                                            className="w-full flex justify-between items-center bg-[#272a2f] rounded-lg p-4"
                                            onClick={() => handleOnchainTaskClick(task)}
                                        >
                                            <div className="flex items-center">
                                                <Image
                                                    src={task.collectionMetadata.image}
                                                    alt={task.collectionMetadata.name}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-lg mr-2"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{task.collectionMetadata.name}</span>
                                                    <div className="flex items-center">
                                                        <IceCube className="w-6 h-6 mr-1" />
                                                        <span className="text-white">+{task.points}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {task.isCompleted ? (
                                                <svg
                                                    className="w-6 h-6 text-green-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            ) : (
                                                <span>{formatTON(task.price)} TON</span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {selectedOnchainTask && (
                <OnchainTaskPopup
                    task={selectedOnchainTask}
                    onClose={() => setSelectedOnchainTask(null)}
                    onUpdate={handleTaskUpdate}
                />
            )}
            {showRankings && (
                <GlobalRankingPopup onClose={() => setShowRankings(false)} />
            )}
        </div>
    );
}

// Helper function to format TON amount
function formatTON(nanoTON: string): string {
    return (parseInt(nanoTON) / 1e9).toFixed(2);
}