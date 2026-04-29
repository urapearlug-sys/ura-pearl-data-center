// app/clicker/page.tsx

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

import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import Game from '@/components/Game';

function useExitFullscreenWhenOpenedViaOpenButton() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tryExit = () => {
      const tg = (window as unknown as { Telegram?: { WebApp?: { exitFullscreen?: () => void } } }).Telegram?.WebApp;
      if (tg?.exitFullscreen) tg.exitFullscreen();
    };
    tryExit();
    const t = setTimeout(tryExit, 600);
    return () => clearTimeout(t);
  }, []);
}
import Mine from '@/components/Mine';
import Friends from '@/components/Friends';
import Earn from '@/components/Earn';
import Airdrop from '@/components/Airdrop';
import Navigation from '@/components/Navigation';
import LoadingScreen from '@/components/Loading';
import { energyUpgradeBaseBenefit } from '@/utils/consts';
import Boost from '@/components/Boost';
import { AutoIncrement } from '@/components/AutoIncrement';
import { PointSynchronizer } from '@/components/PointSynchronizer';
import Settings from '@/components/Settings';
import Collection from '@/components/Collection';

function EmptyPrimaryPage() {
    return <div className="bg-black min-h-screen" />;
}

const MORE_VIEWS = new Set(['game', 'mine', 'collection', 'friends', 'airdrop']);

function ClickerPage() {
    useExitFullscreenWhenOpenedViaOpenButton();
    const [currentView, setCurrentViewState] = useState<string>('loading');
    const [isInitialized, setIsInitialized] = useState(false);

    const setCurrentView = (newView: string) => {
        console.log('Changing view to:', newView);
        setCurrentViewState(newView);
    };

    const renderCurrentView = useCallback(() => {
        if (!isInitialized) {
            return <LoadingScreen
                setIsInitialized={setIsInitialized}
                setCurrentView={setCurrentView}
            />;
        }

        switch (currentView) {
            case 'home':
                return <EmptyPrimaryPage />;
            case 'game':
                return <Game
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />;
            case 'boost':
                return <Boost
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />;
            case 'settings':
                return <Settings setCurrentView={setCurrentView} />;
            case 'mine':
                return <Mine setCurrentView={setCurrentView} />;
            case 'friends':
                return <Friends />;
            case 'eearn':
                return <EmptyPrimaryPage />;
            case 'services':
                return <EmptyPrimaryPage />;
            case 'guild':
                return <EmptyPrimaryPage />;
            case 'earn':
                return <Earn setCurrentView={setCurrentView} minimalOnly />;
            case 'airdrop':
                return <Airdrop />;
            case 'collection':
                return <Collection setCurrentView={setCurrentView} />;
            default:
                return <EmptyPrimaryPage />;
        }
    }, [currentView, isInitialized]);

    return (
        <div className="bg-black min-h-screen text-white tg-safe-area-padding">
            {
                isInitialized &&
                <>
                    <AutoIncrement />
                    <PointSynchronizer />
                </>
            }
            {renderCurrentView()}
            {isInitialized && MORE_VIEWS.has(currentView) && (
                <button
                    type="button"
                    onClick={() => setCurrentView('earn')}
                    className="fixed top-4 left-4 z-50 rounded-lg bg-black/65 border border-[#3d4046] px-3 py-1.5 text-sm font-semibold text-white"
                >
                    ← Back
                </button>
            )}
            {isInitialized && currentView !== 'loading' && (
                <Navigation
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                />
            )}
        </div>
    );
}

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.log('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong.</h1>;
        }

        return this.props.children;
    }
}

function ClickerPageWithErrorBoundary() {
    return (
        <ErrorBoundary>
            <ClickerPage />
        </ErrorBoundary>
    );
}

// Avoid React #419: "server could not finish this Suspense boundary". Render the app only
// after client mount so TonConnect / Zustand / browser APIs never run during SSR.
export default function ClickerPageClientOnly() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return (
            <div className="bg-black min-h-screen text-white flex items-center justify-center tg-safe-area-padding">
                <div className="w-8 h-8 border-4 border-[#f3ba2f] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }
    return <ClickerPageWithErrorBoundary />;
}